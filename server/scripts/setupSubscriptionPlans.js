require('dotenv').config();
const mongoose = require('mongoose');
const SubscriptionPlan = require('../models/SubscriptionPlan');
const stripeService = require('../services/stripeService');

async function setupSubscriptionPlans() {
  try {
    console.log('Setting up subscription plans...');

    // Connect to database
    await mongoose.connect(process.env.DATABASE_URL);
    console.log('Connected to database');

    // Clear existing plans
    await SubscriptionPlan.deleteMany({});
    console.log('Cleared existing subscription plans');

    // Define the plans we want
    const plansToCreate = [
      {
        name: 'Pay Per Script',
        description: 'Perfect for occasional users who need scripts from time to time',
        price: 0.99,
        interval: 'one_time',
        currency: 'usd',
        features: [
          'Generate 1 AutoHotkey script',
          'Download .ahk files',
          'No monthly commitment',
          'Email support'
        ],
        planType: 'per-script'
      },
      {
        name: 'Unlimited Plan',
        description: 'Best for power users who need unlimited script generation',
        price: 9.99,
        interval: 'month',
        currency: 'usd',
        features: [
          'Unlimited script generation',
          'Download .ahk files',
          'Save scripts to history',
          'Priority email support',
          'Advanced script features'
        ],
        planType: 'monthly'
      }
    ];

    // Create plans in Stripe and database
    for (const planData of plansToCreate) {
      console.log(`Creating plan: ${planData.name}`);

      // Create product in Stripe
      const product = await stripeService.createProduct(planData.name, planData.description);

      // Create price in Stripe
      const price = await stripeService.createPrice(
        product.id,
        planData.price,
        planData.currency,
        planData.interval
      );

      // Save plan to database
      const subscriptionPlan = new SubscriptionPlan({
        ...planData,
        stripeProductId: product.id,
        stripePriceId: price.id
      });

      await subscriptionPlan.save();
      console.log(`Successfully created plan: ${planData.name} (${subscriptionPlan._id})`);
    }

    console.log('All subscription plans created successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error setting up subscription plans:', error);
    process.exit(1);
  }
}

setupSubscriptionPlans();