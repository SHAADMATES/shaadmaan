import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import WingChairman from '../models/WingChairman.js';
import Program from '../models/Program.js';
import Registration from '../models/Registration.js';
import Result from '../models/Result.js';
import Schedule from '../models/Schedule.js';

const router = express.Router();

router.use(protect, authorize('wing_chairman'));

// @route   POST /api/chairman/programs
// @desc    Propose program
router.post('/programs', async (req, res) => {
  const { title, type, date, time, venue, description, maxParticipants, rules } = req.body;

  if (!title || !date || !time || !venue) {
    return res.status(400).json({ message: 'All marked fields are required.' });
  }

  try {
    const chairman = await WingChairman.findOne({ userId: req.user._id });
    if (!chairman) return res.status(404).json({ message: 'Chairman profile not found.' });

    const program = await Program.create({
      title,
      type,
      wing: chairman.wing,
      date,
      time,
      venue,
      description,
      maxParticipants,
      rules,
      approved: false, // waits for Admin
      status: 'Upcoming',
      createdBy: req.user._id
    });

    res.status(201).json(program);
  } catch (error) {
    res.status(500).json({ message: 'Proposal failed.', error: error.message });
  }
});

// @route   GET /api/chairman/programs
// @desc    Get programs proposed by Chairman
router.get('/programs', async (req, res) => {
  try {
    const chairman = await WingChairman.findOne({ userId: req.user._id });
    if (!chairman) return res.status(404).json({ message: 'Chairman profile not found.' });

    const programs = await Program.find({ wing: chairman.wing });
    res.json(programs);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving programs.', error: error.message });
  }
});

// @route   GET /api/chairman/registrations
// @desc    Get registrations in Chairman's wing
router.get('/registrations', async (req, res) => {
  try {
    const chairman = await WingChairman.findOne({ userId: req.user._id });
    if (!chairman) return res.status(404).json({ message: 'Chairman profile not found.' });

    const wingPrograms = await Program.find({ wing: chairman.wing });
    const wingProgramIds = wingPrograms.map(p => p._id);

    const regs = await Registration.find({ programId: { $in: wingProgramIds } })
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

// @route   GET /api/chairman/stats
// @desc    Retrieve Chairman wing metrics
router.get('/stats', async (req, res) => {
  try {
    const chairman = await WingChairman.findOne({ userId: req.user._id });
    if (!chairman) return res.status(404).json({ message: 'Chairman profile not found.' });

    const wingPrograms = await Program.find({ wing: chairman.wing });
    const wingProgramIds = wingPrograms.map(p => p._id);

    const totalPrograms = wingPrograms.length;
    const totalParticipants = await Registration.countDocuments({ programId: { $in: wingProgramIds } });
    
    const results = await Result.find({ programId: { $in: wingProgramIds } });
    let totalWinners = 0;
    results.forEach(r => {
      totalWinners += r.winners.length;
    });

    res.json({
      totalPrograms,
      totalParticipants,
      totalWinners
    });
  } catch (error) {
    res.status(500).json({ message: 'Error loading wing statistics.', error: error.message });
  }
});

// @route   POST /api/chairman/results
// @desc    Publish results standing for a program in their wing
router.post('/results', async (req, res) => {
  const { programId, type, winners } = req.body;
  if (!programId || !type || !winners) {
    return res.status(400).json({ message: 'Program ID, type, and winners are required.' });
  }

  try {
    const chairman = await WingChairman.findOne({ userId: req.user._id });
    if (!chairman) return res.status(404).json({ message: 'Chairman profile not found.' });

    const program = await Program.findOne({ _id: programId, wing: chairman.wing });
    if (!program) return res.status(400).json({ message: 'Program not found in your wing.' });

    let result = await Result.findOne({ programId });
    if (result) {
      result.winners = winners;
      await result.save();
    } else {
      result = await Result.create({ programId, type, winners });
    }

    // Automatically trigger Certificate Generation for Winners (1st, 2nd, 3rd)
    const Certificate = (await import('../models/Certificate.js')).default;
    const Group = (await import('../models/Group.js')).default;
    
    for (let w of winners) {
      if (['1st', '2nd', '3rd'].includes(w.position)) {
        const certId = `CERT-${programId.toString().substring(18)}-${Math.random().toString(36).substring(7).toUpperCase()}`;
        
        if (type === 'single' && w.studentId) {
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

    program.status = 'Result Published';
    await program.save();

    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ message: 'Result publication failed.', error: error.message });
  }
});

// @route   GET /api/chairman/results
// @desc    Get results for all programs in Chairman's wing
router.get('/results', async (req, res) => {
  try {
    const chairman = await WingChairman.findOne({ userId: req.user._id });
    if (!chairman) return res.status(404).json({ message: 'Chairman profile not found.' });

    const wingPrograms = await Program.find({ wing: chairman.wing });
    const wingProgramIds = wingPrograms.map(p => p._id);

    const results = await Result.find({ programId: { $in: wingProgramIds } })
      .populate('programId')
      .populate('winners.studentId')
      .populate({
        path: 'winners.groupId',
        populate: { path: 'members' }
      });

    res.json(results);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving results.', error: error.message });
  }
});

// @route   PUT /api/chairman/programs/:id
// @desc    Update a proposed program (only if not yet approved)
router.put('/programs/:id', async (req, res) => {
  const { title, venue, time, date, description } = req.body;
  try {
    const chairman = await WingChairman.findOne({ userId: req.user._id });
    if (!chairman) return res.status(404).json({ message: 'Chairman profile not found.' });

    const program = await Program.findOne({ _id: req.params.id, wing: chairman.wing });
    if (!program) return res.status(404).json({ message: 'Program not found in your wing.' });

    if (program.approved) {
      return res.status(403).json({ message: 'Cannot edit an already approved program.' });
    }

    program.title = title || program.title;
    program.venue = venue || program.venue;
    program.time = time || program.time;
    program.date = date || program.date;
    program.description = description !== undefined ? description : program.description;
    await program.save();

    res.json(program);
  } catch (error) {
    res.status(500).json({ message: 'Update failed.', error: error.message });
  }
});

// @route   DELETE /api/chairman/programs/:id
// @desc    Delete a proposed program (only if not yet approved)
router.delete('/programs/:id', async (req, res) => {
  try {
    const chairman = await WingChairman.findOne({ userId: req.user._id });
    if (!chairman) return res.status(404).json({ message: 'Chairman profile not found.' });

    const program = await Program.findOne({ _id: req.params.id, wing: chairman.wing });
    if (!program) return res.status(404).json({ message: 'Program not found in your wing.' });

    if (program.approved) {
      return res.status(403).json({ message: 'Cannot delete an already approved program.' });
    }

    await Program.findByIdAndDelete(program._id);
    res.json({ message: 'Program proposal deleted.' });
  } catch (error) {
    res.status(500).json({ message: 'Deletion failed.', error: error.message });
  }
});

// @route   GET /api/chairman/schedules
// @desc    Get schedules for programs in Chairman's wing
router.get('/schedules', async (req, res) => {
  try {
    const chairman = await WingChairman.findOne({ userId: req.user._id });
    if (!chairman) return res.status(404).json({ message: 'Chairman profile not found.' });

    const wingPrograms = await Program.find({ wing: chairman.wing });
    const wingProgramIds = wingPrograms.map(p => p._id);

    const schedules = await Schedule.find({ programId: { $in: wingProgramIds } })
      .populate('programId', 'title wing');

    res.json(schedules);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving schedules.', error: error.message });
  }
});

export default router;
