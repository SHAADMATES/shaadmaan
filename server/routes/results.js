import express from 'express';
import prisma from '../db.js';

const router = express.Router();

// @route   GET /api/results/settings
// @desc    Get public system settings (branding, signature URL)
router.get('/settings', async (req, res) => {
  try {
    let settings = await prisma.systemSetting.findFirst();
    if (!settings) {
      settings = await prisma.systemSetting.create({ data: {} });
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
    const result = await prisma.result.findFirst({
      where: { programId: req.params.programId },
      include: {
        winners: {
          include: {
            student: true,
            group: {
              include: {
                members: true
              }
            }
          }
        }
      }
    });

    if (!result) {
      return res.status(404).json({ message: 'Standings results not yet published for this program.' });
    }

    // Map relationships to match mongoose populated field names
    const mappedResult = {
      ...result,
      winners: result.winners.map(w => ({
        ...w,
        studentId: w.student,
        groupId: w.group
      }))
    };

    res.json(mappedResult);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching standings results.', error: error.message });
  }
});

// @route   GET /api/results/certificate/verify/:certId
// @desc    Verify a certificate's authenticity by ID (public, only if approved)
router.get('/certificate/verify/:certId', async (req, res) => {
  try {
    const cert = await prisma.certificate.findFirst({
      where: { certificateId: req.params.certId, approved: true },
      include: {
        student: true,
        program: true
      }
    });

    if (!cert) {
      return res.status(404).json({ message: 'Certificate not found or not yet approved. Verification failed.' });
    }

    // Map relationships to match mongoose populated field names
    const mappedCert = {
      ...cert,
      studentId: cert.student,
      programId: cert.program
    };

    res.json(mappedCert);
  } catch (error) {
    res.status(500).json({ message: 'Error verifying certificate authenticity.', error: error.message });
  }
});

// @route   GET /api/results/wings/list
// @desc    Get all wings with chairman populated for public landing page
router.get('/wings/list', async (req, res) => {
  try {
    const wings = await prisma.wing.findMany({
      include: {
        chairman: true
      }
    });
    
    const mappedWings = wings.map(w => ({
      ...w,
      chairmanId: w.chairman
    }));
    
    res.json(mappedWings);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving wings.' });
  }
});

export default router;
