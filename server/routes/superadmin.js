import express from 'express';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import { protect, authorize } from '../middleware/auth.js';
import User from '../models/User.js';
import Student from '../models/Student.js';
import WingChairman from '../models/WingChairman.js';
import AuditLog from '../models/AuditLog.js';

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
    const users = await User.find().select('-password');
    const enrichedUsers = await Promise.all(
      users.map(async (u) => {
        let profile = null;
        if (u.role === 'student') {
          profile = await Student.findOne({ userId: u._id });
        } else if (u.role === 'wing_chairman') {
          profile = await WingChairman.findOne({ userId: u._id });
        }
        return {
          ...u._doc,
          profile
        };
      })
    );
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
    const userExists = await User.findOne({ username });
    if (userExists) {
      return res.status(400).json({ message: 'Username already taken.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      username,
      password: hashedPassword,
      role
    });

    let profile = null;

    if (role === 'student') {
      if (!name || !studentId || !admissionNumber || !className || !wing || !dob) {
        await User.findByIdAndDelete(user._id);
        return res.status(400).json({ message: 'Student name, ID, admission number, class, wing, and date of birth are required.' });
      }

      const idExists = await Student.findOne({ studentId });
      const admExists = await Student.findOne({ admissionNumber });
      if (idExists || admExists) {
        await User.findByIdAndDelete(user._id);
        return res.status(400).json({ message: 'Student ID or Admission Number is already registered.' });
      }

      profile = await Student.create({
        userId: user._id,
        name,
        studentId,
        admissionNumber,
        class: className,
        wing,
        dob,
        phone,
        email
      });
    } else if (role === 'wing_chairman') {
      if (!name || !wing) {
        await User.findByIdAndDelete(user._id);
        return res.status(400).json({ message: 'Chairman name and wing assignment are required.' });
      }

      const wingExists = await WingChairman.findOne({ wing });
      if (wingExists) {
        await User.findByIdAndDelete(user._id);
        return res.status(400).json({ message: `Wing '${wing}' is already assigned to another Chairman.` });
      }

      profile = await WingChairman.create({
        userId: user._id,
        name,
        wing,
        phone,
        email
      });
    }

    await AuditLog.create({
      userId: req.user._id,
      username: req.user.username,
      action: 'CREATE_USER',
      details: `Created new user account: ${username} (${role}).`
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
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Super Admin cannot delete their own account.' });
    }

    // Clear matching profiles
    if (user.role === 'student') {
      await Student.findOneAndDelete({ userId: user._id });
    } else if (user.role === 'wing_chairman') {
      await WingChairman.findOneAndDelete({ userId: user._id });
    }

    await User.findByIdAndDelete(user._id);

    await AuditLog.create({
      userId: req.user._id,
      username: req.user.username,
      action: 'DELETE_USER',
      details: `Deleted user: ${user.username} (${user.role}).`
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
    const logs = await AuditLog.find().sort({ timestamp: -1 });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving system audit logs.', error: error.message });
  }
});

// @route   POST /api/superadmin/backup
// @desc    Backup all databases to local file
router.post('/backup', async (req, res) => {
  try {
    const users = await User.find();
    const students = await Student.find();
    const chairmen = await WingChairman.find();
    const auditLogs = await AuditLog.find();

    const backupData = {
      users,
      students,
      chairmen,
      auditLogs,
      backedUpAt: new Date()
    };

    const backupFilePath = path.join(backupDir, 'database_backup.json');
    fs.writeFileSync(backupFilePath, JSON.stringify(backupData, null, 2));

    await AuditLog.create({
      userId: req.user._id,
      username: req.user.username,
      action: 'SYSTEM_BACKUP',
      details: 'Created database backup.'
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

    // Override databases
    await User.deleteMany({});
    await Student.deleteMany({});
    await WingChairman.deleteMany({});
    await AuditLog.deleteMany({});

    if (backup.users) await User.insertMany(backup.users);
    if (backup.students) await Student.insertMany(backup.students);
    if (backup.chairmen) await WingChairman.insertMany(backup.chairmen);
    if (backup.auditLogs) await AuditLog.insertMany(backup.auditLogs);

    await AuditLog.create({
      userId: req.user._id,
      username: req.user.username,
      action: 'SYSTEM_RESTORE',
      details: 'Restored database state from backup.'
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
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    if (newPassword) {
      user.password = await bcrypt.hash(newPassword, 10);
      user.plainPassword = newPassword;
    }
    if (newUsername) {
      const taken = await User.findOne({ username: newUsername });
      if (taken && taken._id.toString() !== user._id.toString()) {
        return res.status(400).json({ message: 'Username is already taken.' });
      }
      user.username = newUsername;
    }
    await user.save();

    await AuditLog.create({
      userId: req.user._id,
      username: req.user.username,
      action: 'RESET_USER_PASSWORD',
      details: `Super Admin reset credentials for @${user.username} (${user.role})`
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
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found.' });
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot modify your own status.' });
    }

    user.isActive = !user.isActive;
    await user.save();

    await AuditLog.create({
      userId: req.user._id,
      username: req.user.username,
      action: user.isActive ? 'ACTIVATE_USER' : 'DEACTIVATE_USER',
      details: `${user.isActive ? 'Activated' : 'Deactivated'} user account @${user.username}`
    });

    res.json({ message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully.`, isActive: user.isActive });
  } catch (error) {
    res.status(500).json({ message: 'Status toggle failed.', error: error.message });
  }
});

export default router;
