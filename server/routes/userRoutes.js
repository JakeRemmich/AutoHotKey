const express = require('express');
const { requireUser } = require('./middleware/auth.js');
const UserService = require('../services/userService.js');

const router = express.Router();

// GET /api/user - Get current user information including usage statistics
router.get('/', requireUser, async (req, res) => {
  try {
    console.log(`Getting user information for user ID: ${req.user._id}`);

    const user = await UserService.get(req.user._id);

    if (!user) {
      console.error(`User not found with ID: ${req.user._id}`);
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Determine usage limit based on subscription plan
    let limit = 3; // Default for free plan
    if (user.subscription_plan === 'monthly') {
      limit = -1; // Unlimited
    } else if (user.subscription_plan === 'per-script') {
      limit = user.credits; // Limited by credits
    }

    const responseData = {
      _id: user._id,
      email: user.email,
      role: user.role,
      scriptsGenerated: user.scripts_generated_count,
      limit: limit,
      subscription_plan: user.subscription_plan,
      credits: user.credits || 0,
      createdAt: user.createdAt,
      lastLoginAt: user.lastLoginAt
    };

    console.log(`Successfully retrieved user information for: ${user.email}, credits: ${user.credits}`);

    return res.status(200).json(responseData);

  } catch (error) {
    console.error(`Error getting user information: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve user information',
      error: error.message
    });
  }
});

module.exports = router;