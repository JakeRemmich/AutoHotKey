const express = require('express');
const bcryptjs = require('bcryptjs'); // Changed from 'bcrypt' to 'bcryptjs'
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { generateAccessToken, generateRefreshToken } = require('../utils/auth');
const { requireUser } = require('./middleware/auth');
const UserService = require('../services/userService');

const router = express.Router();

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    console.log('Registration attempt for email:', req.body.email);

    const { email, password } = req.body;

    if (!email || !password) {
      console.log('Registration failed: Missing email or password');
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      console.log('Registration failed: User already exists with email:', email);
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcryptjs.hash(password, saltRounds);

    // Create new user
    const user = new User({
      email: email.toLowerCase(),
      password: hashedPassword,
      role: 'user',
      subscription_plan: 'free',
      scripts_generated_count: 0
    });

    await user.save();

    // Generate tokens
    const accessToken = generateAccessToken(user._id, res);
    const refreshToken = generateRefreshToken(user._id, res);

    // Save refresh token to user
    user.refreshToken = refreshToken;
    await user.save();

    console.log('User registered successfully:', user.email);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        subscription_plan: user.subscription_plan,
        scripts_generated_count: user.scripts_generated_count
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during registration'
    });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    console.log('Login attempt for email:', req.body.email);

    const { email, password } = req.body;

    if (!email || !password) {
      console.log('Login failed: Missing email or password');
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      console.log('Login failed: User not found for email:', email);
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check password
    const isValidPassword = await bcryptjs.compare(password, user.password);
    if (!isValidPassword) {
      console.log('Login failed: Invalid password for email:', email);
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Generate tokens
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Save refresh token to user
    user.refreshToken = refreshToken;
    await user.save();

    console.log('User logged in successfully:', user.email);

    res.json({
      success: true,
      message: 'Login successful',
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        subscription_plan: user.subscription_plan,
        scripts_generated_count: user.scripts_generated_count
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during login'
    });
  }
});

// POST /api/auth/refresh
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token is required'
      });
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

    // Find user and check if refresh token matches
    const user = await User.findById(decoded.userId);
    if (!user || user.refreshToken !== refreshToken) {
      console.log(user.refreshToken, refreshToken)
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token'
      });
    }

    // Generate new access token
    const accessToken = generateAccessToken(user._id);
    const newRefreshToken = generateRefreshToken(user._id);
    user.refreshToken = newRefreshToken;
    await user.save();
    res.json({
      success: true,
      accessToken,
      refreshToken: newRefreshToken,

      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        subscription_plan: user.subscription_plan,
        scripts_generated_count: user.scripts_generated_count
      }
    });

  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid refresh token'
    });
  }
});

// POST /api/auth/logout
router.post('/logout', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (refreshToken) {
      // Find user and clear refresh token
      const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
      const user = await User.findById(decoded.userId);
      if (user) {
        user.refreshToken = null;
        await user.save();
      }
    }

    res.json({
      success: true,
      message: 'Logout successful'
    });

  } catch (error) {
    console.error('Logout error:', error);
    res.json({
      success: true,
      message: 'Logout successful'
    });
  }
});


// PUT /api/auth/update-password
router.put('/update-password', requireUser, async (req, res) => {
  try {
    console.log('Password update attempt for user:', req.body.userId);

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      console.log('Password update failed: Missing required fields');
      return res.status(400).json({
        success: false,
        message: 'Current password, new password, and  are required'
      });
    }
    const user = await UserService.get(req.user._id);

    // Verify current password
    const isValidCurrentPassword = await bcryptjs.compare(currentPassword, user.password);
    if (!isValidCurrentPassword) {
      console.log('Password update failed: Invalid current password for user:', user.email);
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Hash new password
    const saltRounds = 10;
    const hashedNewPassword = await bcryptjs.hash(newPassword, saltRounds);

    // Update password
    user.password = hashedNewPassword;
    await user.save();

    console.log('Password updated successfully for user:', user.email);

    res.json({
      success: true,
      message: 'Password updated successfully'
    });

  } catch (error) {
    console.error('Password update error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during password update'
    });
  }
});

// PUT /api/auth/update-email
router.put('/update-email', requireUser, async (req, res) => {
  try {
    console.log('Email update attempt for user:', req.body.userId);

    const { newEmail, password } = req.body;

    if (!newEmail || !password) {
      console.log('Email update failed: Missing required fields');
      return res.status(400).json({
        success: false,
        message: 'New email, password, and are required'
      });
    }

    const user = await UserService.get(req.user._id);

    // Verify password
    const isValidPassword = await bcryptjs.compare(password, user.password);
    if (!isValidPassword) {
      console.log('Email update failed: Invalid password for user:', user.email);
      return res.status(401).json({
        success: false,
        message: 'Password is incorrect'
      });
    }

    // Check if new email already exists
    const existingUser = await User.findOne({ email: newEmail.toLowerCase() });
    if (existingUser && existingUser._id.toString() !== user._id.toString()) {
      console.log('Email update failed: Email already exists:', newEmail);
      return res.status(400).json({
        success: false,
        message: 'Email already exists'
      });
    }

    // Update email
    const oldEmail = user.email;
    user.email = newEmail.toLowerCase();
    await user.save();

    console.log('Email updated successfully from:', oldEmail, 'to:', user.email);

    res.json({
      success: true,
      message: 'Email updated successfully',
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        subscription_plan: user.subscription_plan,
        scripts_generated_count: user.scripts_generated_count
      }
    });

  } catch (error) {
    console.error('Email update error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during email update'
    });
  }
});

module.exports = router;