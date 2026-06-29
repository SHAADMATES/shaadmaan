import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import prisma from '../db.js';

const router = express.Router();

// Apply auth middleware for all routes
router.use(protect);

// @route   GET /api/outreach
// @desc    Get all outreach achievements
router.get('/', authorize('admin', 'super_admin'), async (req, res) => {
  try {
    const outreaches = await prisma.outreach.findMany({
      include: {
        student: true
      },
      orderBy: { programDate: 'desc' }
    });
    res.json(outreaches);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch outreaches', error: error.message });
  }
});

// @route   POST /api/outreach
// @desc    Add a new outreach achievement
router.post('/', authorize('admin', 'super_admin'), async (req, res) => {
  const { studentId, programDate, organization, type, position } = req.body;

  if (!studentId || !programDate || !organization || !type) {
    return res.status(400).json({ message: 'Please provide all required fields' });
  }

  try {
    const outreach = await prisma.outreach.create({
      data: {
        studentId,
        programDate: new Date(programDate),
        organization,
        type,
        position: position || ""
      }
    });

    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        username: req.user.username,
        action: 'ADD_OUTREACH',
        details: `Added outreach for student ID: ${studentId}`
      }
    });

    res.status(201).json(outreach);
  } catch (error) {
    res.status(500).json({ message: 'Failed to add outreach', error: error.message });
  }
});

// @route   DELETE /api/outreach/:id
// @desc    Delete an outreach record
router.delete('/:id', authorize('admin', 'super_admin'), async (req, res) => {
  try {
    await prisma.outreach.delete({
      where: { id: req.params.id }
    });
    
    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        username: req.user.username,
        action: 'DELETE_OUTREACH',
        details: `Deleted outreach record ID: ${req.params.id}`
      }
    });

    res.json({ message: 'Outreach deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete outreach', error: error.message });
  }
});

export default router;
