import express from 'express';
import prisma from '../db.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// GET all active announcements (accessible by all authenticated roles)
router.get('/', protect, async (req, res) => {
  try {
    const announcements = await prisma.reportLog.findMany({
      where: { type: 'announcement' },
      orderBy: { generatedAt: 'desc' },
      take: 20
    });
    
    // Parse JSON details if stored as string
    const formatted = announcements.map(a => {
      let details = {};
      try {
        details = typeof a.details === 'string' ? JSON.parse(a.details) : (a.details || {});
      } catch {
        details = { text: a.details };
      }
      return {
        id: a.id,
        _id: a.id,
        title: a.programId || 'System Broadcast',
        content: details.content || details.text || '',
        priority: details.priority || 'info',
        audience: details.audience || 'all',
        createdAt: a.generatedAt || new Date(),
        wing: a.wing || 'System'
      };
    });

    res.json(formatted);
  } catch (error) {
    console.error('Error fetching announcements:', error);
    res.status(500).json({ message: 'Failed to retrieve announcements' });
  }
});

// POST new announcement (Admin & Super Admin only)
router.post('/', protect, authorize('super_admin', 'admin'), async (req, res) => {
  try {
    const { title, content, priority = 'info', audience = 'all', wing = 'System' } = req.body;

    if (!title || !content) {
      return res.status(400).json({ message: 'Title and content are required' });
    }

    const newAnnouncement = await prisma.reportLog.create({
      data: {
        type: 'announcement',
        programId: title,
        wing: wing,
        details: JSON.stringify({
          content,
          priority,
          audience,
          createdBy: req.user?.username || 'admin'
        })
      }
    });

    res.status(201).json({
      id: newAnnouncement.id,
      _id: newAnnouncement.id,
      title,
      content,
      priority,
      audience,
      createdAt: newAnnouncement.generatedAt || new Date(),
      wing
    });
  } catch (error) {
    console.error('Error creating announcement:', error);
    res.status(500).json({ message: 'Failed to create announcement' });
  }
});

// DELETE announcement (Admin & Super Admin only)
router.delete('/:id', protect, authorize('super_admin', 'admin'), async (req, res) => {
  try {
    await prisma.reportLog.delete({
      where: { id: req.params.id }
    });
    res.json({ message: 'Announcement deleted successfully' });
  } catch (error) {
    console.error('Error deleting announcement:', error);
    res.status(500).json({ message: 'Failed to delete announcement' });
  }
});

export default router;
