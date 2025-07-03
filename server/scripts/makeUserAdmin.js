require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

async function makeUserAdmin() {
  try {
    // Connect to database
    await mongoose.connect(process.env.DATABASE_URL);
    console.log('Connected to MongoDB');

    // Find and update the specific user
    const email = 'jdremmich@hotmail.com';
    const user = await User.findOneAndUpdate(
      { email: email },
      { role: 'admin' },
      { new: true }
    );

    if (user) {
      console.log(`Successfully updated user ${email} to admin role`);
      console.log('User details:', {
        _id: user._id,
        email: user.email,
        role: user.role
      });
    } else {
      console.log(`User with email ${email} not found`);
    }

  } catch (error) {
    console.error('Error updating user role:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

makeUserAdmin();