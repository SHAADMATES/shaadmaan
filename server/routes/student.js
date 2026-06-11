import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import Student from '../models/Student.js';
import Program from '../models/Program.js';
import Registration from '../models/Registration.js';
import Group from '../models/Group.js';
import Schedule from '../models/Schedule.js';
import Result from '../models/Result.js';
import Certificate from '../models/Certificate.js';
import Library from '../models/Library.js';
import Publication from '../models/Publication.js';

const router = express.Router();

router.use(protect, authorize('student'));

// @route   GET /api/student/programs
// @desc    Get approved programs
router.get('/programs', async (req, res) => {
  try {
    const programs = await Program.find({ approved: true });
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
    const currentStudent = await Student.findOne({ userId: req.user._id });
    if (!currentStudent) return res.status(404).json({ message: 'Student profile not found.' });

    const matches = await Student.find({
      _id: { $ne: currentStudent._id },
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { studentId: { $regex: query, $options: 'i' } }
      ]
    }).limit(10);

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
    const student = await Student.findOne({ userId: req.user._id });
    if (!student) return res.status(404).json({ message: 'Student profile not found.' });

    const program = await Program.findById(programId);
    if (!program || !program.approved) return res.status(400).json({ message: 'Program unavailable.' });

    // Validate if deadline passed
    if (program.registrationDeadline && new Date() > new Date(program.registrationDeadline)) {
      return res.status(400).json({ message: 'Registration deadline has passed.' });
    }

    const existingRegs = await Registration.find({ programId }).populate('groupId');
    const isAlreadySignedUp = (sId) => {
      return existingRegs.some(r => {
        if (r.studentId.toString() === sId.toString()) return true;
        if (r.groupId && r.groupId.members.some(m => m.toString() === sId.toString())) return true;
        return false;
      });
    };

    if (isAlreadySignedUp(student._id)) {
      return res.status(400).json({ message: 'You are already registered.' });
    }

    if (type === 'single') {
      const reg = await Registration.create({ programId, studentId: student._id, type: 'single' });
      return res.status(201).json(reg);
    } else if (type === 'group') {
      if (!teamName) return res.status(400).json({ message: 'Team Name is required.' });

      for (let mId of memberIds) {
        if (isAlreadySignedUp(mId)) {
          const mDoc = await Student.findById(mId);
          return res.status(400).json({ message: `${mDoc?.name || 'Invitee'} is already registered.` });
        }
      }

      const group = await Group.create({
        name: teamName,
        leaderId: student._id,
        members: [student._id, ...memberIds]
      });

      const reg = await Registration.create({
        programId,
        studentId: student._id,
        type: 'group',
        groupId: group._id
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
    const student = await Student.findOne({ userId: req.user._id });
    if (!student) return res.status(404).json({ message: 'Student profile not found.' });

    const myGroups = await Group.find({ members: student._id });
    const myGroupIds = myGroups.map(g => g._id);

    const regs = await Registration.find({
      $or: [
        { studentId: student._id },
        { groupId: { $in: myGroupIds } }
      ]
    })
      .populate('programId')
      .populate('studentId')
      .populate({
        path: 'groupId',
        populate: { path: 'members' }
      });

    res.json(regs);
  } catch (error) {
    res.status(500).json({ message: 'Retrieval failed.' });
  }
});

// @route   GET /api/student/schedules
// @desc    Get program schedules
router.get('/schedules', async (req, res) => {
  try {
    const schedules = await Schedule.find().populate('programId', 'title wing');
    res.json(schedules);
  } catch (error) {
    res.status(500).json({ message: 'Schedules load failed.' });
  }
});

// @route   GET /api/student/results/my
// @desc    Get scorecard achievements
router.get('/results/my', async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.user._id });
    if (!student) return res.status(404).json({ message: 'Student profile not found.' });

    const allResults = await Result.find().populate('programId');
    const scorecard = [];

    for (let r of allResults) {
      for (let w of r.winners) {
        let isWinnerMatch = false;

        if (r.type === 'single' && w.studentId && w.studentId.toString() === student._id.toString()) {
          isWinnerMatch = true;
        } else if (r.type === 'group' && w.groupId) {
          const group = await Group.findById(w.groupId);
          if (group && group.members.some(m => m.toString() === student._id.toString())) {
            isWinnerMatch = true;
          }
        }

        if (isWinnerMatch) {
          scorecard.push({
            _id: `${r._id}-${w._id}`,
            program: { title: r.programId?.title || 'Unknown Event' },
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
    const student = await Student.findOne({ userId: req.user._id });
    if (!student) return res.status(404).json({ message: 'Student profile not found.' });

    const certs = await Certificate.find({ studentId: student._id, approved: true })
      .populate('programId', 'title wing date venue');
    res.json(certs);
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
    const student = await Student.findOne({ userId: req.user._id });
    if (!student) return res.status(404).json({ message: 'Student profile not found.' });

    const publication = await Publication.create({
      title,
      content,
      language,
      category,
      studentId: student._id,
      fileUrl: fileUrl || '',
      status: 'Pending'
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
    const student = await Student.findOne({ userId: req.user._id });
    if (!student) return res.status(404).json({ message: 'Student profile not found.' });

    const pubs = await Publication.find({ studentId: student._id });
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
    const student = await Student.findOne({ userId: req.user._id });
    if (!student) return res.status(404).json({ message: 'Student profile not found.' });

    student.phone = phone !== undefined ? phone : student.phone;
    student.email = email !== undefined ? email : student.email;
    await student.save();
    res.json(student);
  } catch (error) {
    res.status(500).json({ message: 'Update failed.' });
  }
});

export default router;
