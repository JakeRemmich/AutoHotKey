// Load environment variables
require("dotenv").config();
const express = require("express");
const basicRoutes = require("./routes/index");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const scriptRoutes = require("./routes/scriptRoutes");
const subscriptionRoutes = require("./routes/subscriptionRoutes");
const { connectDB } = require("./config/database");
const cors = require("cors");
const cron = require('node-cron');
const subscriptionService = require("./services/subscriptionService");
const morgan = require("morgan");

if (!process.env.MONGODB_URI) {
  console.error("Error: DATABASE_URL variables in .env missing.");
  process.exit(-1);
}

const app = express();
const port = process.env.PORT || 5000;
app.enable('json spaces');
// We want to be consistent with URL paths, so we enable strict routing
app.enable('strict routing');

app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
}));
if (process.env.NODE_ENV !== "production") {
  app.use(morgan("tiny"));
}// IMPORTANT: Webhook route must be defined BEFORE express.json() middleware
// because Stripe webhooks need raw body for signature verification
app.use('/api/stripe-webhook', express.raw({ type: 'application/json' }), require('./routes/subscriptionRoutes'));

// Now apply JSON parsing middleware for all other routes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection
connectDB();

app.on("error", (error) => {
  console.error(`Server error: ${error.message}`);
  console.error(error.stack);
});

cron.schedule('0 * * * *', async () => {
  console.log('Checking for expired promotions...');
  await subscriptionService.expirePromotions();
});

// Basic Routes
app.use(basicRoutes);
// Authentication Routes
app.use('/api/auth', authRoutes);
// User Routes
app.use('/api/user', userRoutes);
// Script Routes
app.use('/api/scripts', scriptRoutes);
// Subscription Routes (excluding webhook which is handled above)
app.use('/api', subscriptionRoutes);

// If no routes handled the request, it's a 404
app.use((req, res, next) => {
  res.status(404).send("Page not found.");
});

// Error handling
app.use((err, req, res, next) => {
  console.error(`Unhandled application error: ${err.message}`);
  console.error(err.stack);
  res.status(500).send("There was an error serving your request.");
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:5000`);
});