import express from 'express';
import Result from '../models/Result.js';
import Certificate from '../models/Certificate.js';
import SystemSetting from '../models/SystemSetting.js';

const router = express.Router();

// @route   GET /api/results/settings
// @desc    Get public system settings (branding, signature URL)
router.get('/settings', async (req, res) => {
  try {
    let settings = await SystemSetting.findOne();
    if (!settings) {
      settings = await SystemSetting.create({});
    }
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving settings.' });
  }
});

// @route   GET /api/results/:programId
// @desc    Get results standings for a specific program
router.get('/:programId', async (req, res) => {
  try {
    const result = await Result.findOne({ programId: req.params.programId })
      .populate('winners.studentId')
      .populate({
        path: 'winners.groupId',
        populate: { path: 'members' }
      });

    if (!result) {
      return res.status(404).json({ message: 'Standings results not yet published for this program.' });
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching standings results.', error: error.message });
  }
});

// @route   GET /api/results/certificate/verify/:certId
// @desc    Verify a certificate's authenticity by ID (public, only if approved)
router.get('/certificate/verify/:certId', async (req, res) => {
  try {
    const cert = await Certificate.findOne({ certificateId: req.params.certId, approved: true })
      .populate('studentId')
      .populate('programId');

    if (!cert) {
      return res.status(404).json({ message: 'Certificate not found or not yet approved. Verification failed.' });
    }

    res.json(cert);
  } catch (error) {
    res.status(500).json({ message: 'Error verifying certificate authenticity.', error: error.message });
  }
});

// @route   GET /api/results/wings/list
// @desc    Get all wings with chairman populated for public landing page
router.get('/wings/list', async (req, res) => {
  try {
    const Wing = (await import('../models/Wing.js')).default;
    const wings = await Wing.find().populate('chairmanId');
    res.json(wings);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving wings.' });
  }
});

export default router;
