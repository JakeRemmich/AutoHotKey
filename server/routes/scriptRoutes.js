const express = require('express');
const router = express.Router();
const { requireUser } = require('./middleware/auth');
const { sendLLMRequest } = require('../services/llmService');
const User = require('../models/User');
const Script = require('../models/Script');

// Admin emails with unlimited access
const ADMIN_EMAILS = ['jdremmich@hotmail.com'];

// Function to validate if description contains meaningful content
function isValidDescription(description) {
  const trimmed = description.trim();

  console.log(`=== VALIDATION DEBUG ===`);
  console.log(`Original description: "${description}"`);
  console.log(`Trimmed description: "${trimmed}"`);
  console.log(`Description length: ${trimmed.length}`);

  // Check if it's just special characters or numbers
  const onlySpecialChars = /^[^a-zA-Z]*$/.test(trimmed);
  console.log(`Only special chars test result: ${onlySpecialChars}`);
  if (onlySpecialChars) {
    console.log('VALIDATION FAILED: Description contains only special characters or numbers');
    return false;
  }

  // Check if it has at least 3 letters (to ensure some meaningful content)
  const letterCount = (trimmed.match(/[a-zA-Z]/g) || []).length;
  console.log(`Letter count: ${letterCount}`);
  if (letterCount < 3) {
    console.log(`VALIDATION FAILED: Description has only ${letterCount} letters, minimum 3 required`);
    return false;
  }

  // Check if it's too short to be meaningful (less than 5 characters)
  if (trimmed.length < 5) {
    console.log(`VALIDATION FAILED: Description too short: ${trimmed.length} characters`);
    return false;
  }

  console.log('VALIDATION PASSED: Description is valid');
  console.log(`=== END VALIDATION DEBUG ===`);
  return true;
}

// POST /api/scripts/generate - Generate AutoHotkey script from description
router.post('/generate', requireUser, async (req, res) => {
  try {
    const { description } = req.body;
    const userId = req.user.id;

    console.log(`=== SCRIPT GENERATION REQUEST ===`);
    console.log(`Script generation request from user ${userId}`);
    console.log(`Description: "${description}"`);

    // Get user to check subscription limits FIRST
    const user = await User.findById(userId);
    if (!user) {
      console.log(`ERROR: User ${userId} not found`);
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    console.log(`=== USER DEBUG INFO ===`);
    console.log(`User ID: ${user._id}`);
    console.log(`User email from database: "${user.email}"`);
    console.log(`User subscription plan: "${user.subscription_plan}"`);
    console.log(`User scripts generated count: ${user.scripts_generated_count}`);
    console.log(`User credits: ${user.credits}`);
    console.log(`User subscription status: ${user.subscriptionStatus}`);
    console.log(`User subscription end date: ${user.subscriptionEndDate}`);
    console.log(`=== END USER DEBUG INFO ===`);

    // Check usage limits based on subscription plan
    const isAdmin = ADMIN_EMAILS.includes(user.email);
    console.log(`Admin check result: ${isAdmin}`);

    if (!isAdmin) {
      if (user.subscription_plan === 'free' && user.scripts_generated_count >= 3) {
        console.log(`LIMIT REACHED: Free user ${userId} (${user.email}) has reached limit`);
        return res.status(403).json({
          success: false,
          error: 'You have reached your free plan limit. Please upgrade to continue generating scripts.'
        });
      } else if (user.subscription_plan === 'per-script' && user.credits <= 0) {
        console.log(`=== CREDITS EXHAUSTED LOGIC ===`);
        console.log(`CREDITS EXHAUSTED: Per-script user ${userId} (${user.email}) has no credits left`);
        console.log(`Current credits: ${user.credits}`);
        console.log(`Current plan: ${user.subscription_plan}`);

        // Automatically revert to free plan when credits are exhausted
        const revertResult = await User.findByIdAndUpdate(userId, {
          subscription_plan: 'free',
          subscriptionStatus: null,
          subscriptionEndDate: null
        }, { new: true });

        console.log(`User ${userId} reverted to free plan due to exhausted credits`);
        console.log(`User after revert - plan: ${revertResult.subscription_plan}, credits: ${revertResult.credits}`);
        console.log(`=== END CREDITS EXHAUSTED LOGIC ===`);

        return res.status(403).json({
          success: false,
          error: 'You have used all your script credits. Please purchase more scripts or upgrade to unlimited plan.'
        });
      }
    }

    // Validate input
    if (!description || typeof description !== 'string' || description.trim().length === 0) {
      console.log('VALIDATION ERROR: Invalid description provided - empty or not string');
      return res.status(400).json({
        success: false,
        error: 'Description is required and must be a non-empty string'
      });
    }

    if (description.length > 1000) {
      console.log('VALIDATION ERROR: Description too long');
      return res.status(400).json({
        success: false,
        error: 'Description must be less than 1000 characters'
      });
    }

    // Validate if description is meaningful
    console.log('Starting meaningful description validation...');
    if (!isValidDescription(description)) {
      console.log('VALIDATION ERROR: Description is not meaningful enough for script generation');
      return res.status(400).json({
        success: false,
        error: 'Description is required and must be a non-empty string'
      });
    }

    // Create AutoHotkey-specific prompt
    const prompt = `You are an expert AutoHotkey script generator. Convert the following natural language description into a working AutoHotkey script.

Rules:
1. Generate ONLY the AutoHotkey script code, no explanations
2. Use proper AutoHotkey syntax
3. Include comments only for complex operations
4. Make sure hotkeys use standard AutoHotkey format (e.g., ^j:: for Ctrl+J)
5. End hotkey definitions with 'return'
6. Use common AutoHotkey commands like Send, Run, WinActivate, etc.

Description: ${description}

AutoHotkey Script:`;

    console.log('Checking available LLM providers...');
    console.log(`OpenAI API Key configured: ${process.env.OPENAI_API_KEY ? 'YES' : 'NO'}`);
    console.log(`Anthropic API Key configured: ${process.env.ANTHROPIC_API_KEY ? 'YES' : 'NO'}`);

    // Try OpenAI first, fallback to Anthropic if available
    let script;
    try {
      if (process.env.OPENAI_API_KEY) {
        console.log('Using OpenAI GPT-3.5-Turbo for script generation');
        script = await sendLLMRequest('openai', 'gpt-3.5-turbo', prompt);
        console.log('Successfully received response from OpenAI');
      } else if (process.env.ANTHROPIC_API_KEY) {
        console.log('OpenAI not available, falling back to Anthropic Claude');
        script = await sendLLMRequest('anthropic', 'claude-3-haiku-20240307', prompt);
        console.log('Successfully received response from Anthropic');
      } else {
        console.error('No LLM API keys configured - both OpenAI and Anthropic keys are missing');
        throw new Error('No LLM API keys configured');
      }
    } catch (llmError) {
      console.error('LLM service error:', llmError.message);
      console.error('LLM service error stack:', llmError.stack);
      return res.status(500).json({
        success: false,
        error: 'Script generation service is temporarily unavailable. Please try again later.'
      });
    }

    if (!script || script.trim().length === 0) {
      console.log('Empty script generated');
      return res.status(500).json({
        success: false,
        error: 'Failed to generate a valid script. Please try rephrasing your description.'
      });
    }

    console.log(`Raw script generated: ${script}`);

    // Clean up the script (remove any markdown formatting if present)
    let cleanScript = script.trim();
    if (cleanScript.startsWith('```')) {
      cleanScript = cleanScript.replace(/^```[\w]*\n?/, '').replace(/\n?```$/, '');
    }

    console.log(`Cleaned script: ${cleanScript}`);

    // Update user's script generation count and handle credits
    console.log(`=== UPDATING USER COUNTERS ===`);
    const updateData = { $inc: { scripts_generated_count: 1 } };

    if (user.subscription_plan === 'per-script' && !isAdmin) {
      // Deduct one credit for per-script users
      updateData.$inc.credits = -1;
      console.log(`Deducting 1 credit from per-script user ${userId}`);
      console.log(`User current credits before deduction: ${user.credits}`);
    }

    console.log(`Update data for counters:`, updateData);
    const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true });
    console.log(`User after counter update - plan: ${updatedUser.subscription_plan}, credits: ${updatedUser.credits}, scripts_generated: ${updatedUser.scripts_generated_count}`);
    console.log(`=== END UPDATING USER COUNTERS ===`);

    console.log(`Script generated successfully for user ${userId}, counters updated`);

    res.json({
      success: true,
      script: cleanScript
    });

  } catch (error) {
    console.error('Script generation error:', error.message, error.stack);
    res.status(500).json({
      success: false,
      error: 'An unexpected error occurred while generating the script'
    });
  }
});

// POST /api/scripts/save - Save generated script to user's history
router.post('/save', requireUser, async (req, res) => {
  try {
    const { name, description, script } = req.body;
    const userId = req.user.id;

    console.log(`=== SAVE SCRIPT REQUEST ===`);
    console.log(`Save script request from user ${userId}`);
    console.log(`Script name: "${name}"`);

    // Validate input
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      console.log('VALIDATION ERROR: Invalid name provided');
      return res.status(400).json({
        success: false,
        error: 'Script name is required'
      });
    }

    if (!script || typeof script !== 'string' || script.trim().length === 0) {
      console.log('VALIDATION ERROR: Invalid script provided');
      return res.status(400).json({
        success: false,
        error: 'Script content is required'
      });
    }

    // if (!originalDescription || typeof originalDescription !== 'string' || originalDescription.trim().length === 0) {
    //   console.log('VALIDATION ERROR: Invalid original description provided');
    //   return res.status(400).json({
    //     success: false,
    //     error: 'Original description is required'
    //   });
    // }

    // Create new script
    const newScript = new Script({
      name: name.trim(),
      description: description ? description.trim() : '',
      script: script.trim(),
      userId: userId
    });

    const savedScript = await newScript.save();
    console.log(`Script saved successfully with ID: ${savedScript._id}`);

    res.json({
      success: true,
      scriptId: savedScript._id.toString()
    });

  } catch (error) {
    console.error('Save script error:', error.message, error.stack);
    res.status(500).json({
      success: false,
      error: 'An unexpected error occurred while saving the script'
    });
  }
});

// GET /api/scripts/history - Get user's saved scripts
router.get('/history', requireUser, async (req, res) => {
  try {
    const userId = req.user.id;

    console.log(`=== GET SCRIPT HISTORY REQUEST ===`);
    console.log(`Get script history request from user ${userId}`);

    const scripts = await Script.find({ userId })
      .sort({ createdAt: -1 })
      .select('name description script originalDescription createdAt');

    console.log(`Found ${scripts.length} scripts for user ${userId}`);

    res.json({
      success: true,
      scripts: scripts
    });

  } catch (error) {
    console.error('Get script history error:', error.message, error.stack);
    res.status(500).json({
      success: false,
      error: 'An unexpected error occurred while retrieving scripts'
    });
  }
});

// PUT /api/scripts/:id - Update script details
router.put('/:id', requireUser, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    const userId = req.user.id;

    console.log(`=== UPDATE SCRIPT REQUEST ===`);
    console.log(`Update script request from user ${userId} for script ${id}`);

    // Validate input
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      console.log('VALIDATION ERROR: Invalid name provided');
      return res.status(400).json({
        success: false,
        error: 'Script name is required'
      });
    }

    // Find and update script (only if it belongs to the user)
    const updatedScript = await Script.findOneAndUpdate(
      { _id: id, userId: userId },
      {
        name: name.trim(),
        description: description ? description.trim() : ''
      },
      { new: true }
    );

    if (!updatedScript) {
      console.log(`Script ${id} not found or doesn't belong to user ${userId}`);
      return res.status(404).json({
        success: false,
        error: 'Script not found'
      });
    }

    console.log(`Script ${id} updated successfully`);

    res.json({
      success: true
    });

  } catch (error) {
    console.error('Update script error:', error.message, error.stack);
    res.status(500).json({
      success: false,
      error: 'An unexpected error occurred while updating the script'
    });
  }
});

// DELETE /api/scripts/:id - Delete a saved script
router.delete('/:id', requireUser, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    console.log(`=== DELETE SCRIPT REQUEST ===`);
    console.log(`Delete script request from user ${userId} for script ${id}`);

    // Find and delete script (only if it belongs to the user)
    const deletedScript = await Script.findOneAndDelete({
      _id: id,
      userId: userId
    });

    if (!deletedScript) {
      console.log(`Script ${id} not found or doesn't belong to user ${userId}`);
      return res.status(404).json({
        success: false,
        error: 'Script not found'
      });
    }

    console.log(`Script ${id} deleted successfully`);

    res.json({
      success: true
    });

  } catch (error) {
    console.error('Delete script error:', error.message, error.stack);
    res.status(500).json({
      success: false,
      error: 'An unexpected error occurred while deleting the script'
    });
  }
});

module.exports = router;