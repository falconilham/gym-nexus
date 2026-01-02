const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
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
app.use('/api/super-admin', superAdminRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/client', clientRoutes);

app.get('/', (req, res) => {
  res.send('GymNexus API is running (Multi-Tenant v3)');
});

const { seedDatabase } = require('./database');

app.listen(PORT, async () => {
  await seedDatabase();
  console.log(`Server running on port ${PORT}`);
});
