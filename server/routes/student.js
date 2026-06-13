import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import prisma from '../db.js';

const router = express.Router();

router.use(protect, authorize('student'));

// @route   GET /api/student/programs
// @desc    Get approved programs
router.get('/programs', async (req, res) => {
  try {
    const programs = await prisma.program.findMany({ where: { approved: true } });
    res.json(programs);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving programs.' });
  }
});

// @route   GET /api/student/search
// @desc    Search students for group team invites
router.get('/search', async (req, res) => {
  const { query } = req.query;
  if (!query) return res.json([]);

  try {
    const currentStudent = await prisma.student.findUnique({ where: { userId: req.user.id } });
    if (!currentStudent) return res.status(404).json({ message: 'Student profile not found.' });

    const matches = await prisma.student.findMany({
      where: {
        id: { not: currentStudent.id },
        OR: [
          { name: { contains: query } },
          { studentId: { contains: query } }
        ]
      },
      take: 10
    });

    res.json(matches);
  } catch (error) {
    res.status(500).json({ message: 'Search failed.' });
  }
});

// @route   POST /api/student/registrations
// @desc    Register for a program (single or group)
router.post('/registrations', async (req, res) => {
  const { programId, type, teamName, memberIds } = req.body;

  try {
    const student = await prisma.student.findUnique({ where: { userId: req.user.id } });
    if (!student) return res.status(404).json({ message: 'Student profile not found.' });

    const program = await prisma.program.findUnique({ where: { id: programId } });
    if (!program || !program.approved) return res.status(400).json({ message: 'Program unavailable.' });

    // Validate if deadline passed
    if (program.date && new Date() > new Date(program.date)) {
      return res.status(400).json({ message: 'Registration deadline has passed.' });
    }

    const existingRegs = await prisma.registration.findMany({
      where: { programId },
      include: { group: { include: { members: true } } }
    });
    
    const isAlreadySignedUp = (sId) => {
      return existingRegs.some(r => {
        if (r.studentId === sId) return true;
        if (r.group && r.group.members.some(m => m.id === sId)) return true;
        return false;
      });
    };

    if (isAlreadySignedUp(student.id)) {
      return res.status(400).json({ message: 'You are already registered.' });
    }

    if (type === 'single') {
      const reg = await prisma.registration.create({
        data: { programId, studentId: student.id, type: 'single' }
      });
      return res.status(201).json(reg);
    } else if (type === 'group') {
      if (!teamName) return res.status(400).json({ message: 'Team Name is required.' });

      for (let mId of memberIds) {
        if (isAlreadySignedUp(mId)) {
          const mDoc = await prisma.student.findUnique({ where: { id: mId } });
          return res.status(400).json({ message: `${mDoc?.name || 'Invitee'} is already registered.` });
        }
      }

      const group = await prisma.group.create({
        data: {
          name: teamName,
          leaderId: student.id,
          members: {
            connect: [student.id, ...memberIds].map(id => ({ id }))
          }
        }
      });

      const reg = await prisma.registration.create({
        data: {
          programId,
          studentId: student.id,
          type: 'group',
          groupId: group.id
        }
      });

      return res.status(201).json(reg);
    }
  } catch (error) {
    res.status(500).json({ message: 'Registration failed.', error: error.message });
  }
});

// @route   GET /api/student/registrations/my
// @desc    Get current student registrations
router.get('/registrations/my', async (req, res) => {
  try {
    const student = await prisma.student.findUnique({ where: { userId: req.user.id } });
    if (!student) return res.status(404).json({ message: 'Student profile not found.' });

    const myGroups = await prisma.group.findMany({
      where: {
        members: {
          some: { id: student.id }
        }
      }
    });
    const myGroupIds = myGroups.map(g => g.id);

    const regs = await prisma.registration.findMany({
      where: {
        OR: [
          { studentId: student.id },
          { groupId: { in: myGroupIds } }
        ]
      },
      include: {
        program: true,
        student: true,
        group: { include: { members: true } }
      }
    });
    
    const mappedRegs = regs.map(r => ({
      ...r,
      programId: r.program,
      studentId: r.student,
      groupId: r.group
    }));

    res.json(mappedRegs);
  } catch (error) {
    res.status(500).json({ message: 'Retrieval failed.' });
  }
});

// @route   GET /api/student/schedules
// @desc    Get program schedules
router.get('/schedules', async (req, res) => {
  try {
    const schedules = await prisma.schedule.findMany({
      include: {
        program: { select: { title: true, wing: true } }
      }
    });
    
    const mappedSchedules = schedules.map(s => ({
      ...s,
      programId: s.program
    }));
    
    res.json(mappedSchedules);
  } catch (error) {
    res.status(500).json({ message: 'Schedules load failed.' });
  }
});

// @route   GET /api/student/results/my
// @desc    Get scorecard achievements
router.get('/results/my', async (req, res) => {
  try {
    const student = await prisma.student.findUnique({ where: { userId: req.user.id } });
    if (!student) return res.status(404).json({ message: 'Student profile not found.' });

    const allResults = await prisma.result.findMany({
      include: {
        program: true,
        winners: {
          include: {
            group: {
              include: { members: true }
            }
          }
        }
      }
    });
    const scorecard = [];

    for (let r of allResults) {
      for (let w of r.winners) {
        let isWinnerMatch = false;

        if (r.type === 'single' && w.studentId === student.id) {
          isWinnerMatch = true;
        } else if (r.type === 'group' && w.group) {
          if (w.group.members.some(m => m.id === student.id)) {
            isWinnerMatch = true;
          }
        }

        if (isWinnerMatch) {
          scorecard.push({
            _id: `${r.id}-${w.id}`,
            program: { title: r.program?.title || 'Unknown Event' },
            type: r.type,
            position: w.position,
            marks: w.marks,
            grade: w.grade,
            points: w.points,
            remarks: w.remarks
          });
        }
      }
    }

    res.json(scorecard);
  } catch (error) {
    res.status(500).json({ message: 'Scorecard load failed.' });
  }
});

// @route   GET /api/student/certificates
// @desc    Get certificates earned by student
router.get('/certificates', async (req, res) => {
  try {
    const student = await prisma.student.findUnique({ where: { userId: req.user.id } });
    if (!student) return res.status(404).json({ message: 'Student profile not found.' });

    const certs = await prisma.certificate.findMany({
      where: { studentId: student.id, approved: true },
      include: {
        program: { select: { title: true, wing: true, date: true, venue: true } }
      }
    });
    
    const mappedCerts = certs.map(c => ({
      ...c,
      programId: c.program
    }));
    
    res.json(mappedCerts);
  } catch (error) {
    res.status(500).json({ message: 'Error loading certificates.' });
  }
});

// @route   POST /api/student/publications
// @desc    Submit article / news / publication proposal
router.post('/publications', async (req, res) => {
  const { title, content, language, category, fileUrl } = req.body;

  if (!title || !content || !language || !category) {
    return res.status(400).json({ message: 'Title, content, language, and category are required.' });
  }

  try {
    const student = await prisma.student.findUnique({ where: { userId: req.user.id } });
    if (!student) return res.status(404).json({ message: 'Student profile not found.' });

    const publication = await prisma.publication.create({
      data: {
        title,
        content,
        language,
        category,
        studentId: student.id,
        fileUrl: fileUrl || '',
        status: 'Pending'
      }
    });

    res.status(201).json(publication);
  } catch (error) {
    res.status(500).json({ message: 'Submission failed.', error: error.message });
  }
});

// @route   GET /api/student/publications/my
// @desc    Get student's own submissions
router.get('/publications/my', async (req, res) => {
  try {
    const student = await prisma.student.findUnique({ where: { userId: req.user.id } });
    if (!student) return res.status(404).json({ message: 'Student profile not found.' });

    const pubs = await prisma.publication.findMany({ where: { studentId: student.id } });
    res.json(pubs);
  } catch (error) {
    res.status(500).json({ message: 'Failed to load publications.' });
  }
});

// @route   PUT /api/student/profile
// @desc    Update student profile details
router.put('/profile', async (req, res) => {
  const { phone, email } = req.body;
  try {
    const student = await prisma.student.findUnique({ where: { userId: req.user.id } });
    if (!student) return res.status(404).json({ message: 'Student profile not found.' });

    const updatedStudent = await prisma.student.update({
      where: { id: student.id },
      data: {
        phone: phone !== undefined ? phone : student.phone,
        email: email !== undefined ? email : student.email
      }
    });
    res.json(updatedStudent);
  } catch (error) {
    res.status(500).json({ message: 'Update failed.' });
  }
});

export default router;
