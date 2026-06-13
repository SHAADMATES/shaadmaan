import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import prisma from '../db.js';

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
    const chairman = await prisma.wingChairman.findUnique({ where: { userId: req.user.id } });
    if (!chairman) return res.status(404).json({ message: 'Chairman profile not found.' });

    const program = await prisma.program.create({
      data: {
        title,
        type,
        wing: chairman.wing,
        date: new Date(date),
        time,
        venue,
        description: description || '',
        maxParticipants: Number(maxParticipants) || 0,
        rules: rules ? JSON.stringify(rules) : '[]',
        approved: false, // waits for Admin
        status: 'Upcoming',
        createdById: req.user.id
      }
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
    const chairman = await prisma.wingChairman.findUnique({ where: { userId: req.user.id } });
    if (!chairman) return res.status(404).json({ message: 'Chairman profile not found.' });

    const programs = await prisma.program.findMany({ where: { wing: chairman.wing } });
    res.json(programs);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving programs.', error: error.message });
  }
});

// @route   GET /api/chairman/registrations
// @desc    Get registrations in Chairman's wing
router.get('/registrations', async (req, res) => {
  try {
    const chairman = await prisma.wingChairman.findUnique({ where: { userId: req.user.id } });
    if (!chairman) return res.status(404).json({ message: 'Chairman profile not found.' });

    const wingPrograms = await prisma.program.findMany({ where: { wing: chairman.wing } });
    const wingProgramIds = wingPrograms.map(p => p.id);

    const regs = await prisma.registration.findMany({
      where: { programId: { in: wingProgramIds } },
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
    res.status(500).json({ message: 'Error retrieving registrations.', error: error.message });
  }
});

// @route   GET /api/chairman/stats
// @desc    Retrieve Chairman wing metrics
router.get('/stats', async (req, res) => {
  try {
    const chairman = await prisma.wingChairman.findUnique({ where: { userId: req.user.id } });
    if (!chairman) return res.status(404).json({ message: 'Chairman profile not found.' });

    const wingPrograms = await prisma.program.findMany({ where: { wing: chairman.wing } });
    const wingProgramIds = wingPrograms.map(p => p.id);

    const totalPrograms = wingPrograms.length;
    const totalParticipants = await prisma.registration.count({ where: { programId: { in: wingProgramIds } } });
    
    const results = await prisma.result.findMany({
      where: { programId: { in: wingProgramIds } },
      include: { winners: true }
    });
    
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
    const chairman = await prisma.wingChairman.findUnique({ where: { userId: req.user.id } });
    if (!chairman) return res.status(404).json({ message: 'Chairman profile not found.' });

    const program = await prisma.program.findFirst({ where: { id: programId, wing: chairman.wing } });
    if (!program) return res.status(400).json({ message: 'Program not found in your wing.' });

    let result = await prisma.result.findFirst({ where: { programId } });
    
    if (result) {
      await prisma.winner.deleteMany({ where: { resultId: result.id } });
      result = await prisma.result.update({
        where: { id: result.id },
        data: {
          winners: {
            create: winners.map(w => ({
              position: w.position,
              studentId: w.studentId || null,
              groupId: w.groupId || null,
              grade: w.grade,
              marks: Number(w.marks),
              points: Number(w.points),
              remarks: w.remarks || ''
            }))
          }
        }
      });
    } else {
      result = await prisma.result.create({
        data: {
          programId,
          type,
          winners: {
            create: winners.map(w => ({
              position: w.position,
              studentId: w.studentId || null,
              groupId: w.groupId || null,
              grade: w.grade,
              marks: Number(w.marks),
              points: Number(w.points),
              remarks: w.remarks || ''
            }))
          }
        }
      });
    }

    // Automatically trigger Certificate Generation for Winners (1st, 2nd, 3rd)
    for (let w of winners) {
      if (['1st', '2nd', '3rd'].includes(w.position)) {
        const certId = `CERT-${programId.toString().substring(18)}-${Math.random().toString(36).substring(7).toUpperCase()}`;
        
        if (type === 'single' && w.studentId) {
          const certExists = await prisma.certificate.findFirst({ where: { studentId: w.studentId, programId } });
          if (!certExists) {
            await prisma.certificate.create({
              data: {
                certificateId: certId,
                studentId: w.studentId,
                programId,
                position: w.position,
                grade: w.grade
              }
            });
          }
        } else if (type === 'group' && w.groupId) {
          const group = await prisma.group.findUnique({ where: { id: w.groupId }, include: { members: true } });
          if (group) {
            for (let m of group.members) {
              const memberCertExists = await prisma.certificate.findFirst({ where: { studentId: m.id, programId } });
              if (!memberCertExists) {
                const memberCertId = `CERT-${programId.toString().substring(18)}-${Math.random().toString(36).substring(7).toUpperCase()}`;
                await prisma.certificate.create({
                  data: {
                    certificateId: memberCertId,
                    studentId: m.id,
                    programId,
                    position: w.position,
                    grade: w.grade
                  }
                });
              }
            }
          }
        }
      }
    }

    await prisma.program.update({
      where: { id: program.id },
      data: { status: 'Result Published' }
    });

    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ message: 'Result publication failed.', error: error.message });
  }
});

// @route   GET /api/chairman/results
// @desc    Get results for all programs in Chairman's wing
router.get('/results', async (req, res) => {
  try {
    const chairman = await prisma.wingChairman.findUnique({ where: { userId: req.user.id } });
    if (!chairman) return res.status(404).json({ message: 'Chairman profile not found.' });

    const wingPrograms = await prisma.program.findMany({ where: { wing: chairman.wing } });
    const wingProgramIds = wingPrograms.map(p => p.id);

    const results = await prisma.result.findMany({
      where: { programId: { in: wingProgramIds } },
      include: {
        program: true,
        winners: {
          include: {
            student: true,
            group: { include: { members: true } }
          }
        }
      }
    });

    const mappedResults = results.map(r => ({
      ...r,
      programId: r.program,
      winners: r.winners.map(w => ({
        ...w,
        studentId: w.student,
        groupId: w.group
      }))
    }));

    res.json(mappedResults);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving results.', error: error.message });
  }
});

// @route   PUT /api/chairman/programs/:id
// @desc    Update a proposed program (only if not yet approved)
router.put('/programs/:id', async (req, res) => {
  const { title, venue, time, date, description } = req.body;
  try {
    const chairman = await prisma.wingChairman.findUnique({ where: { userId: req.user.id } });
    if (!chairman) return res.status(404).json({ message: 'Chairman profile not found.' });

    const program = await prisma.program.findFirst({ where: { id: req.params.id, wing: chairman.wing } });
    if (!program) return res.status(404).json({ message: 'Program not found in your wing.' });

    if (program.approved) {
      return res.status(403).json({ message: 'Cannot edit an already approved program.' });
    }

    const updatedProgram = await prisma.program.update({
      where: { id: program.id },
      data: {
        title: title || program.title,
        venue: venue || program.venue,
        time: time || program.time,
        date: date ? new Date(date) : program.date,
        description: description !== undefined ? description : program.description
      }
    });

    res.json(updatedProgram);
  } catch (error) {
    res.status(500).json({ message: 'Update failed.', error: error.message });
  }
});

// @route   DELETE /api/chairman/programs/:id
// @desc    Delete a proposed program (only if not yet approved)
router.delete('/programs/:id', async (req, res) => {
  try {
    const chairman = await prisma.wingChairman.findUnique({ where: { userId: req.user.id } });
    if (!chairman) return res.status(404).json({ message: 'Chairman profile not found.' });

    const program = await prisma.program.findFirst({ where: { id: req.params.id, wing: chairman.wing } });
    if (!program) return res.status(404).json({ message: 'Program not found in your wing.' });

    if (program.approved) {
      return res.status(403).json({ message: 'Cannot delete an already approved program.' });
    }

    await prisma.program.delete({ where: { id: program.id } });
    res.json({ message: 'Program proposal deleted.' });
  } catch (error) {
    res.status(500).json({ message: 'Deletion failed.', error: error.message });
  }
});

// @route   GET /api/chairman/schedules
// @desc    Get schedules for programs in Chairman's wing
router.get('/schedules', async (req, res) => {
  try {
    const chairman = await prisma.wingChairman.findUnique({ where: { userId: req.user.id } });
    if (!chairman) return res.status(404).json({ message: 'Chairman profile not found.' });

    const wingPrograms = await prisma.program.findMany({ where: { wing: chairman.wing } });
    const wingProgramIds = wingPrograms.map(p => p.id);

    const schedules = await prisma.schedule.findMany({
      where: { programId: { in: wingProgramIds } },
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
    res.status(500).json({ message: 'Error retrieving schedules.', error: error.message });
  }
});

export default router;
