import express from 'express';
import { protect } from '../middleware/auth.js';
import Student from '../models/Student.js';
import Program from '../models/Program.js';
import Certificate from '../models/Certificate.js';
import Library from '../models/Library.js';

const router = express.Router();

router.use(protect);

// @route   GET /api/search
// @desc    Global search across students, programs, certificates, and books
router.get('/', async (req, res) => {
  const { query } = req.query;

  if (!query || query.trim().length < 2) {
    return res.json({ students: [], programs: [], certificates: [], books: [] });
  }

  try {
    const regex = new RegExp(query, 'i');

    const [students, programs, certificates, books] = await Promise.all([
      Student.find({ $or: [{ name: regex }, { studentId: regex }] }).limit(5),
      Program.find({ $or: [{ title: regex }, { venue: regex }] }).limit(5),
      Certificate.find({ certificateId: regex }).populate('studentId').populate('programId').limit(5),
      Library.find({ $or: [{ title: regex }, { author: regex }] }).limit(5)
    ]);

    res.json({
      students,
      programs,
      certificates,
      books
    });
  } catch (error) {
    res.status(500).json({ message: 'Search query failed.', error: error.message });
  }
});

export default router;
