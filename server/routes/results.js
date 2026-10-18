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

// @route   GET /api/results/top-performers
// @desc    Get top performing students based on points and standings
router.get('/top-performers', async (req, res) => {
  try {
    const students = await prisma.student.findMany({
      include: {
        wonResults: {
          include: {
            result: {
              include: {
                program: true
              }
            }
          }
        },
        certificates: true
      }
    });

    const performers = students.map(s => {
      const totalPoints = s.wonResults.reduce((sum, w) => sum + (w.points || 0), 0);
      const firstPlaces = s.wonResults.filter(w => w.position === '1st').length;
      const secondPlaces = s.wonResults.filter(w => w.position === '2nd').length;
      const thirdPlaces = s.wonResults.filter(w => w.position === '3rd').length;
      const totalEvents = s.wonResults.length;
      return {
        _id: s.id,
        id: s.id,
        name: s.name,
        studentId: s.studentId,
        wing: s.wing || 'Campus Wing',
        className: s.className || 'Senior Division',
        photo: s.photo || '',
        totalPoints,
        firstPlaces,
        secondPlaces,
        thirdPlaces,
        totalEvents,
        recentHonors: s.wonResults.slice(-3).map(w => ({
          programTitle: w.result?.program?.title || 'Program',
          position: w.position,
          grade: w.grade,
          points: w.points
        }))
      };
    });

    performers.sort((a, b) => b.totalPoints - a.totalPoints || b.firstPlaces - a.firstPlaces);

    // Also calculate Wing standings
    const wingPointsMap = {};
    performers.forEach(p => {
      const wingKey = p.wing || 'Campus Wing';
      if (!wingPointsMap[wingKey]) {
        wingPointsMap[wingKey] = { wing: wingKey, points: 0, firstPlaces: 0, participants: 0 };
      }
      wingPointsMap[wingKey].points += p.totalPoints;
      wingPointsMap[wingKey].firstPlaces += p.firstPlaces;
      wingPointsMap[wingKey].participants += 1;
    });

    const wingStandings = Object.values(wingPointsMap).sort((a, b) => b.points - a.points);

    res.json({
      topStudents: performers.slice(0, 10),
      wingStandings,
      totalParticipants: students.length
    });
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving top performers.', error: error.message });
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

export default router;
