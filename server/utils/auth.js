const jwt = require('jsonwebtoken');

const generateAccessToken = (userId) => {
  try {
    console.log('Generating access token for user:', userId);

    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is not set in environment variables');
      throw new Error('JWT_SECRET is not set in environment variables');
    }

    if (!userId) {
      console.error('User ID is required for token generation');
      throw new Error('User ID is required for token generation');
    }

    const token = jwt.sign(
      { userId: userId.toString() },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    console.log('Access token generated successfully, length:', token.length);
    return token;
  } catch (error) {
    console.error('Error generating access token:', error);
    console.error('Error stack:', error.stack);
    throw error;
  }
};

const generateRefreshToken = (userId) => {
  try {
    console.log('Generating refresh token for user:', userId);

    if (!process.env.REFRESH_TOKEN_SECRET) {
      console.error('REFRESH_TOKEN_SECRET is not set in environment variables');
      throw new Error('REFRESH_TOKEN_SECRET is not set in environment variables');
    }

    if (!userId) {
      console.error('User ID is required for refresh token generation');
      throw new Error('User ID is required for refresh token generation');
    }

    const token = jwt.sign(
      { userId: userId.toString() },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: '7d' }
    );

    console.log('Refresh token generated successfully, length:', token.length);
    return token;
  } catch (error) {
    console.error('Error generating refresh token:', error);
    console.error('Error stack:', error.stack);
    throw error;
  }
};

module.exports = {
  generateAccessToken,
  generateRefreshToken
};