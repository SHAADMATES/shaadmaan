import express from 'express';
import { protect } from '../middleware/auth.js';
import prisma from '../db.js';

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
    const searchParam = `%${query}%`;

    const [students, programs, certificates, books] = await Promise.all([
      prisma.student.findMany({
        where: {
          OR: [
            { name: { contains: query } },
            { studentId: { contains: query } }
          ]
        },
        take: 5
      }),
      prisma.program.findMany({
        where: {
          OR: [
            { title: { contains: query } },
            { venue: { contains: query } }
          ]
        },
        take: 5
      }),
      prisma.certificate.findMany({
        where: { certificateId: { contains: query } },
        include: { student: true, program: true },
        take: 5
      }),
      prisma.library.findMany({
        where: {
          OR: [
            { title: { contains: query } },
            { author: { contains: query } }
          ]
        },
        take: 5
      })
    ]);

    // Map relationships to match mongoose populated field names if frontend expects them
    const mappedCertificates = certificates.map(c => ({
      ...c,
      studentId: c.student,
      programId: c.program
    }));

    res.json({
      students,
      programs,
      certificates: mappedCertificates,
      books
    });
  } catch (error) {
    res.status(500).json({ message: 'Search query failed.', error: error.message });
  }
});

export default router;
