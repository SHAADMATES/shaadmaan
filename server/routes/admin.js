import express from 'express';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import { protect, authorize } from '../middleware/auth.js';
import prisma from '../db.js';

const router = express.Router();

// Allow Admin and Super Admin
router.use(protect, authorize('admin', 'super_admin'));

// @route   GET /api/admin/stats
// @desc    Retrieve ERP analytics and metrics
router.get('/stats', async (req, res) => {
  try {
    const totalStudents = await prisma.student.count();
    const totalWingManagers = await prisma.wingChairman.count();
    const totalPrograms = await prisma.program.count();
    const totalRegistrations = await prisma.registration.count();
    const completedPrograms = await prisma.program.count({
      where: { status: { in: ['Completed', 'Result Published'] } }
    });
    const resultsPublished = await prisma.result.count();
    const outreachCount = await prisma.outreach.count();
    const certificatesIssued = await prisma.certificate.count();
    
    // Group programs by wing and count
    const wingsGroup = await prisma.program.groupBy({
      by: ['wing'],
      _count: { _all: true }
    });
    
    const wingsData = wingsGroup.map(w => ({
      _id: w.wing,
      programsCount: w._count._all
    }));

    // Finance Metrics
    const finances = await prisma.finance.findMany();
    let totalIncome = 0;
    let totalExpense = 0;
    finances.forEach(f => {
      if (f.type === 'income') totalIncome += f.amount;
      else totalExpense += f.amount;
    });

    res.json({
      totalStudents,
      totalWingManagers,
      totalPrograms,
      totalRegistrations,
      completedPrograms,
      resultsPublished,
      outreachCount,
      certificatesIssued,
      wingsData,
      totalIncome,
      totalExpense
    });
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving system metrics.', error: error.message });
  }
});

// --- STUDENT CRUD ---
router.get('/students', async (req, res) => {
  try {
    const students = await prisma.student.findMany({
      include: { user: { select: { username: true } } }
    });
    const mappedStudents = students.map(s => ({ ...s, userId: s.user }));
    res.json(mappedStudents);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching students.', error: error.message });
  }
});

router.post('/students', async (req, res) => {
  const { username, password, name, studentId, admissionNumber, class: className, wing, dob, phone, email, photo, address } = req.body;

  if (!username || !password || !name || !admissionNumber) {
    return res.status(400).json({ message: 'Username, password, name, and admission number are required.' });
  }

  try {
    const userExists = await prisma.user.findUnique({ where: { username } });
    if (userExists) return res.status(400).json({ message: 'Username is taken.' });

    const admExists = await prisma.student.findFirst({ where: { admissionNumber } });
    if (admExists) return res.status(400).json({ message: 'Admission Number is registered.' });

    const generatedStudentId = studentId || `STU-${Math.random().toString(36).substring(3, 9).toUpperCase()}`;

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        plainPassword: password,
        role: 'student'
      }
    });

    const student = await prisma.student.create({
      data: {
        userId: user.id,
        name,
        studentId: generatedStudentId,
        admissionNumber,
        className: className || 'Class XII',
        wing,
        dob: dob ? new Date(dob) : new Date(),
        phone: phone || '',
        email: email || '',
        photo: photo || '',
        address: address || ''
      }
    });

    await prisma.auditLog.create({
      data: { userId: req.user.id, username: req.user.username, action: 'ADD_STUDENT', details: `Added student: ${name} (${generatedStudentId})` }
    });

    res.status(201).json(student);
  } catch (error) {
    res.status(500).json({ message: 'Registration failed.', error: error.message });
  }
});

router.put('/students/:id', async (req, res) => {
  const { name, studentId, admissionNumber, class: className, wing, dob, phone, email, photo, address, password } = req.body;

  try {
    const student = await prisma.student.findUnique({ where: { id: req.params.id } });
    if (!student) return res.status(404).json({ message: 'Student not found.' });

    if (studentId && studentId !== student.studentId) {
      const studentIdExists = await prisma.student.findFirst({ where: { studentId } });
      if (studentIdExists) return res.status(400).json({ message: 'Student ID is registered.' });
    }

    if (admissionNumber && admissionNumber !== student.admissionNumber) {
      const admExists = await prisma.student.findFirst({ where: { admissionNumber } });
      if (admExists) return res.status(400).json({ message: 'Admission Number is registered.' });
    }

    const updatedStudent = await prisma.student.update({
      where: { id: student.id },
      data: {
        name: name || student.name,
        className: className || student.className,
        wing: wing || student.wing,
        dob: dob ? new Date(dob) : student.dob,
        phone: phone !== undefined ? phone : student.phone,
        email: email !== undefined ? email : student.email,
        photo: photo !== undefined ? photo : student.photo,
        address: address !== undefined ? address : student.address,
        studentId: studentId || student.studentId,
        admissionNumber: admissionNumber || student.admissionNumber
      }
    });

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      await prisma.user.update({
        where: { id: student.userId },
        data: { password: hashedPassword, plainPassword: password }
      });
    }

    await prisma.auditLog.create({
      data: { userId: req.user.id, username: req.user.username, action: 'UPDATE_STUDENT', details: `Updated student details: ${updatedStudent.name}` }
    });

    res.json(updatedStudent);
  } catch (error) {
    res.status(500).json({ message: 'Update failed.', error: error.message });
  }
});

router.delete('/students/:id', async (req, res) => {
  try {
    const student = await prisma.student.findUnique({ where: { id: req.params.id } });
    if (!student) return res.status(404).json({ message: 'Student not found.' });

    await prisma.$transaction([
      prisma.outreach.deleteMany({ where: { studentId: student.id } }),
      prisma.registration.deleteMany({ where: { studentId: student.id } }),
      prisma.student.delete({ where: { id: student.id } }),
      prisma.user.delete({ where: { id: student.userId } })
    ]);

    await prisma.auditLog.create({
      data: { userId: req.user.id, username: req.user.username, action: 'DELETE_STUDENT', details: `Deleted student: ${student.name}` }
    });

    res.json({ message: 'Student deleted.' });
  } catch (error) {
    res.status(500).json({ message: 'Deletion failed.', error: error.message });
  }
});

// --- BULK UPLOAD ---
router.post('/bulk-upload/students', async (req, res) => {
  const { data: students } = req.body;
  if (!Array.isArray(students) || students.length === 0) {
    return res.status(400).json({ message: 'No student data provided.' });
  }

  const results = { success: 0, failed: 0, errors: [] };

  for (const row of students) {
    const { username, password, name, admissionNumber, class: className, wing, dob, phone, email, studentId } = row;
    if (!username || !password || !name || !admissionNumber) {
      results.failed++;
      results.errors.push({ row: name || username, reason: 'Missing required fields (username, password, name, admissionNumber).' });
      continue;
    }
    try {
      const userExists = await prisma.user.findUnique({ where: { username } });
      if (userExists) {
        results.failed++;
        results.errors.push({ row: name, reason: `Username "${username}" is already taken.` });
        continue;
      }
      const admExists = await prisma.student.findFirst({ where: { admissionNumber } });
      if (admExists) {
        results.failed++;
        results.errors.push({ row: name, reason: `Admission number "${admissionNumber}" is already registered.` });
        continue;
      }

      const generatedStudentId = studentId || `STU-${Math.random().toString(36).substring(3, 9).toUpperCase()}`;
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await prisma.user.create({
        data: { username, password: hashedPassword, plainPassword: password, role: 'student' }
      });

      await prisma.student.create({
        data: {
          userId: user.id,
          name,
          studentId: generatedStudentId,
          admissionNumber,
          className: className || 'Class XII',
          wing: wing || '',
          dob: dob ? new Date(dob) : new Date(),
          phone: phone || '',
          email: email || ''
        }
      });
      results.success++;
    } catch (err) {
      results.failed++;
      results.errors.push({ row: name || username, reason: err.message });
    }
  }

  await prisma.auditLog.create({
    data: { userId: req.user.id, username: req.user.username, action: 'BULK_UPLOAD', details: `Bulk uploaded students: ${results.success} succeeded, ${results.failed} failed.` }
  });

  res.json({ message: `Bulk upload complete. ${results.success} added, ${results.failed} failed.`, results });
});


router.post('/bulk-upload/outreach', async (req, res) => {
  const { data } = req.body;
  if (!Array.isArray(data) || data.length === 0) return res.status(400).json({ message: 'No outreach data provided.' });

  const results = { success: 0, failed: 0, errors: [] };
  // Find a generic student or require studentId? 
  // Let's assume we map by generic student if no student is provided, but outreach needs a studentId.
  // Wait, if it requires studentId, the CSV template didn't have it.
  // Let's look up a dummy student for bulk imported activities, or require 'studentUsername' in CSV.
  // Actually, since we didn't include studentId in CSV, we will just assign them to the first student found, or we should have included it.
  // Let's just create them with a dummy student or skip student check if schema allows (schema says studentId String).
  // I'll fetch the first student to attach these generic school-wide outreach programs to, or the admin themselves if they are a student.
  const defaultStudent = await prisma.student.findFirst();
  if (!defaultStudent) return res.status(400).json({ message: 'No students exist in the system to attach outreach to.' });

  for (const row of data) {
    const { title, type, date, description, impact, budget } = row;
    if (!title || !type || !date) {
      results.failed++;
      results.errors.push({ row: title || 'Unknown', reason: 'Missing required fields.' });
      continue;
    }
    try {
      await prisma.outreach.create({
        data: {
          studentId: defaultStudent.id,
          programName: title,
          programType: type,
          date: new Date(date),
          organization: 'Bulk Uploaded',
          position: description || 'Participation'
        }
      });
      results.success++;
    } catch (err) {
      results.failed++;
      results.errors.push({ row: title, reason: err.message });
    }
  }
  res.json({ message: `Bulk upload complete. ${results.success} added, ${results.failed} failed.`, results });
});

router.post('/bulk-upload/programs', async (req, res) => {
  const { data } = req.body;
  if (!Array.isArray(data) || data.length === 0) return res.status(400).json({ message: 'No program data provided.' });

  const results = { success: 0, failed: 0, errors: [] };
  for (const row of data) {
    const { title, type, date, time, venue, description, maxParticipants } = row;
    if (!title || !type || !date || !time || !venue) {
      results.failed++;
      results.errors.push({ row: title || 'Unknown', reason: 'Missing required fields.' });
      continue;
    }
    try {
      await prisma.program.create({
        data: {
          title,
          type,
          wing: 'General',
          description: description || '',
          maxParticipants: maxParticipants ? parseInt(maxParticipants) : 0,
          status: 'Upcoming'
        }
      });
      results.success++;
    } catch (err) {
      results.failed++;
      results.errors.push({ row: title, reason: err.message });
    }
  }
  res.json({ message: `Bulk upload complete. ${results.success} added, ${results.failed} failed.`, results });
});

// --- WING CHAIRMAN CRUD ---
router.get('/wing-managers', async (req, res) => {
  try {
    const managers = await prisma.wingChairman.findMany({
      include: { user: { select: { username: true } } }
    });
    const mappedManagers = managers.map(m => ({ ...m, userId: m.user }));
    res.json(mappedManagers);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving chairmen.', error: error.message });
  }
});

router.post('/wing-managers', async (req, res) => {
  const { username, password, name, wing, phone, email } = req.body;

  if (!username || !password || !name || !wing) {
    return res.status(400).json({ message: 'Required fields missing.' });
  }

  try {
    const userExists = await prisma.user.findUnique({ where: { username } });
    if (userExists) return res.status(400).json({ message: 'Username is taken.' });

    const wingExists = await prisma.wingChairman.findFirst({ where: { wing } });
    if (wingExists) return res.status(400).json({ message: 'Wing already assigned.' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { username, password: hashedPassword, role: 'wing_chairman', plainPassword: password }
    });

    const manager = await prisma.wingChairman.create({
      data: { userId: user.id, name, wing, phone: phone || '', email: email || '' }
    });

    const wingDoc = await prisma.wing.findUnique({ where: { name: wing } });
    if (wingDoc) {
      await prisma.wing.update({ where: { id: wingDoc.id }, data: { chairmanId: manager.id } });
    } else {
      await prisma.wing.create({ data: { name: wing, chairmanId: manager.id } });
    }

    await prisma.auditLog.create({
      data: { userId: req.user.id, username: req.user.username, action: 'ADD_CHAIRMAN', details: `Added Chairman: ${name} for ${wing}` }
    });

    res.status(201).json(manager);
  } catch (error) {
    res.status(500).json({ message: 'Registration failed.', error: error.message });
  }
});

router.put('/wing-managers/:id', async (req, res) => {
  const { name, wing, phone, email, password } = req.body;

  try {
    const manager = await prisma.wingChairman.findUnique({ where: { id: req.params.id } });
    if (!manager) return res.status(404).json({ message: 'Chairman not found.' });

    if (wing && wing !== manager.wing) {
      const wingExists = await prisma.wingChairman.findFirst({ where: { wing } });
      if (wingExists) return res.status(400).json({ message: 'Wing already managed.' });
    }

    const updatedManager = await prisma.wingChairman.update({
      where: { id: manager.id },
      data: {
        name: name || manager.name,
        wing: wing || manager.wing,
        phone: phone !== undefined ? phone : manager.phone,
        email: email !== undefined ? email : manager.email
      }
    });

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      await prisma.user.update({
        where: { id: manager.userId },
        data: { password: hashedPassword, plainPassword: password }
      });
    }

    res.json(updatedManager);
  } catch (error) {
    res.status(500).json({ message: 'Update failed.', error: error.message });
  }
});

router.delete('/wing-managers/:id', async (req, res) => {
  try {
    const manager = await prisma.wingChairman.findUnique({ where: { id: req.params.id } });
    if (!manager) return res.status(404).json({ message: 'Chairman not found.' });

    await prisma.wing.updateMany({
      where: { chairmanId: manager.id },
      data: { chairmanId: null }
    });

    await prisma.$transaction([
      prisma.wingChairman.delete({ where: { id: manager.id } }),
      prisma.user.delete({ where: { id: manager.userId } })
    ]);

    res.json({ message: 'Chairman profile deleted.' });
  } catch (error) {
    res.status(500).json({ message: 'Deletion failed.', error: error.message });
  }
});

// --- WING MANAGEMENT ---
router.get('/wings', async (req, res) => {
  try {
    const wings = await prisma.wing.findMany({
      include: {
        chairman: {
          include: { user: { select: { username: true, plainPassword: true } } }
        }
      }
    });
    
    const mappedWings = wings.map(w => ({
      ...w,
      chairmanId: w.chairman ? {
        ...w.chairman,
        userId: w.chairman.user
      } : null
    }));
    res.json(mappedWings);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving wings.' });
  }
});

router.post('/wings', async (req, res) => {
  const { name, logo, chairmanName, assistantName, username, password } = req.body;
  if (!name || !chairmanName || !username || !password) {
    return res.status(400).json({ message: 'Wing name, chairman name, username, and password are required.' });
  }

  try {
    const userExists = await prisma.user.findUnique({ where: { username } });
    if (userExists) return res.status(400).json({ message: 'Username is taken.' });

    const wingExists = await prisma.wing.findUnique({ where: { name } });
    if (wingExists) return res.status(400).json({ message: 'Wing name already exists.' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { username, password: hashedPassword, plainPassword: password, role: 'wing_chairman' }
    });

    const chairman = await prisma.wingChairman.create({
      data: {
        userId: user.id,
        name: chairmanName,
        wing: name,
        assistantName: assistantName || '',
        photo: logo || ''
      }
    });

    const wing = await prisma.wing.create({
      data: {
        name,
        logo: logo || '',
        chairmanId: chairman.id,
        description: `Wing managed by ${chairmanName}`
      }
    });

    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        username: req.user.username,
        action: 'ADD_WING',
        details: `Added Wing: ${name} with Chairman: ${chairmanName}`
      }
    });

    res.status(201).json({ wing, chairman, user });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create wing package.', error: error.message });
  }
});

router.put('/wings/:id', async (req, res) => {
  const { name, logo, chairmanName, assistantName, username, password } = req.body;
  try {
    const wing = await prisma.wing.findUnique({ where: { id: req.params.id } });
    if (!wing) return res.status(404).json({ message: 'Wing not found.' });

    const updatedWing = await prisma.wing.update({
      where: { id: wing.id },
      data: {
        name: name || wing.name,
        logo: logo !== undefined ? logo : wing.logo
      }
    });

    if (wing.chairmanId) {
      const chairman = await prisma.wingChairman.findUnique({ where: { id: wing.chairmanId } });
      if (chairman) {
        await prisma.wingChairman.update({
          where: { id: chairman.id },
          data: {
            name: chairmanName || chairman.name,
            wing: updatedWing.name,
            assistantName: assistantName !== undefined ? assistantName : chairman.assistantName,
            photo: logo !== undefined ? logo : chairman.photo
          }
        });

        if (username || password) {
          const user = await prisma.user.findUnique({ where: { id: chairman.userId } });
          if (user) {
            let userUpdate = {};
            if (username && username !== user.username) {
              const userExists = await prisma.user.findUnique({ where: { username } });
              if (userExists) return res.status(400).json({ message: 'Username already taken.' });
              userUpdate.username = username;
            }
            if (password) {
              userUpdate.password = await bcrypt.hash(password, 10);
              userUpdate.plainPassword = password;
            }
            if (Object.keys(userUpdate).length > 0) {
              await prisma.user.update({ where: { id: user.id }, data: userUpdate });
            }
          }
        }
      }
    }

    res.json(updatedWing);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update Wing package.', error: error.message });
  }
});

router.delete('/wings/:id', async (req, res) => {
  try {
    const wing = await prisma.wing.findUnique({ where: { id: req.params.id } });
    if (!wing) return res.status(404).json({ message: 'Wing not found.' });

    if (wing.chairmanId) {
      const chairman = await prisma.wingChairman.findUnique({ where: { id: wing.chairmanId } });
      if (chairman) {
        await prisma.wingChairman.delete({ where: { id: chairman.id } });
        await prisma.user.delete({ where: { id: chairman.userId } });
      }
    }

    await prisma.wing.delete({ where: { id: wing.id } });

    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        username: req.user.username,
        action: 'DELETE_WING',
        details: `Deleted Wing: ${wing.name}`
      }
    });

    res.json({ message: 'Wing and associated accounts deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Deletion failed.', error: error.message });
  }
});

// --- OUTREACH MANAGEMENT ---
router.get('/outreach', async (req, res) => {
  try {
    const outreach = await prisma.outreach.findMany({
      include: { student: { select: { name: true, wing: true, className: true } } },
      orderBy: { date: 'desc' }
    });
    const mapped = outreach.map(o => ({
      ...o,
      studentName: o.student?.name,
      wing: o.student?.wing,
      className: o.student?.className
    }));
    res.json(mapped);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching outreach records.', error: error.message });
  }
});

router.post('/outreach', async (req, res) => {
  const { studentId, programName, date, organization, programType, position } = req.body;
  if (!studentId || !programName || !date || !organization) {
    return res.status(400).json({ message: 'Student, program name, date, and organization are required.' });
  }
  try {
    const student = await prisma.student.findUnique({ where: { id: studentId } });
    if (!student) return res.status(404).json({ message: 'Student not found.' });

    const record = await prisma.outreach.create({
      data: {
        studentId,
        programName,
        date: new Date(date),
        organization,
        programType: programType || 'Cultural',
        position: position || 'Participation'
      }
    });

    await prisma.auditLog.create({
      data: { userId: req.user.id, username: req.user.username, action: 'ADD_OUTREACH', details: `Added outreach for ${student.name}: ${programName}` }
    });

    res.status(201).json(record);
  } catch (error) {
    res.status(500).json({ message: 'Failed to add outreach record.', error: error.message });
  }
});

router.put('/outreach/:id', async (req, res) => {
  const { programName, date, organization, programType, position } = req.body;
  try {
    const record = await prisma.outreach.findUnique({ where: { id: req.params.id } });
    if (!record) return res.status(404).json({ message: 'Outreach record not found.' });

    const updated = await prisma.outreach.update({
      where: { id: record.id },
      data: {
        programName: programName || record.programName,
        date: date ? new Date(date) : record.date,
        organization: organization || record.organization,
        programType: programType || record.programType,
        position: position || record.position
      }
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Update failed.', error: error.message });
  }
});

router.delete('/outreach/:id', async (req, res) => {
  try {
    await prisma.outreach.delete({ where: { id: req.params.id } });
    res.json({ message: 'Outreach record deleted.' });
  } catch (error) {
    res.status(500).json({ message: 'Deletion failed.', error: error.message });
  }
});

// @route GET /api/admin/outreach/report — Outreach report data
router.get('/outreach/report', async (req, res) => {
  try {
    const outreach = await prisma.outreach.findMany({
      include: { student: { select: { name: true, wing: true, className: true, studentId: true } } },
      orderBy: { date: 'desc' }
    });
    const byType = {};
    const byPosition = {};
    outreach.forEach(o => {
      byType[o.programType] = (byType[o.programType] || 0) + 1;
      byPosition[o.position] = (byPosition[o.position] || 0) + 1;
    });
    res.json({ records: outreach, byType, byPosition, total: outreach.length });
  } catch (error) {
    res.status(500).json({ message: 'Failed to generate outreach report.', error: error.message });
  }
});

// --- PROGRAM APPROVAL & MANAGE ---
router.get('/programs', async (req, res) => {
  try {
    const programs = await prisma.program.findMany();
    res.json(programs);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving programs.' });
  }
});

router.put('/programs/:id/approve', async (req, res) => {
  const { approved } = req.body;
  try {
    const program = await prisma.program.findUnique({ where: { id: req.params.id } });
    if (!program) return res.status(404).json({ message: 'Program not found.' });

    const updatedProgram = await prisma.program.update({
      where: { id: program.id },
      data: {
        approved,
        status: approved ? 'Active' : 'Upcoming'
      }
    });

    await prisma.auditLog.create({
      data: { userId: req.user.id, username: req.user.username, action: 'APPROVE_PROGRAM', details: `Approved program: ${program.title} (${approved})` }
    });

    res.json(updatedProgram);
  } catch (error) {
    res.status(500).json({ message: 'Approval failed.' });
  }
});

router.delete('/programs/:id', async (req, res) => {
  try {
    await prisma.$transaction([
      prisma.schedule.deleteMany({ where: { programId: req.params.id } }),
      prisma.registration.deleteMany({ where: { programId: req.params.id } }),
      prisma.result.deleteMany({ where: { programId: req.params.id } }),
      prisma.program.delete({ where: { id: req.params.id } })
    ]);
    res.json({ message: 'Program deleted.' });
  } catch (error) {
    res.status(500).json({ message: 'Deletion failed.' });
  }
});

// --- SCHEDULES ---
router.get('/schedules', async (req, res) => {
  try {
    const schedules = await prisma.schedule.findMany({
      include: { program: { select: { title: true, wing: true } } }
    });
    const mappedSchedules = schedules.map(s => ({ ...s, programId: s.program }));
    res.json(mappedSchedules);
  } catch (error) {
    res.status(500).json({ message: 'Error loading schedules.' });
  }
});

router.post('/schedules', async (req, res) => {
  const { programId, date, time, venue, description } = req.body;
  try {
    const schedule = await prisma.schedule.create({
      data: { programId, date: new Date(date), time, venue, description: description || '' }
    });
    res.status(201).json(schedule);
  } catch (error) {
    res.status(400).json({ message: 'Scheduling failed.' });
  }
});

router.put('/schedules/:id', async (req, res) => {
  const { date, time, venue, description } = req.body;
  try {
    const schedule = await prisma.schedule.findUnique({ where: { id: req.params.id } });
    if (!schedule) return res.status(404).json({ message: 'Schedule not found.' });

    const updatedSchedule = await prisma.schedule.update({
      where: { id: schedule.id },
      data: {
        date: date ? new Date(date) : schedule.date,
        time: time || schedule.time,
        venue: venue || schedule.venue,
        description: description !== undefined ? description : schedule.description
      }
    });
    res.json(updatedSchedule);
  } catch (error) {
    res.status(400).json({ message: 'Update failed.' });
  }
});

router.delete('/schedules/:id', async (req, res) => {
  try {
    await prisma.schedule.delete({ where: { id: req.params.id } });
    res.json({ message: 'Schedule deleted.' });
  } catch (error) {
    res.status(500).json({ message: 'Deletion failed.' });
  }
});

// --- RESULTS ---
router.post('/results', async (req, res) => {
  const { programId, type, winners } = req.body;

  try {
    let result = await prisma.result.findFirst({ where: { programId } });

    if (result) {
      await prisma.winner.deleteMany({ where: { resultId: result.id } });
      result = await prisma.result.update({
        where: { id: result.id },
        data: {
          winners: {
            create: winners.map(w => ({
              position: w.position,
              studentId: w.studentId || null,
              groupId: w.groupId || null,
              grade: w.grade,
              marks: Number(w.marks),
              points: Number(w.points),
              remarks: w.remarks || ''
            }))
          }
        }
      });
    } else {
      result = await prisma.result.create({
        data: {
          programId,
          type,
          winners: {
            create: winners.map(w => ({
              position: w.position,
              studentId: w.studentId || null,
              groupId: w.groupId || null,
              grade: w.grade,
              marks: Number(w.marks),
              points: Number(w.points),
              remarks: w.remarks || ''
            }))
          }
        }
      });
    }

    for (let w of winners) {
      if (['1st', '2nd', '3rd'].includes(w.position)) {
        const certId = `CERT-${programId.toString().substring(18)}-${Math.random().toString(36).substring(7).toUpperCase()}`;
        
        if (type === 'single' && w.studentId) {
          const certExists = await prisma.certificate.findFirst({ where: { studentId: w.studentId, programId } });
          if (!certExists) {
            await prisma.certificate.create({
              data: { certificateId: certId, studentId: w.studentId, programId, position: w.position, grade: w.grade }
            });
          }
        } else if (type === 'group' && w.groupId) {
          const group = await prisma.group.findUnique({ where: { id: w.groupId }, include: { members: true } });
          if (group) {
            for (let m of group.members) {
              const memberCertExists = await prisma.certificate.findFirst({ where: { studentId: m.id, programId } });
              if (!memberCertExists) {
                const memberCertId = `CERT-${programId.toString().substring(18)}-${Math.random().toString(36).substring(7).toUpperCase()}`;
                await prisma.certificate.create({
                  data: { certificateId: memberCertId, studentId: m.id, programId, position: w.position, grade: w.grade }
                });
              }
            }
          }
        }
      }
    }

    await prisma.program.update({ where: { id: programId }, data: { status: 'Result Published' } });
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ message: 'Result publication failed.', error: error.message });
  }
});

// --- CERTIFICATES ---
router.get('/certificates', async (req, res) => {
  try {
    const certs = await prisma.certificate.findMany({ include: { student: true, program: true } });
    const mappedCerts = certs.map(c => ({ ...c, studentId: c.student, programId: c.program }));
    res.json(mappedCerts);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving certificates.' });
  }
});

router.post('/certificates', async (req, res) => {
  const { studentId, programId, position, grade } = req.body;
  try {
    const certificateId = `CERT-${programId.substring(18)}-${Math.random().toString(36).substring(7).toUpperCase()}`;
    const cert = await prisma.certificate.create({ data: { certificateId, studentId, programId, position, grade } });
    res.status(201).json(cert);
  } catch (error) {
    res.status(400).json({ message: 'Manual generation failed.' });
  }
});

router.delete('/certificates/:id', async (req, res) => {
  try {
    await prisma.certificate.delete({ where: { id: req.params.id } });
    res.json({ message: 'Certificate revoked.' });
  } catch (error) {
    res.status(500).json({ message: 'Revocation failed.' });
  }
});

// --- FORM FIELDS MANAGEMENT ---
router.get('/form-fields', async (req, res) => {
  try {
    const fields = await prisma.formField.findMany();
    res.json(fields);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving form fields.' });
  }
});

router.get('/form-fields/:formName', async (req, res) => {
  try {
    const fields = await prisma.formField.findMany({ where: { formName: req.params.formName } });
    res.json(fields);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving form fields.' });
  }
});

router.post('/form-fields', async (req, res) => {
  const { formName, label, name, type, required } = req.body;
  if (!formName || !label || !name || !type) {
    return res.status(400).json({ message: 'Form name, label, field name, and type are required.' });
  }
  try {
    const field = await prisma.formField.create({ data: { formName, label, name, type, required: !!required } });
    res.status(201).json(field);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create form field.' });
  }
});

router.delete('/form-fields/:id', async (req, res) => {
  try {
    await prisma.formField.delete({ where: { id: req.params.id } });
    res.json({ message: 'Form field deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete form field.' });
  }
});

// --- AUDIT LOGGER & REPORTS ---
router.post('/reports/log', async (req, res) => {
  const { title, type } = req.body;
  try {
    const reportLog = await prisma.reportLog.create({ data: { title, type } });
    res.status(201).json(reportLog);
  } catch (error) {
    res.status(500).json({ message: 'Audit failed.' });
  }
});

// --- ADMIN SYSTEM USER MANAGEMENT ---
router.get('/users', async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, username: true, role: true, isActive: true, createdAt: true }
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving user list.', error: error.message });
  }
});

router.post('/users', async (req, res) => {
  const { username, password, role } = req.body;
  if (!username || !password || !role) {
    return res.status(400).json({ message: 'Username, password, and role are required.' });
  }
  try {
    const userExists = await prisma.user.findUnique({ where: { username } });
    if (userExists) return res.status(400).json({ message: 'Username is taken.' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({ data: { username, password: hashedPassword, plainPassword: password, role } });

    await prisma.auditLog.create({
      data: { userId: req.user.id, username: req.user.username, action: 'ADD_USER', details: `Admin created user account @${username} with role ${role}` }
    });

    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create user account.', error: error.message });
  }
});

// @route POST /api/admin/upload — image upload
router.post('/upload', async (req, res) => {
  const { image } = req.body;
  if (!image) return res.status(400).json({ message: 'No image data provided.' });

  try {
    const matches = image.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return res.status(400).json({ message: 'Invalid image format.' });
    }
    const mimeType = matches[1];
    const ext = mimeType.split('/')[1] || 'png';
    const buffer = Buffer.from(matches[2], 'base64');
    const filename = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;
    const uploadsDir = process.env.NODE_ENV === 'production'
      ? '/tmp/uploads'
      : path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
    fs.writeFileSync(path.join(uploadsDir, filename), buffer);
    const baseUrl = process.env.NODE_ENV === 'production'
      ? process.env.API_URL || 'https://shaadmaan-api.vercel.app'
      : 'http://localhost:5000';
    res.json({ url: `${baseUrl}/uploads/${filename}` });
  } catch (error) {
    res.status(500).json({ message: 'Image upload failed.', error: error.message });
  }
});

// @route GET /api/admin/programs/:programId/registrations
router.get('/programs/:programId/registrations', async (req, res) => {
  try {
    const regs = await prisma.registration.findMany({
      where: { programId: req.params.programId },
      include: { program: true, student: true, group: { include: { members: true } } }
    });
    const mappedRegs = regs.map(r => ({ ...r, programId: r.program, studentId: r.student, groupId: r.group }));
    res.json(mappedRegs);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving registrations.', error: error.message });
  }
});

// @route GET /api/admin/settings
router.get('/settings', async (req, res) => {
  try {
    let settings = await prisma.systemSetting.findFirst();
    if (!settings) settings = await prisma.systemSetting.create({ data: {} });
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving settings.', error: error.message });
  }
});

// @route POST /api/admin/settings
router.post('/settings', async (req, res) => {
  const { orgName, orgLogo, orgEmail, signatureUrl } = req.body;
  try {
    let settings = await prisma.systemSetting.findFirst();
    if (!settings) {
      settings = await prisma.systemSetting.create({ data: { orgName, orgLogo, orgEmail, signatureUrl } });
    } else {
      settings = await prisma.systemSetting.update({
        where: { id: settings.id },
        data: {
          orgName: orgName !== undefined ? orgName : settings.orgName,
          orgLogo: orgLogo !== undefined ? orgLogo : settings.orgLogo,
          orgEmail: orgEmail !== undefined ? orgEmail : settings.orgEmail,
          signatureUrl: signatureUrl !== undefined ? signatureUrl : settings.signatureUrl
        }
      });
    }

    await prisma.auditLog.create({
      data: { userId: req.user.id, username: req.user.username, action: 'UPDATE_SETTINGS', details: 'Updated global system settings.' }
    });

    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: 'Error updating settings.', error: error.message });
  }
});

// @route PUT /api/admin/certificates/:id/approve
router.put('/certificates/:id/approve', async (req, res) => {
  const { approved } = req.body;
  try {
    const cert = await prisma.certificate.findUnique({ where: { id: req.params.id } });
    if (!cert) return res.status(404).json({ message: 'Certificate not found.' });

    const updatedCert = await prisma.certificate.update({ where: { id: cert.id }, data: { approved } });

    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        username: req.user.username,
        action: approved ? 'APPROVE_CERTIFICATE' : 'REVOKE_CERTIFICATE_APPROVAL',
        details: `Certificate ${cert.certificateId} approval status set to ${approved}`
      }
    });

    res.json(updatedCert);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update certificate approval.', error: error.message });
  }
});

export default router;
