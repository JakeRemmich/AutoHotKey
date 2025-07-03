const mongoose = require('mongoose');
const SubscriptionPlan = require('../models/SubscriptionPlan');
require('dotenv').config();

async function cleanupStripePlans() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.DATABASE_URL);
    console.log('Connected to MongoDB');

    // Delete all existing subscription plans
    const result = await SubscriptionPlan.deleteMany({});
    console.log(`Deleted ${result.deletedCount} subscription plans`);

    console.log('Cleanup completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error during cleanup:', error);
    process.exit(1);
  }
}

cleanupStripePlans();