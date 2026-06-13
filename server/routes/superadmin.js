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
const backupDir = './backups';
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir);
}

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
        createdAt: true,
        studentProfile: true,
        wingChairmanProfile: true
      }
    });

    const enrichedUsers = users.map(u => {
      let profile = null;
      if (u.role === 'student') profile = u.studentProfile;
      else if (u.role === 'wing_chairman') profile = u.wingChairmanProfile;
      
      const { studentProfile, wingChairmanProfile, ...rest } = u;
      return {
        ...rest,
        profile
      };
    });

    res.json(enrichedUsers);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving user index.', error: error.message });
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
    if (userExists) {
      return res.status(400).json({ message: 'Username already taken.' });
    }

    if (role === 'student') {
      if (!name || !studentId || !admissionNumber || !className || !wing || !dob) {
        return res.status(400).json({ message: 'Student name, ID, admission number, class, wing, and date of birth are required.' });
      }

      const idExists = await prisma.student.findFirst({ where: { OR: [{ studentId }, { admissionNumber }] } });
      if (idExists) {
        return res.status(400).json({ message: 'Student ID or Admission Number is already registered.' });
      }
    } else if (role === 'wing_chairman') {
      if (!name || !wing) {
        return res.status(400).json({ message: 'Chairman name and wing assignment are required.' });
      }

      const wingExists = await prisma.wingChairman.findFirst({ where: { wing } });
      if (wingExists) {
        return res.status(400).json({ message: `Wing '${wing}' is already assigned to another Chairman.` });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        role,
        plainPassword: password
      }
    });

    let profile = null;

    if (role === 'student') {
      profile = await prisma.student.create({
        data: {
          userId: user.id,
          name,
          studentId,
          admissionNumber,
          class: className,
          wing,
          dob: new Date(dob),
          phone: phone || '',
          email: email || ''
        }
      });
    } else if (role === 'wing_chairman') {
      profile = await prisma.wingChairman.create({
        data: {
          userId: user.id,
          name,
          wing,
          phone: phone || '',
          email: email || ''
        }
      });
    }

    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        username: req.user.username,
        action: 'CREATE_USER',
        details: `Created new user account: ${username} (${role}).`
      }
    });

    res.status(201).json({ user, profile });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create user account.', error: error.message });
  }
});

// @route   DELETE /api/superadmin/users/:id
// @desc    Delete a user
router.delete('/users/:id', async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    if (user.id === req.user.id) {
      return res.status(400).json({ message: 'Super Admin cannot delete their own account.' });
    }

    await prisma.user.delete({ where: { id: user.id } });

    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        username: req.user.username,
        action: 'DELETE_USER',
        details: `Deleted user: ${user.username} (${user.role}).`
      }
    });

    res.json({ message: 'User account deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete user.', error: error.message });
  }
});

// @route   GET /api/superadmin/audit-logs
// @desc    Retrieve all audit trail logs
router.get('/audit-logs', async (req, res) => {
  try {
    const logs = await prisma.auditLog.findMany({ orderBy: { timestamp: 'desc' } });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving system audit logs.', error: error.message });
  }
});

// @route   POST /api/superadmin/backup
// @desc    Backup all databases to local file
router.post('/backup', async (req, res) => {
  try {
    const users = await prisma.user.findMany();
    const students = await prisma.student.findMany();
    const chairmen = await prisma.wingChairman.findMany();
    const auditLogs = await prisma.auditLog.findMany();

    const backupData = {
      users,
      students,
      chairmen,
      auditLogs,
      backedUpAt: new Date()
    };

    const backupFilePath = path.join(backupDir, 'database_backup.json');
    fs.writeFileSync(backupFilePath, JSON.stringify(backupData, null, 2));

    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        username: req.user.username,
        action: 'SYSTEM_BACKUP',
        details: 'Created database backup.'
      }
    });

    res.json({ message: 'System database backup created successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Database backup failed.', error: error.message });
  }
});

// @route   POST /api/superadmin/restore
// @desc    Restore database from file backup
router.post('/restore', async (req, res) => {
  const backupFilePath = path.join(backupDir, 'database_backup.json');

  if (!fs.existsSync(backupFilePath)) {
    return res.status(400).json({ message: 'Restore failed. No database backup file found.' });
  }

  try {
    const backupRaw = fs.readFileSync(backupFilePath, 'utf8');
    const backup = JSON.parse(backupRaw);

    // This operation can be complex with Prisma if relations have foreign key constraints
    // Let's assume we are just updating/upserting simple documents for now or clearing everything
    await prisma.$transaction([
      prisma.auditLog.deleteMany(),
      prisma.wingChairman.deleteMany(),
      prisma.student.deleteMany(),
      prisma.user.deleteMany()
    ]);

    if (backup.users?.length) {
      await prisma.user.createMany({ data: backup.users });
    }
    if (backup.students?.length) {
      await prisma.student.createMany({ data: backup.students });
    }
    if (backup.chairmen?.length) {
      await prisma.wingChairman.createMany({ data: backup.chairmen });
    }
    if (backup.auditLogs?.length) {
      await prisma.auditLog.createMany({ data: backup.auditLogs });
    }

    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        username: req.user.username,
        action: 'SYSTEM_RESTORE',
        details: 'Restored database state from backup.'
      }
    });

    res.json({ message: 'Database state successfully restored.' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to restore database.', error: error.message });
  }
});

// @route   PUT /api/superadmin/users/:id/reset-password
// @desc    Super Admin resets any user's password
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
      if (taken && taken.id !== user.id) {
        return res.status(400).json({ message: 'Username is already taken.' });
      }
      updatedData.username = newUsername;
    }

    await prisma.user.update({
      where: { id: user.id },
      data: updatedData
    });

    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        username: req.user.username,
        action: 'RESET_USER_PASSWORD',
        details: `Super Admin reset credentials for @${user.username} (${user.role})`
      }
    });

    res.json({ message: 'User credentials updated successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to reset credentials.', error: error.message });
  }
});

// @route   PUT /api/superadmin/users/:id/toggle-status
// @desc    Super Admin activate/deactivate a user
router.put('/users/:id/toggle-status', async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!user) return res.status(404).json({ message: 'User not found.' });
    if (user.id === req.user.id) {
      return res.status(400).json({ message: 'Cannot modify your own status.' });
    }

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

export default router;
