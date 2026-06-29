import express from 'express';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import { protect, authorize } from '../middleware/auth.js';
import prisma from '../db.js';

const router = express.Router();

// Apply Super Admin guard
router.use(protect, authorize('super_admin'));

// Helper for backup directory
const backupDir = process.env.NODE_ENV === 'production' ? '/tmp/backups' : './backups';
try {
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }
} catch (error) {
  console.warn('Could not create backup directory, continuing anyway:', error.message);
}

// @route   GET /api/superadmin/stats
// @desc    Get system-wide statistics
router.get('/stats', async (req, res) => {
  try {
    const totalUsers = await prisma.user.count();
    const totalStudents = await prisma.student.count();
    const totalWingManagers = await prisma.wingChairman.count();
    const totalPrograms = await prisma.program.count();
    const totalOutreach = await prisma.outreach.count();
    const totalCertificates = await prisma.certificate.count();
    const totalAuditLogs = await prisma.auditLog.count();
    
    const usersByRole = await prisma.user.groupBy({
      by: ['role'],
      _count: { _all: true }
    });

    const activeUsers = await prisma.user.count({ where: { isActive: true } });
    const inactiveUsers = await prisma.user.count({ where: { isActive: false } });

    const finances = await prisma.finance.findMany();
    let totalIncome = 0;
    let totalExpense = 0;
    finances.forEach(f => {
      if (f.type === 'income') totalIncome += f.amount;
      else totalExpense += f.amount;
    });

    res.json({
      totalUsers,
      totalStudents,
      totalWingManagers,
      totalPrograms,
      totalOutreach,
      totalCertificates,
      totalAuditLogs,
      activeUsers,
      inactiveUsers,
      usersByRole: usersByRole.map(r => ({ role: r.role, count: r._count._all })),
      totalIncome,
      totalExpense
    });
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving system statistics.', error: error.message });
  }
});

// @route   GET /api/superadmin/users
// @desc    Get all users populated with profiles
router.get('/users', async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        role: true,
        isActive: true,
        plainPassword: true,
        createdAt: true,
        student: true,
        wingChairman: true
      }
    });

    const enrichedUsers = users.map(u => {
      let profile = null;
      if (u.role === 'student') profile = u.student;
      else if (u.role === 'wing_chairman') profile = u.wingChairman;
      
      const { student, wingChairman, ...rest } = u;
      return { ...rest, profile };
    });

    res.json(enrichedUsers);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving user index.', error: error.message });
  }
});

// @route   GET /api/superadmin/users/:id/details
// @desc    Get full details of a specific user
router.get('/users/:id/details', async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      include: {
        student: { include: { registrations: true, certificates: true, outreach: true } },
        wingChairman: true,
        auditLogs: { take: 20, orderBy: { timestamp: 'desc' } }
      }
    });
    if (!user) return res.status(404).json({ message: 'User not found.' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user details.', error: error.message });
  }
});

// @route   POST /api/superadmin/users
// @desc    Create a user account (Admin, Treasurer, Chairman, Student)
router.post('/users', async (req, res) => {
  const { username, password, role, name, studentId, admissionNumber, class: className, wing, dob, phone, email } = req.body;

  if (!username || !password || !role) {
    return res.status(400).json({ message: 'Username, password, and role are required.' });
  }

  try {
    const userExists = await prisma.user.findUnique({ where: { username } });
    if (userExists) return res.status(400).json({ message: 'Username already taken.' });

    if (role === 'student') {
      if (!name || !studentId || !admissionNumber || !className || !wing || !dob) {
        return res.status(400).json({ message: 'Student name, ID, admission number, class, wing, and date of birth are required.' });
      }
      const idExists = await prisma.student.findFirst({ where: { OR: [{ studentId }, { admissionNumber }] } });
      if (idExists) return res.status(400).json({ message: 'Student ID or Admission Number is already registered.' });
    } else if (role === 'wing_chairman') {
      if (!name || !wing) return res.status(400).json({ message: 'Chairman name and wing assignment are required.' });
      const wingExists = await prisma.wingChairman.findFirst({ where: { wing } });
      if (wingExists) return res.status(400).json({ message: `Wing '${wing}' is already assigned to another Chairman.` });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { username, password: hashedPassword, role, plainPassword: password }
    });

    let profile = null;

    if (role === 'student') {
      profile = await prisma.student.create({
        data: {
          userId: user.id, name, studentId, admissionNumber,
          className, wing, dob: new Date(dob),
          phone: phone || '', email: email || ''
        }
      });
    } else if (role === 'wing_chairman') {
      profile = await prisma.wingChairman.create({
        data: { userId: user.id, name, wing, phone: phone || '', email: email || '' }
      });
    }

    await prisma.auditLog.create({
      data: { userId: req.user.id, username: req.user.username, action: 'CREATE_USER', details: `Created new user account: ${username} (${role}).` }
    });

    res.status(201).json({ user, profile });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create user account.', error: error.message });
  }
});

// @route   DELETE /api/superadmin/users/:id
router.delete('/users/:id', async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!user) return res.status(404).json({ message: 'User not found.' });
    if (user.id === req.user.id) return res.status(400).json({ message: 'Super Admin cannot delete their own account.' });

    // Clean up related data first
    if (user.role === 'student') {
      const student = await prisma.student.findUnique({ where: { userId: user.id } });
      if (student) {
        await prisma.outreach.deleteMany({ where: { studentId: student.id } });
        await prisma.registration.deleteMany({ where: { studentId: student.id } });
        await prisma.student.delete({ where: { id: student.id } });
      }
    } else if (user.role === 'wing_chairman') {
      const chairman = await prisma.wingChairman.findUnique({ where: { userId: user.id } });
      if (chairman) {
        await prisma.wing.updateMany({ where: { chairmanId: chairman.id }, data: { chairmanId: null } });
        await prisma.wingChairman.delete({ where: { id: chairman.id } });
      }
    }

    await prisma.user.delete({ where: { id: user.id } });

    await prisma.auditLog.create({
      data: { userId: req.user.id, username: req.user.username, action: 'DELETE_USER', details: `Deleted user: ${user.username} (${user.role}).` }
    });

    res.json({ message: 'User account deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete user.', error: error.message });
  }
});

// @route   GET /api/superadmin/audit-logs
router.get('/audit-logs', async (req, res) => {
  try {
    const logs = await prisma.auditLog.findMany({ orderBy: { timestamp: 'desc' } });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving system audit logs.', error: error.message });
  }
});

// @route   GET /api/superadmin/export
// @desc    Export all data as JSON
router.get('/export', async (req, res) => {
  try {
    const [users, students, wingChairmen, programs, outreach, certificates, finances, auditLogs] = await Promise.all([
      prisma.user.findMany({ select: { id: true, username: true, role: true, isActive: true, createdAt: true } }),
      prisma.student.findMany(),
      prisma.wingChairman.findMany(),
      prisma.program.findMany(),
      prisma.outreach.findMany({ include: { student: { select: { name: true } } } }),
      prisma.certificate.findMany(),
      prisma.finance.findMany(),
      prisma.auditLog.findMany({ orderBy: { timestamp: 'desc' }, take: 500 })
    ]);

    const exportData = {
      exportedAt: new Date().toISOString(),
      summary: {
        totalUsers: users.length,
        totalStudents: students.length,
        totalPrograms: programs.length,
        totalOutreach: outreach.length,
        totalCertificates: certificates.length
      },
      users, students, wingChairmen, programs, outreach, certificates, finances, auditLogs
    };

    await prisma.auditLog.create({
      data: { userId: req.user.id, username: req.user.username, action: 'EXPORT_DATA', details: 'Super Admin exported all system data.' }
    });

    res.setHeader('Content-Disposition', `attachment; filename="shaadmates-export-${Date.now()}.json"`);
    res.setHeader('Content-Type', 'application/json');
    res.json(exportData);
  } catch (error) {
    res.status(500).json({ message: 'Export failed.', error: error.message });
  }
});

// @route   POST /api/superadmin/backup
router.post('/backup', async (req, res) => {
  try {
    const users = await prisma.user.findMany();
    const students = await prisma.student.findMany();
    const chairmen = await prisma.wingChairman.findMany();
    const auditLogs = await prisma.auditLog.findMany();

    const backupData = { users, students, chairmen, auditLogs, backedUpAt: new Date() };
    const backupFilePath = path.join(backupDir, 'database_backup.json');
    fs.writeFileSync(backupFilePath, JSON.stringify(backupData, null, 2));

    await prisma.auditLog.create({
      data: { userId: req.user.id, username: req.user.username, action: 'SYSTEM_BACKUP', details: 'Created database backup.' }
    });

    res.json({ message: 'System database backup created successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Database backup failed.', error: error.message });
  }
});

// @route   POST /api/superadmin/restore
router.post('/restore', async (req, res) => {
  const backupFilePath = path.join(backupDir, 'database_backup.json');
  if (!fs.existsSync(backupFilePath)) {
    return res.status(400).json({ message: 'Restore failed. No database backup file found.' });
  }

  try {
    const backupRaw = fs.readFileSync(backupFilePath, 'utf8');
    const backup = JSON.parse(backupRaw);

    await prisma.$transaction([
      prisma.auditLog.deleteMany(),
      prisma.wingChairman.deleteMany(),
      prisma.student.deleteMany(),
      prisma.user.deleteMany()
    ]);

    if (backup.users?.length) await prisma.user.createMany({ data: backup.users });
    if (backup.students?.length) await prisma.student.createMany({ data: backup.students });
    if (backup.chairmen?.length) await prisma.wingChairman.createMany({ data: backup.chairmen });
    if (backup.auditLogs?.length) await prisma.auditLog.createMany({ data: backup.auditLogs });

    await prisma.auditLog.create({
      data: { userId: req.user.id, username: req.user.username, action: 'SYSTEM_RESTORE', details: 'Restored database state from backup.' }
    });

    res.json({ message: 'Database state successfully restored.' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to restore database.', error: error.message });
  }
});

// @route   DELETE /api/superadmin/system/wipe
// @desc    Wipe all non-critical data (students, programs, outreach)
router.delete('/system/wipe', async (req, res) => {
  const { confirm } = req.body;
  if (confirm !== 'WIPE_ALL_DATA') {
    return res.status(400).json({ message: 'Must confirm with "WIPE_ALL_DATA" string.' });
  }

  try {
    await prisma.$transaction([
      prisma.winner.deleteMany(),
      prisma.result.deleteMany(),
      prisma.certificate.deleteMany(),
      prisma.outreach.deleteMany(),
      prisma.registration.deleteMany(),
      prisma.schedule.deleteMany(),
      prisma.finance.deleteMany(),
      prisma.program.deleteMany()
    ]);

    await prisma.auditLog.create({
      data: { userId: req.user.id, username: req.user.username, action: 'SYSTEM_WIPE', details: 'Super Admin wiped all program and activity data.' }
    });

    res.json({ message: 'All program and activity data wiped successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'System wipe failed.', error: error.message });
  }
});

// @route   PUT /api/superadmin/users/:id/reset-password
router.put('/users/:id/reset-password', async (req, res) => {
  const { newPassword, newUsername } = req.body;
  if (!newPassword && !newUsername) {
    return res.status(400).json({ message: 'New password or username is required.' });
  }

  try {
    const user = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!user) return res.status(404).json({ message: 'User not found.' });

    let updatedData = {};
    if (newPassword) {
      updatedData.password = await bcrypt.hash(newPassword, 10);
      updatedData.plainPassword = newPassword;
    }
    if (newUsername) {
      const taken = await prisma.user.findUnique({ where: { username: newUsername } });
      if (taken && taken.id !== user.id) return res.status(400).json({ message: 'Username is already taken.' });
      updatedData.username = newUsername;
    }

    await prisma.user.update({ where: { id: user.id }, data: updatedData });

    await prisma.auditLog.create({
      data: { userId: req.user.id, username: req.user.username, action: 'RESET_USER_PASSWORD', details: `Super Admin reset credentials for @${user.username} (${user.role})` }
    });

    res.json({ message: 'User credentials updated successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to reset credentials.', error: error.message });
  }
});

// @route   PUT /api/superadmin/users/:id/toggle-status
router.put('/users/:id/toggle-status', async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!user) return res.status(404).json({ message: 'User not found.' });
    if (user.id === req.user.id) return res.status(400).json({ message: 'Cannot modify your own status.' });

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { isActive: !user.isActive }
    });

    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        username: req.user.username,
        action: updatedUser.isActive ? 'ACTIVATE_USER' : 'DEACTIVATE_USER',
        details: `${updatedUser.isActive ? 'Activated' : 'Deactivated'} user account @${updatedUser.username}`
      }
    });

    res.json({ message: `User ${updatedUser.isActive ? 'activated' : 'deactivated'} successfully.`, isActive: updatedUser.isActive });
  } catch (error) {
    res.status(500).json({ message: 'Status toggle failed.', error: error.message });
  }
});

// @route PUT /api/superadmin/users/:id/role
// @desc  Change a user's role
router.put('/users/:id/role', async (req, res) => {
  const { role } = req.body;
  if (!role) return res.status(400).json({ message: 'Role is required.' });

  try {
    const user = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!user) return res.status(404).json({ message: 'User not found.' });
    if (user.id === req.user.id) return res.status(400).json({ message: 'Cannot change your own role.' });

    const updated = await prisma.user.update({ where: { id: user.id }, data: { role } });

    await prisma.auditLog.create({
      data: { userId: req.user.id, username: req.user.username, action: 'CHANGE_ROLE', details: `Changed role of @${user.username} from ${user.role} to ${role}` }
    });

    res.json({ message: `Role changed to ${role} successfully.`, user: updated });
  } catch (error) {
    res.status(500).json({ message: 'Role change failed.', error: error.message });
  }
});

export default router;
