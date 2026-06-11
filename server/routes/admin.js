import express from 'express';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import { protect, authorize } from '../middleware/auth.js';
import User from '../models/User.js';
import Student from '../models/Student.js';
import WingChairman from '../models/WingChairman.js';
import Wing from '../models/Wing.js';
import Program from '../models/Program.js';
import Registration from '../models/Registration.js';
import Schedule from '../models/Schedule.js';
import Result from '../models/Result.js';
import Certificate from '../models/Certificate.js';
import Publication from '../models/Publication.js';
import Library from '../models/Library.js';
import ReportLog from '../models/ReportLog.js';
import AuditLog from '../models/AuditLog.js';
import FormField from '../models/FormField.js';
import SystemSetting from '../models/SystemSetting.js';

const router = express.Router();

// Allow Admin and Super Admin
router.use(protect, authorize('admin', 'super_admin'));

// @route   GET /api/admin/stats
// @desc    Retrieve ERP analytics and metrics
router.get('/stats', async (req, res) => {
  try {
    const totalStudents = await Student.countDocuments();
    const totalWingManagers = await WingChairman.countDocuments(); // keep variable name same for UI compatibility
    const totalPrograms = await Program.countDocuments();
    const totalRegistrations = await Registration.countDocuments();
    const completedPrograms = await Program.countDocuments({
      status: { $in: ['Completed', 'Result Published'] }
    });
    const resultsPublished = await Result.countDocuments();
    const publicationsCount = await Publication.countDocuments({ status: 'Approved' });
    const certificatesIssued = await Certificate.countDocuments();
    
    // Group programs by wing and count
    const wingsData = await Program.aggregate([
      { $group: { _id: '$wing', programsCount: { $sum: 1 } } }
    ]);

    res.json({
      totalStudents,
      totalWingManagers,
      totalPrograms,
      totalRegistrations,
      completedPrograms,
      resultsPublished,
      publicationsCount,
      certificatesIssued,
      wingsData
    });
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving system metrics.', error: error.message });
  }
});

// --- STUDENT CRUD ---
router.get('/students', async (req, res) => {
  try {
    const students = await Student.find().populate('userId', 'username');
    res.json(students);
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
    const userExists = await User.findOne({ username });
    if (userExists) return res.status(400).json({ message: 'Username is taken.' });

    const admExists = await Student.findOne({ admissionNumber });
    if (admExists) return res.status(400).json({ message: 'Admission Number is registered.' });

    const generatedStudentId = studentId || `STU-${Math.random().toString(36).substring(3, 9).toUpperCase()}`;

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      username,
      password: hashedPassword,
      plainPassword: password,
      role: 'student'
    });

    const student = await Student.create({
      userId: user._id,
      name,
      studentId: generatedStudentId,
      admissionNumber,
      class: className || 'Class XII',
      wing,
      dob: dob || new Date(),
      phone: phone || '',
      email: email || '',
      photo: photo || '',
      address: address || ''
    });

    await AuditLog.create({ userId: req.user._id, username: req.user.username, action: 'ADD_STUDENT', details: `Added student: ${name} (${generatedStudentId})` });

    res.status(201).json(student);
  } catch (error) {
    res.status(500).json({ message: 'Registration failed.', error: error.message });
  }
});

router.put('/students/:id', async (req, res) => {
  const { name, studentId, admissionNumber, class: className, wing, dob, phone, email, photo, address, password } = req.body;

  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ message: 'Student not found.' });

    student.name = name || student.name;
    student.class = className || student.class;
    student.wing = wing || student.wing;
    student.dob = dob || student.dob;
    student.phone = phone !== undefined ? phone : student.phone;
    student.email = email !== undefined ? email : student.email;
    student.photo = photo !== undefined ? photo : student.photo;
    student.address = address !== undefined ? address : student.address;

    if (studentId && studentId !== student.studentId) {
      const studentIdExists = await Student.findOne({ studentId });
      if (studentIdExists) return res.status(400).json({ message: 'Student ID is registered.' });
      student.studentId = studentId;
    }

    if (admissionNumber && admissionNumber !== student.admissionNumber) {
      const admExists = await Student.findOne({ admissionNumber });
      if (admExists) return res.status(400).json({ message: 'Admission Number is registered.' });
      student.admissionNumber = admissionNumber;
    }

    await student.save();

    if (password) {
      const user = await User.findById(student.userId);
      if (user) {
        user.password = await bcrypt.hash(password, 10);
        user.plainPassword = password;
        await user.save();
      }
    }

    await AuditLog.create({ userId: req.user._id, username: req.user.username, action: 'UPDATE_STUDENT', details: `Updated student details: ${student.name}` });

    res.json(student);
  } catch (error) {
    res.status(500).json({ message: 'Update failed.', error: error.message });
  }
});

router.delete('/students/:id', async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ message: 'Student not found.' });

    await User.findByIdAndDelete(student.userId);
    await Student.findByIdAndDelete(student._id);
    await Registration.deleteMany({ studentId: student._id });

    await AuditLog.create({ userId: req.user._id, username: req.user.username, action: 'DELETE_STUDENT', details: `Deleted student: ${student.name}` });

    res.json({ message: 'Student deleted.' });
  } catch (error) {
    res.status(500).json({ message: 'Deletion failed.', error: error.message });
  }
});

// --- WING CHAIRMAN CRUD ---
router.get('/wing-managers', async (req, res) => {
  try {
    const managers = await WingChairman.find().populate('userId', 'username');
    res.json(managers);
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
    const userExists = await User.findOne({ username });
    if (userExists) return res.status(400).json({ message: 'Username is taken.' });

    const wingExists = await WingChairman.findOne({ wing });
    if (wingExists) return res.status(400).json({ message: 'Wing already assigned.' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ username, password: hashedPassword, role: 'wing_chairman' });

    const manager = await WingChairman.create({
      userId: user._id,
      name,
      wing,
      phone,
      email
    });

    // Automatically create or update Wing
    let wingDoc = await Wing.findOne({ name: wing });
    if (wingDoc) {
      wingDoc.chairmanId = manager._id;
      await wingDoc.save();
    } else {
      await Wing.create({ name: wing, chairmanId: manager._id });
    }

    await AuditLog.create({ userId: req.user._id, username: req.user.username, action: 'ADD_CHAIRMAN', details: `Added Chairman: ${name} for ${wing}` });

    res.status(201).json(manager);
  } catch (error) {
    res.status(500).json({ message: 'Registration failed.', error: error.message });
  }
});

router.put('/wing-managers/:id', async (req, res) => {
  const { name, wing, phone, email, password } = req.body;

  try {
    const manager = await WingChairman.findById(req.params.id);
    if (!manager) return res.status(404).json({ message: 'Chairman not found.' });

    manager.name = name || manager.name;
    manager.phone = phone !== undefined ? phone : manager.phone;
    manager.email = email !== undefined ? email : manager.email;

    if (wing && wing !== manager.wing) {
      const wingExists = await WingChairman.findOne({ wing });
      if (wingExists) return res.status(400).json({ message: 'Wing already managed.' });
      manager.wing = wing;
    }

    await manager.save();

    if (password) {
      const user = await User.findById(manager.userId);
      if (user) {
        user.password = await bcrypt.hash(password, 10);
        await user.save();
      }
    }

    res.json(manager);
  } catch (error) {
    res.status(500).json({ message: 'Update failed.', error: error.message });
  }
});

router.delete('/wing-managers/:id', async (req, res) => {
  try {
    const manager = await WingChairman.findById(req.params.id);
    if (!manager) return res.status(404).json({ message: 'Chairman not found.' });

    await User.findByIdAndDelete(manager.userId);
    await WingChairman.findByIdAndDelete(manager._id);
    await Wing.findOneAndUpdate({ chairmanId: manager._id }, { $unset: { chairmanId: 1 } });

    res.json({ message: 'Chairman profile deleted.' });
  } catch (error) {
    res.status(500).json({ message: 'Deletion failed.', error: error.message });
  }
});

// --- WING MANAGEMENT ---
router.get('/wings', async (req, res) => {
  try {
    const wings = await Wing.find().populate({
      path: 'chairmanId',
      populate: { path: 'userId', select: 'username plainPassword' }
    });
    res.json(wings);
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
    const userExists = await User.findOne({ username });
    if (userExists) return res.status(400).json({ message: 'Username is taken.' });

    const wingExists = await Wing.findOne({ name });
    if (wingExists) return res.status(400).json({ message: 'Wing name already exists.' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      username,
      password: hashedPassword,
      plainPassword: password,
      role: 'wing_chairman'
    });

    const chairman = await WingChairman.create({
      userId: user._id,
      name: chairmanName,
      wing: name,
      assistantName: assistantName || '',
      photo: logo || ''
    });

    const wing = await Wing.create({
      name,
      logo: logo || '',
      chairmanId: chairman._id,
      description: `Wing managed by ${chairmanName}`
    });

    await AuditLog.create({
      userId: req.user._id,
      username: req.user.username,
      action: 'ADD_WING',
      details: `Added Wing: ${name} with Chairman: ${chairmanName}`
    });

    res.status(201).json({ wing, chairman, user });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create wing package.', error: error.message });
  }
});

router.put('/wings/:id', async (req, res) => {
  const { name, logo, chairmanName, assistantName, username, password } = req.body;
  try {
    const wing = await Wing.findById(req.params.id);
    if (!wing) return res.status(404).json({ message: 'Wing not found.' });

    wing.name = name || wing.name;
    wing.logo = logo !== undefined ? logo : wing.logo;
    await wing.save();

    if (wing.chairmanId) {
      const chairman = await WingChairman.findById(wing.chairmanId);
      if (chairman) {
        chairman.name = chairmanName || chairman.name;
        chairman.wing = wing.name;
        chairman.assistantName = assistantName !== undefined ? assistantName : chairman.assistantName;
        chairman.photo = logo !== undefined ? logo : chairman.photo;
        await chairman.save();

        if (username || password) {
          const user = await User.findById(chairman.userId);
          if (user) {
            if (username && username !== user.username) {
              const userExists = await User.findOne({ username });
              if (userExists) return res.status(400).json({ message: 'Username already taken.' });
              user.username = username;
            }
            if (password) {
              user.password = await bcrypt.hash(password, 10);
              user.plainPassword = password;
            }
            await user.save();
          }
        }
      }
    }

    res.json(wing);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update Wing package.', error: error.message });
  }
});

router.delete('/wings/:id', async (req, res) => {
  try {
    const wing = await Wing.findById(req.params.id);
    if (!wing) return res.status(404).json({ message: 'Wing not found.' });

    if (wing.chairmanId) {
      const chairman = await WingChairman.findById(wing.chairmanId);
      if (chairman) {
        await User.findByIdAndDelete(chairman.userId);
        await WingChairman.findByIdAndDelete(chairman._id);
      }
    }

    await Wing.findByIdAndDelete(wing._id);

    await AuditLog.create({
      userId: req.user._id,
      username: req.user.username,
      action: 'DELETE_WING',
      details: `Deleted Wing: ${wing.name}`
    });

    res.json({ message: 'Wing and associated accounts deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Deletion failed.', error: error.message });
  }
});

// --- PROGRAM APPROVAL & MANAGE ---
router.get('/programs', async (req, res) => {
  try {
    const programs = await Program.find();
    res.json(programs);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving programs.' });
  }
});

router.put('/programs/:id/approve', async (req, res) => {
  const { approved } = req.body;
  try {
    const program = await Program.findById(req.params.id);
    if (!program) return res.status(404).json({ message: 'Program not found.' });

    program.approved = approved;
    program.status = approved ? 'Active' : 'Upcoming';
    await program.save();

    await AuditLog.create({ userId: req.user._id, username: req.user.username, action: 'APPROVE_PROGRAM', details: `Approved program: ${program.title} (${approved})` });

    res.json(program);
  } catch (error) {
    res.status(500).json({ message: 'Approval failed.' });
  }
});

router.delete('/programs/:id', async (req, res) => {
  try {
    await Program.findByIdAndDelete(req.params.id);
    await Schedule.deleteMany({ programId: req.params.id });
    await Registration.deleteMany({ programId: req.params.id });
    await Result.deleteMany({ programId: req.params.id });
    res.json({ message: 'Program deleted.' });
  } catch (error) {
    res.status(500).json({ message: 'Deletion failed.' });
  }
});

// --- SCHEDULES ---
router.get('/schedules', async (req, res) => {
  try {
    const schedules = await Schedule.find().populate('programId', 'title wing');
    res.json(schedules);
  } catch (error) {
    res.status(500).json({ message: 'Error loading schedules.' });
  }
});

router.post('/schedules', async (req, res) => {
  const { programId, date, time, venue, description } = req.body;
  try {
    const schedule = await Schedule.create({ programId, date, time, venue, description });
    res.status(201).json(schedule);
  } catch (error) {
    res.status(400).json({ message: 'Scheduling failed.' });
  }
});

router.put('/schedules/:id', async (req, res) => {
  const { date, time, venue, description } = req.body;
  try {
    const schedule = await Schedule.findById(req.params.id);
    if (!schedule) return res.status(404).json({ message: 'Schedule not found.' });
    schedule.date = date || schedule.date;
    schedule.time = time || schedule.time;
    schedule.venue = venue || schedule.venue;
    schedule.description = description !== undefined ? description : schedule.description;
    await schedule.save();
    res.json(schedule);
  } catch (error) {
    res.status(400).json({ message: 'Update failed.' });
  }
});

router.delete('/schedules/:id', async (req, res) => {
  try {
    await Schedule.findByIdAndDelete(req.params.id);
    res.json({ message: 'Schedule deleted.' });
  } catch (error) {
    res.status(500).json({ message: 'Deletion failed.' });
  }
});

// --- RESULTS ---
router.post('/results', async (req, res) => {
  const { programId, type, winners } = req.body;

  try {
    let result = await Result.findOne({ programId });
    if (result) {
      result.winners = winners;
      await result.save();
    } else {
      result = await Result.create({ programId, type, winners });
    }

    // Automatically trigger Certificate Generation for Winners (1st, 2nd, 3rd)
    for (let w of winners) {
      if (['1st', '2nd', '3rd'].includes(w.position)) {
        const certId = `CERT-${programId.toString().substring(18)}-${Math.random().toString(36).substring(7).toUpperCase()}`;
        
        if (type === 'single' && w.studentId) {
          // Check duplicate before creation
          const certExists = await Certificate.findOne({ studentId: w.studentId, programId });
          if (!certExists) {
            await Certificate.create({
              certificateId: certId,
              studentId: w.studentId,
              programId,
              position: w.position,
              grade: w.grade
            });
          }
        } else if (type === 'group' && w.groupId) {
          // Generate certificate for each group member
          const group = await Group.findById(w.groupId);
          if (group) {
            for (let mId of group.members) {
              const memberCertExists = await Certificate.findOne({ studentId: mId, programId });
              if (!memberCertExists) {
                const memberCertId = `CERT-${programId.toString().substring(18)}-${Math.random().toString(36).substring(7).toUpperCase()}`;
                await Certificate.create({
                  certificateId: memberCertId,
                  studentId: mId,
                  programId,
                  position: w.position,
                  grade: w.grade
                });
              }
            }
          }
        }
      }
    }

    await Program.findByIdAndUpdate(programId, { status: 'Result Published' });

    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ message: 'Result publication failed.', error: error.message });
  }
});

// --- CERTIFICATES ---
router.get('/certificates', async (req, res) => {
  try {
    const certs = await Certificate.find().populate('studentId').populate('programId');
    res.json(certs);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving certificates.' });
  }
});

router.post('/certificates', async (req, res) => {
  const { studentId, programId, position, grade } = req.body;
  try {
    const certificateId = `CERT-${programId.substring(18)}-${Math.random().toString(36).substring(7).toUpperCase()}`;
    const cert = await Certificate.create({ certificateId, studentId, programId, position, grade });
    res.status(201).json(cert);
  } catch (error) {
    res.status(400).json({ message: 'Manual generation failed.' });
  }
});

router.delete('/certificates/:id', async (req, res) => {
  try {
    await Certificate.findByIdAndDelete(req.params.id);
    res.json({ message: 'Certificate revoked.' });
  } catch (error) {
    res.status(500).json({ message: 'Revocation failed.' });
  }
});

// --- PUBLICATIONS APPROVALS ---
router.get('/publications', async (req, res) => {
  try {
    const pubs = await Publication.find().populate('studentId');
    res.json(pubs);
  } catch (error) {
    res.status(500).json({ message: 'Error loading publications.' });
  }
});

router.put('/publications/:id/status', async (req, res) => {
  const { status } = req.body;
  try {
    const pub = await Publication.findById(req.params.id);
    if (!pub) return res.status(404).json({ message: 'Publication not found.' });

    pub.status = status;
    await pub.save();

    res.json(pub);
  } catch (error) {
    res.status(500).json({ message: 'Review failed.' });
  }
});

// --- FORM FIELDS MANAGEMENT ---
router.get('/form-fields', async (req, res) => {
  try {
    const fields = await FormField.find();
    res.json(fields);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving form fields.' });
  }
});

router.get('/form-fields/:formName', async (req, res) => {
  try {
    const fields = await FormField.find({ formName: req.params.formName });
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
    const field = await FormField.create({ formName, label, name, type, required: !!required });
    res.status(201).json(field);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create form field.' });
  }
});

router.delete('/form-fields/:id', async (req, res) => {
  try {
    await FormField.findByIdAndDelete(req.params.id);
    res.json({ message: 'Form field deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete form field.' });
  }
});

// --- AUDIT LOGGER & REPORTS ---
router.post('/reports/log', async (req, res) => {
  const { title, type } = req.body;
  try {
    const reportLog = await ReportLog.create({ title, type });
    res.status(201).json(reportLog);
  } catch (error) {
    res.status(500).json({ message: 'Audit failed.' });
  }
});

// --- ADMIN SYSTEM USER MANAGEMENT ---
router.get('/users', async (req, res) => {
  try {
    const users = await User.find().select('-password');
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
    const userExists = await User.findOne({ username });
    if (userExists) return res.status(400).json({ message: 'Username is taken.' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      username,
      password: hashedPassword,
      plainPassword: password,
      role
    });

    await AuditLog.create({
      userId: req.user._id,
      username: req.user.username,
      action: 'ADD_USER',
      details: `Admin created user account @${username} with role ${role}`
    });

    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create user account.', error: error.message });
  }
});

// @route   POST /api/admin/upload
// @desc    Upload image (Base64) and save to server uploads/ directory
router.post('/upload', async (req, res) => {
  const { image } = req.body;
  if (!image) {
    return res.status(400).json({ message: 'No image data provided.' });
  }

  try {
    const matches = image.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return res.status(400).json({ message: 'Invalid image format. Expected dataURI base64.' });
    }

    const mimeType = matches[1];
    const ext = mimeType.split('/')[1] || 'png';
    const buffer = Buffer.from(matches[2], 'base64');
    const filename = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;

    const uploadsDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir);
    }

    fs.writeFileSync(path.join(uploadsDir, filename), buffer);
    const fileUrl = `http://localhost:5000/uploads/${filename}`;
    res.json({ url: fileUrl });
  } catch (error) {
    res.status(500).json({ message: 'Image upload failed.', error: error.message });
  }
});

// @route   GET /api/admin/programs/:programId/registrations
// @desc    Get all registrations for a program
router.get('/programs/:programId/registrations', async (req, res) => {
  try {
    const regs = await Registration.find({ programId: req.params.programId })
      .populate('programId')
      .populate('studentId')
      .populate({
        path: 'groupId',
        populate: { path: 'members' }
      });
    res.json(regs);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving registrations.', error: error.message });
  }
});

// @route   GET /api/admin/settings
// @desc    Get system settings
router.get('/settings', async (req, res) => {
  try {
    let settings = await SystemSetting.findOne();
    if (!settings) {
      settings = await SystemSetting.create({});
    }
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving settings.', error: error.message });
  }
});

// @route   POST /api/admin/settings
// @desc    Create/Update system settings
router.post('/settings', async (req, res) => {
  const { orgName, orgLogo, orgEmail, signatureUrl } = req.body;
  try {
    let settings = await SystemSetting.findOne();
    if (!settings) {
      settings = await SystemSetting.create({ orgName, orgLogo, orgEmail, signatureUrl });
    } else {
      settings.orgName = orgName !== undefined ? orgName : settings.orgName;
      settings.orgLogo = orgLogo !== undefined ? orgLogo : settings.orgLogo;
      settings.orgEmail = orgEmail !== undefined ? orgEmail : settings.orgEmail;
      settings.signatureUrl = signatureUrl !== undefined ? signatureUrl : settings.signatureUrl;
      await settings.save();
    }

    await AuditLog.create({
      userId: req.user._id,
      username: req.user.username,
      action: 'UPDATE_SETTINGS',
      details: 'Updated global system settings and signature.'
    });

    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: 'Error updating settings.', error: error.message });
  }
});

// @route   PUT /api/admin/certificates/:id/approve
// @desc    Approve/revoke certificate
router.put('/certificates/:id/approve', async (req, res) => {
  const { approved } = req.body;
  try {
    const cert = await Certificate.findById(req.params.id);
    if (!cert) return res.status(404).json({ message: 'Certificate not found.' });

    cert.approved = approved;
    await cert.save();

    await AuditLog.create({
      userId: req.user._id,
      username: req.user.username,
      action: approved ? 'APPROVE_CERTIFICATE' : 'REVOKE_CERTIFICATE_APPROVAL',
      details: `Certificate ${cert.certificateId} approval status set to ${approved}`
    });

    res.json(cert);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update certificate approval.', error: error.message });
  }
});

export default router;
