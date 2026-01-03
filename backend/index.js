const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: true, // Allow all origins (for debugging Vercel/local mix)
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'x-gym-subdomain',
      'x-gym-id',
      'x-admin-id',
      'ngrok-skip-browser-warning',
    ],
  })
);
app.use(express.json({ limit: '10mb' })); // Increased limit for base64 images
app.use(express.urlencoded({ limit: '10mb', extended: true }));

const path = require('path');

// Middleware
const { extractGymContext } = require('./middleware/tenantMiddleware');

// Serve uploads statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
const adminRoutes = require('./routes/admin');
const clientRoutes = require('./routes/client');
const superAdminRoutes = require('./routes/superAdmin');

// Apply gym context extraction globally
app.use(extractGymContext);

// Mount routes
app.use('/api/client', clientRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/super-admin', superAdminRoutes);

// Global Error Handler (Deep Debugging)
app.use((err, req, res, next) => {
  console.error('🔥 GLOBAL ERROR:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
});

app.get('/', (req, res) => {
  res.send('GymNexus API is running (Multi-Tenant v3)');
});

const { seedDatabase } = require('./database');
const { startSuspensionChecker } = require('./jobs/suspensionChecker');

// Only start server if not running in Vercel (serverless)
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, async () => {
    await seedDatabase();
    startSuspensionChecker();
    console.log(`Server running on port ${PORT}`);
  });
}

// Export for Vercel
module.exports = app;
