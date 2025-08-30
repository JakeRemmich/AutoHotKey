const express = require('express');
const { requireUser, requireAdmin } = require('./middleware/auth');
const subscriptionService = require('../services/subscriptionService');

const router = express.Router();

// GET /api/subscription-plans - Get all active subscription plans
router.get('/subscription-plans', async (req, res) => {
  try {
    console.log('Getting subscription plans');

    const plans = await subscriptionService.getSubscriptionPlans(true);

    return res.status(200).json({
      success: true,
      data: plans
    });
  } catch (error) {
    console.error(`Error getting subscription plans: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve subscription plans',
      error: error.message
    });
  }
});

// POST /api/subscription-plans - Create new subscription plan (admin only)
router.post('/subscription-plans', requireAdmin, async (req, res) => {
  try {
    console.log('Creating new subscription plan');

    const { name, description, price, interval, currency, features, planType } = req.body;

    if (!name || !description || !price || !interval || !features || !planType) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: name, description, price, interval, features, planType'
      });
    }

    const planData = {
      name,
      description,
      price,
      interval,
      currency: currency || 'usd',
      features,
      planType
    };

    const plan = await subscriptionService.createSubscriptionPlan(planData);

    return res.status(201).json({
      success: true,
      data: plan,
      message: 'Subscription plan created successfully'
    });
  } catch (error) {
    console.error(`Error creating subscription plan: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Failed to create subscription plan',
      error: error.message
    });
  }
});
router.patch('/subscription-plans/:id', requireAdmin, async (req, res) => {
  try {
    console.log('Editing subscription plan');
    const { id } = req.params;
    const { name, description, price, interval, currency, features, planType } = req.body;

    // Validate the plan exists
    const existingPlan = await subscriptionService.getSubscriptionPlanById(id);
    if (!existingPlan) {
      return res.status(404).json({
        success: false,
        message: 'Subscription plan not found'
      });
    }

    const planData = {
      id,
      name,
      description,
      price,
      interval,
      currency: currency || 'usd',
      features,
      planType
    };

    // Call the edit method instead of create
    const updatedPlan = await subscriptionService.editSubscriptionPlan(planData);

    return res.status(200).json({
      success: true,
      data: updatedPlan,
      message: 'Subscription plan updated successfully'
    });
  } catch (error) {
    console.error(`Error editing subscription plan: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Failed to edit subscription plan',
      error: error.message
    });
  }
});
router.delete('/subscription-plans/:id', requireAdmin, async (req, res) => {
  try {
    console.log('Deleting subscription plan');
    const { id } = req.params;

    // Validate the plan exists
    const existingPlan = await subscriptionService.getSubscriptionPlanById(id);
    if (!existingPlan) {
      return res.status(404).json({
        success: false,
        message: 'Subscription plan not found'
      });
    }

    // Check if plan has active subscriptions
    const hasActiveSubscriptions = await subscriptionService.checkActiveSubscriptions(id);
    if (hasActiveSubscriptions) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete subscription plan with active subscriptions. Please cancel all subscriptions first.'
      });
    }

    await subscriptionService.deleteSubscriptionPlan(id);

    return res.status(200).json({
      success: true,
      message: 'Subscription plan deleted successfully'
    });
  } catch (error) {
    console.error(`Error deleting subscription plan: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete subscription plan',
      error: error.message
    });
  }
});

// POST /api/checkout-sessions - Create Stripe checkout session
router.post('/checkout-sessions', requireUser, async (req, res) => {
  try {
    console.log(`Creating checkout session for user: ${req.user._id}`);

    const { planId, successUrl, cancelUrl } = req.body;

    if (!planId || !successUrl || !cancelUrl) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: planId, successUrl, cancelUrl'
      });
    }

    const session = await subscriptionService.createCheckoutSession(
      req.user._id,
      planId,
      successUrl,
      cancelUrl
    );

    return res.status(200).json({
      success: true,
      data: {
        url: session.url,
        sessionId: session.id
      }
    });
  } catch (error) {
    console.error(`Error creating checkout session: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Failed to create checkout session',
      error: error.message
    });
  }
});

// POST /stripe-webhook - Handle Stripe webhooks (note: no /api prefix here since it's handled in server.js)
router.post('/stripe-webhook', async (req, res) => {
  try {
    console.log('=== STRIPE WEBHOOK RECEIVED ===');
    console.log('Request headers:', req.headers);
    console.log('Request body type:', typeof req.body);
    console.log('Request body length:', req.body ? req.body.length : 'undefined');

    const sig = req.headers['stripe-signature'];
    if (!sig) {
      console.error('No stripe-signature header found');
      return res.status(400).send('No stripe-signature header');
    }

    const stripeService = require('../services/stripeService');
    const User = require('../models/User'); // Move this to the top

    if (!stripeService.stripe) {
      console.error('Stripe service not initialized');
      return res.status(500).send('Stripe service not initialized');
    }

    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      console.error('STRIPE_WEBHOOK_SECRET not configured');
      return res.status(500).send('Webhook secret not configured');
    }

    let event;
    try {
      console.log('Constructing webhook event...');
      event = stripeService.stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
      console.log(`Webhook event type: ${event.type}`);
      console.log(`Event ID: ${event.id}`);
    } catch (err) {
      console.error(`Webhook signature verification failed: ${err.message}`);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        console.log('Processing checkout.session.completed event');
        const session = event.data.object;
        console.log(`Session ID: ${session.id}, Customer: ${session.customer}, Mode: ${session.mode}`);
        console.log('=== FULL SESSION OBJECT ===');
        console.log(JSON.stringify(session, null, 2));
        console.log('=== END FULL SESSION OBJECT ===');

        const planId = session.metadata.planId
        // Find user by Stripe customer ID
        const user = await User.findOne({ stripeCustomerId: session.customer });

        if (!user) {
          console.error(`User not found for customer ID: ${session.customer}`);
          console.log('=== SEARCHING FOR USER BY CUSTOMER ID ===');
          const allUsers = await User.find({}).select('email stripeCustomerId subscription_plan credits');
          console.log('All users with Stripe customer IDs:', allUsers);
          console.log('=== END USER SEARCH ===');
          break;
        }

        console.log(`Found user: ${user.email} (${user._id})`);
        console.log(`User current plan: ${user.subscription_plan}, credits: ${user.credits}`);

        // Update user subscription based on session mode
        if (session.mode === 'subscription') {
          // Handle subscription
          const subscription = await stripeService.getSubscription(session.subscription);
          console.log(`Subscription status: ${subscription.status}`);
          console.log(`Subscription current_period_end: ${subscription.current_period_end}`);
          console.log(`Subscription current_period_end type: ${typeof subscription.current_period_end}`);

          // Validate and convert the end date
          let endDate = null;
          if (subscription.current_period_end && typeof subscription.current_period_end === 'number') {
            endDate = new Date(subscription.current_period_end * 1000);
            console.log(`Converted end date: ${endDate}`);
            console.log(`End date is valid: ${!isNaN(endDate.getTime())}`);

            if (isNaN(endDate.getTime())) {
              console.error(`Invalid date created from timestamp: ${subscription.current_period_end}`);
              endDate = null;
            }
          } else {
            console.error(`Invalid current_period_end value: ${subscription.current_period_end}`);
          }

          console.log('=== UPDATING USER WITH MONTHLY SUBSCRIPTION ===');
          await subscriptionService.updateUserSubscription(user._id, {
            planType: 'monthly',
            status: subscription.status,
            endDate: endDate,
            stripeSubscriptionId: subscription.id,
            subscription_plan_id: planId
          });

          console.log(`Updated user ${user._id} with monthly subscription`);
        } else if (session.mode === 'payment') {
          // Handle one-time payment (per-script) - give 1 credit
          console.log(`=== PROCESSING PER-SCRIPT PAYMENT ===`);
          console.log(`Processing per-script payment for user ${user._id}`);
          console.log(`User before update - plan: ${user.subscription_plan}, credits: ${user.credits}`);

          // For per-script purchases, we add 1 credit (the service will handle adding to existing credits)
          const updateResult = await subscriptionService.updateUserSubscription(user._id, {
            planType: 'per-script',
            status: 'active',
            endDate: null,
            credits: 1, // This will be added to existing credits
            subscription_plan_id: planId
          });

          console.log(`Update result:`, updateResult);
          console.log(`Updated user ${user._id} with per-script payment and 1 credit`);

          // Verify the update by fetching the user again
          const updatedUser = await User.findById(user._id);
          console.log(`User after update - plan: ${updatedUser.subscription_plan}, credits: ${updatedUser.credits}`);

          // Additional verification: ensure credits were actually updated
          if (updatedUser.credits <= user.credits) {
            console.error(`CRITICAL ERROR: Credits were not properly added! Before: ${user.credits}, After: ${updatedUser.credits}`);

            // Attempt manual credit update as fallback
            console.log(`Attempting manual credit update for user ${user._id}`);
            const manualUpdate = await User.findByIdAndUpdate(
              user._id,
              { $inc: { credits: 1 } },
              { new: true }
            );
            console.log(`Manual update result - credits: ${manualUpdate.credits}`);
          } else {
            console.log(`SUCCESS: Credits properly updated from ${user.credits} to ${updatedUser.credits}`);
          }

          console.log('=== END PROCESSING PER-SCRIPT PAYMENT ===');
        }

        break;

      case 'customer.subscription.updated':
        console.log('Processing customer.subscription.updated event');
        const updatedSubscription = event.data.object;

        const userWithSub = await User.findOne({ stripeSubscriptionId: updatedSubscription.id });
        if (userWithSub) {
          // Validate and convert the end date
          let endDate = null;
          if (updatedSubscription.current_period_end && typeof updatedSubscription.current_period_end === 'number') {
            endDate = new Date(updatedSubscription.current_period_end * 1000);
            if (isNaN(endDate.getTime())) {
              console.error(`Invalid date created from timestamp: ${updatedSubscription.current_period_end}`);
              endDate = null;
            }
          }

          await subscriptionService.updateUserSubscription(userWithSub._id, {
            planType: 'monthly',
            status: updatedSubscription.status,
            endDate: endDate
          });

          console.log(`Updated subscription status for user ${userWithSub._id}: ${updatedSubscription.status}`);
        }
        break;

      case 'customer.subscription.deleted':
        console.log('Processing customer.subscription.deleted event');
        const deletedSubscription = event.data.object;

        const userWithDeletedSub = await User.findOne({ stripeSubscriptionId: deletedSubscription.id });
        if (userWithDeletedSub) {
          await subscriptionService.updateUserSubscription(userWithDeletedSub._id, {
            planType: 'free',
            status: 'canceled',
            endDate: null
          });

          console.log(`Canceled subscription for user ${userWithDeletedSub._id}`);
        }
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    console.log('=== STRIPE WEBHOOK PROCESSED SUCCESSFULLY ===');
    res.json({ received: true });
  } catch (error) {
    console.error(`Webhook error: ${error.message}`);
    console.error(error.stack);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/subscriptions/status - Get current user's subscription status
router.get('/subscriptions/status', requireUser, async (req, res) => {
  try {
    console.log(`Getting subscription status for user: ${req.user._id}`);

    const subscriptionStatus = await subscriptionService.getUserSubscriptionStatus(req.user._id);

    return res.status(200).json({
      success: true,
      data: subscriptionStatus
    });
  } catch (error) {
    console.error(`Error getting subscription status: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve subscription status',
      error: error.message
    });
  }
});

// POST /api/subscriptions/cancel - Cancel current subscription
router.post('/subscriptions/cancel', requireUser, async (req, res) => {
  try {
    console.log(`Canceling subscription for user: ${req.user._id}`);

    const user = await require('../models/User').findById(req.user._id);
    if (!user || !user.stripeSubscriptionId) {
      return res.status(400).json({
        success: false,
        message: 'No active subscription found'
      });
    }

    const stripeService = require('../services/stripeService');
    await stripeService.cancelSubscription(user.stripeSubscriptionId);

    // Update user subscription status
    await subscriptionService.updateUserSubscription(req.user._id, {
      planType: 'free',
      status: 'canceled',
      endDate: null
    });

    return res.status(200).json({
      success: true,
      message: 'Subscription canceled successfully'
    });
  } catch (error) {
    console.error(`Error canceling subscription: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Failed to cancel subscription',
      error: error.message
    });
  }
});

module.exports = router;