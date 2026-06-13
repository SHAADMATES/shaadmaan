import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { protect } from '../middleware/auth.js';
import prisma from '../db.js';

const router = express.Router();

// @route   POST /api/auth/login
// @desc    Authenticate user & log event
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required.' });
  }

  try {
    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) {
      await prisma.auditLog.create({ data: { action: 'FAILED_LOGIN', details: `Unregistered username: ${username}` } });
      return res.status(401).json({ message: 'Invalid credentials. User does not exist.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      await prisma.auditLog.create({ data: { userId: user.id, username: user.username, action: 'FAILED_LOGIN', details: 'Incorrect password.' } });
      return res.status(401).json({ message: 'Invalid credentials. Incorrect password.' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    // Write successful login trace to audit log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        username: user.username,
        action: 'USER_LOGIN',
        details: `Signed in successfully as ${user.role}.`
      }
    });

    res.json({
      token,
      user: {
        _id: user.id, // Using _id for frontend compatibility
        username: user.username,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error during login.', error: error.message });
  }
});

// @route   POST /api/auth/forgot-password
// @desc    Forgot password request (mock)
router.post('/forgot-password', async (req, res) => {
  const { username } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    await prisma.auditLog.create({ data: { userId: user.id, username: user.username, action: 'FORGOT_PASSWORD_REQUESTED' } });
    res.json({ message: 'Password reset link dispatched. Please check your inbox.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// @route   POST /api/auth/reset-password
// @desc    Reset password (mock)
router.post('/reset-password', async (req, res) => {
  const { username, newPassword } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword, plainPassword: newPassword }
    });
    await prisma.auditLog.create({ data: { userId: user.id, username: user.username, action: 'PASSWORD_RESET_SUCCESSFUL' } });
    res.json({ message: 'Password updated successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// @route   GET /api/auth/profile
// @desc    Get current user profile details
router.get('/profile', protect, async (req, res) => {
  try {
    const user = req.user;
    let profileDetails = null;

    if (user.role === 'student') {
      profileDetails = await prisma.student.findUnique({ where: { userId: user.id } });
    } else if (user.role === 'wing_chairman') {
      profileDetails = await prisma.wingChairman.findUnique({ where: { userId: user.id } });
    } else if (user.role === 'treasurer') {
      profileDetails = { name: 'Treasurer Desk', wing: 'Finance' };
    } else if (user.role === 'admin' || user.role === 'super_admin') {
      profileDetails = { name: user.role === 'super_admin' ? 'Super Administrator' : 'Administrator', wing: 'System' };
    }

    res.json({
      user: {
        _id: user.id, // Compatibility
        username: user.username,
        role: user.role
      },
      profileDetails
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching profile details.', error: error.message });
  }
});

// @route   PUT /api/auth/change-password
// @desc    Authenticated user changes their own username/password
router.put('/change-password', protect, async (req, res) => {
  const { currentPassword, newPassword, newUsername } = req.body;

  if (!currentPassword) {
    return res.status(400).json({ message: 'Current password is required to verify identity.' });
  }
  if (!newPassword && !newUsername) {
    return res.status(400).json({ message: 'Provide a new password or new username.' });
  }

  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) return res.status(404).json({ message: 'User not found.' });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Current password is incorrect.' });
    }

    const updateData = {};

    if (newUsername && newUsername !== user.username) {
      const taken = await prisma.user.findUnique({ where: { username: newUsername } });
      if (taken) return res.status(400).json({ message: 'Username already taken.' });
      updateData.username = newUsername;
    }

    if (newPassword) {
      if (newPassword.length < 6) {
        return res.status(400).json({ message: 'New password must be at least 6 characters.' });
      }
      updateData.password = await bcrypt.hash(newPassword, 10);
      updateData.plainPassword = newPassword;
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: updateData
    });

    await prisma.auditLog.create({
      data: {
        userId: updatedUser.id,
        username: updatedUser.username,
        action: 'SELF_PASSWORD_CHANGE',
        details: `User @${updatedUser.username} updated their own credentials.`
      }
    });

    res.json({ message: 'Credentials updated successfully. Please login again with new credentials.' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update credentials.', error: error.message });
  }
});

export default router;
