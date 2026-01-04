/**
 * Main Server for FitFlow - Kilat Hosting
 * Serves both Backend API and Next.js Admin Panel
 */

const express = require('express');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: path.join(__dirname, 'backend/.env.production') });

const app = express();
const PORT = process.env.PORT || 3000;

console.log('🚀 Starting FitFlow Server...');
console.log('📁 Directory:', __dirname);

// Import backend app
const backendApp = require('./backend/index.js');

// Mount backend API routes
app.use('/api', backendApp);
console.log('✓ Backend API mounted at /api');

// Serve Next.js admin panel (standalone mode)
const nextPath = path.join(__dirname, 'admin/.next/standalone');
const adminPublicPath = path.join(__dirname, 'admin/public');

try {
  // Serve Next.js static files
  app.use('/_next/static', express.static(path.join(__dirname, 'admin/.next/static')));
  app.use('/static', express.static(adminPublicPath));

  console.log('✓ Next.js static files configured');

  // Import Next.js server
  const nextServer = require(path.join(nextPath, 'server.js'));

  // Mount Next.js app for all other routes
  app.use('/', (req, res, next) => {
    // Skip API routes
    if (req.path.startsWith('/api')) {
      return next();
    }

    // Handle Next.js routes
    nextServer.getRequestHandler()(req, res);
  });

  console.log('✓ Next.js admin panel mounted');
} catch (error) {
  console.error('⚠ Warning: Next.js standalone server not found');
  console.error('Error:', error.message);
  console.log('Please build the admin panel first with: npm run build:admin:prod');

  // Fallback message
  app.get('*', (req, res) => {
    if (req.path.startsWith('/api')) {
      return res.status(404).json({ error: 'API endpoint not found' });
    }

    res.status(503).send(`
      <html>
        <head><title>FitFlow - Building...</title></head>
        <body style="font-family: Arial; padding: 50px; text-align: center;">
          <h1>🏗️ FitFlow is being set up...</h1>
          <p>The admin panel is not built yet.</p>
          <p>Please run: <code>npm run build:admin:prod</code></p>
          <hr>
          <p><a href="/api">Backend API is available here</a></p>
        </body>
      </html>
    `);
  });
}

// Global error handler
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Start server
const { seedDatabase } = require('./backend/database');
const { startSuspensionChecker } = require('./backend/jobs/suspensionChecker');

app.listen(PORT, async () => {
  console.log(`
╔════════════════════════════════════════╗
║        FitFlow Server - LIVE           ║
╚════════════════════════════════════════╝
  
  🚀 Server running on port ${PORT}
  📊 Environment: ${process.env.NODE_ENV || 'development'}
  🔗 API: http://localhost:${PORT}/api
  🖥️  Admin: http://localhost:${PORT}
  ❤️  Health: http://localhost:${PORT}/health
  
  `);

  // Initialize database
  try {
    await seedDatabase();
    console.log('✓ Database initialized');
  } catch (error) {
    console.error('✗ Database initialization failed:', error.message);
  }

  // Start background jobs
  try {
    startSuspensionChecker();
    console.log('✓ Background jobs started');
  } catch (error) {
    console.error('✗ Background jobs failed:', error.message);
  }

  console.log('\n🎉 FitFlow is ready!\n');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully...');
  process.exit(0);
});

module.exports = app;
