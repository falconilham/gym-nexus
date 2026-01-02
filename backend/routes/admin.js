const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const {
  User,
  Member,
  Gym,
  Admin,
  Class,
  Equipment,
  CheckIn,
  Trainer,
  Specialty,
} = require('../database');
const { requireFeature } = require('../middleware/featureGuard');

// Admin Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const admin = await Admin.findOne({
      where: { email },
      include: [{ model: Gym }],
    });

    if (admin && (await admin.validPassword(password))) {
      // Return admin info sans password
      const { password: _, ...adminInfo } = admin.toJSON();
      res.json({
        success: true,
        admin: {
          ...adminInfo,
          gymName: admin.Gym?.name,
        },
      });
    } else {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get Dashboard Stats
router.get('/stats', requireFeature('dashboard'), async (req, res) => {
  try {
    const totalMembers = await Member.count();
    const activeMembers = await Member.count({ where: { status: 'Active' } });

    // Get today's check-ins (granted only)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const dailyCheckIns = await CheckIn.count({
      where: {
        status: 'granted',
        timestamp: {
          [Op.gte]: today,
          [Op.lt]: tomorrow,
        },
      },
    });

    res.json({
      totalMembers,
      dailyCheckIns,
      revenue: '45.2k', // Still mock for now
      activeMembers,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get Gym Settings
router.get('/settings', requireFeature('settings'), async (req, res) => {
  try {
    const gymId = req.gymId;
    if (!gymId) return res.status(400).json({ error: 'Gym context missing' });

    const gym = await Gym.findByPk(gymId, {
      attributes: ['name', 'logo', 'primaryColor', 'secondaryColor', 'address', 'phone', 'email'],
    });

    if (!gym) return res.status(404).json({ error: 'Gym not found' });

    res.json(gym);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure Multer for local file storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'logo-' + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

// ... existing code ...

// Update Gym Settings
router.put('/settings', requireFeature('settings'), upload.single('logoFile'), async (req, res) => {
  try {
    const gymId = req.gymId;
    if (!gymId) return res.status(400).json({ error: 'Gym context missing' });

    const { logo, primaryColor, secondaryColor, name, address, phone, email } = req.body;

    const gym = await Gym.findByPk(gymId);
    if (!gym) return res.status(404).json({ error: 'Gym not found' });

    // Handle File Upload
    if (req.file) {
      // Construct public URL dynamically if API_URL is not set
      const protocol = req.protocol;
      const host = req.get('host');
      const startUrl = process.env.API_URL || `${protocol}://${host}`;
      gym.logo = `${startUrl}/uploads/${req.file.filename}`;
    } else if (logo !== undefined) {
      // Handle case where user might paste a URL directly, or clearing it
      gym.logo = logo;
    }

    if (primaryColor !== undefined) gym.primaryColor = primaryColor;
    if (secondaryColor !== undefined) gym.secondaryColor = secondaryColor;
    if (name !== undefined) gym.name = name;
    if (address !== undefined) gym.address = address;
    if (phone !== undefined) gym.phone = phone;
    if (email !== undefined) gym.email = email;

    await gym.save();
    res.json(gym);
  } catch (err) {
    console.error('Error saving settings:', err);
    res.status(500).json({ error: err.message });
  }
});

// Member Management
// Member Management
router.get('/members', requireFeature('members'), async (req, res) => {
  try {
    const gymId = req.gymId || req.query.gymId;
    const { search, status } = req.query;

    if (!gymId) {
      return res.status(400).json({ error: 'Gym context required' });
    }

    const where = { gymId };

    // Status Filtering
    if (status && status !== 'all') {
      if (status === 'suspended') {
        where.suspended = true;
      } else if (status === 'active') {
        where.status = 'Active';
        where.suspended = false;
      } else if (status === 'expired') {
        // Simple check for now, ideally check dates
        where.status = 'Expired';
      }
    }

    const includeUser = {
      model: User,
      attributes: ['name', 'email', 'phone', 'memberPhoto'],
    };

    // Search Filtering (Name or Email)
    if (search) {
      includeUser.where = {
        [Op.or]: [
          { email: { [Op.iLike]: `%${search}%` } },
          { phone: { [Op.iLike]: `%${search}%` } },
        ],
      };
    }

    const members = await Member.findAll({
      where,
      include: [includeUser],
    });

    // Flatten structure for frontend
    const formattedMembers = members.map(m => ({
      id: m.id,
      gymId: m.gymId,
      userId: m.userId,
      status: m.status,
      suspended: m.suspended,
      joinDate: m.joinDate,
      endDate: m.endDate,
      duration: m.duration,
      name: m.User ? m.User.name : 'Unknown',
      email: m.User ? m.User.email : 'Unknown',
      phone: m.User ? m.User.phone : '',
      memberPhoto: m.User ? m.User.memberPhoto : '',
      User: m.User, // Include full User object for edit modal
    }));

    res.json(formattedMembers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/members', requireFeature('members'), async (req, res) => {
  try {
    const { name, email, phone, duration, gymId, memberPhoto } = req.body;

    if (!gymId) {
      return res.status(400).json({ error: 'gymId is required' });
    }

    // 1. Find or Create User
    let user = await User.findOne({ where: { email } });
    if (!user) {
      user = await User.create({
        name,
        email,
        password: 'password', // Default password
        phone: phone || '',
        memberPhoto: memberPhoto || null,
      });
    } else {
      // Update user info if provided
      if (phone) user.phone = phone;
      if (memberPhoto) user.memberPhoto = memberPhoto;
      await user.save();
    }

    // 2. Check if already a member of this gym
    const existingMembership = await Member.findOne({
      where: {
        userId: user.id,
        gymId: gymId,
      },
    });

    if (existingMembership) {
      return res.status(400).json({ error: 'User is already a member of this gym' });
    }

    // 3. Create Membership (Member table)
    const joinDate = new Date();
    const endDate = new Date(joinDate);
    const monthsToAdd = parseInt(duration) || 1;
    endDate.setMonth(endDate.getMonth() + monthsToAdd);

    const newMember = await Member.create({
      gymId,
      userId: user.id,
      status: 'Active',
      joinDate: joinDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      duration,
    });

    // Return combined data or just the membership
    // The frontend expects { name, email, ... } alongside id
    res.status(201).json({
      ...newMember.toJSON(),
      name: user.name,
      email: user.email,
    });
  } catch (err) {
    console.error('Error creating member:', err);
    res.status(500).json({ error: err.message });
  }
});

router.delete('/members/:id', requireFeature('members'), async (req, res) => {
  try {
    const { id } = req.params;
    await Member.destroy({ where: { id } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/members/:id', requireFeature('members'), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, memberPhoto, extendDuration } = req.body;

    const member = await Member.findByPk(id);
    if (!member) {
      return res.status(404).json({ error: 'Member not found' });
    }

    // Update User info
    const user = await User.findByPk(member.userId);
    if (user) {
      if (name) user.name = name;
      if (email) user.email = email;
      if (phone !== undefined) user.phone = phone;
      if (memberPhoto) user.memberPhoto = memberPhoto;
      await user.save();
    }

    // Handle Extension
    if (extendDuration) {
      const currentEndDate =
        new Date(member.endDate) > new Date() ? new Date(member.endDate) : new Date();

      const monthsToAdd = parseInt(extendDuration) || 1;
      currentEndDate.setMonth(currentEndDate.getMonth() + monthsToAdd);

      member.endDate = currentEndDate.toISOString().split('T')[0];
      member.status = 'Active'; // Reactivate if expired
    }

    await member.save();

    // Return updated data (with user info)
    const updatedUser = await User.findByPk(member.userId);
    res.json({
      ...member.toJSON(),
      name: updatedUser ? updatedUser.name : '',
      email: updatedUser ? updatedUser.email : '',
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Suspend/Unsuspend Member
router.patch('/members/:id/suspend', requireFeature('members'), async (req, res) => {
  try {
    const { id } = req.params;
    const { suspended } = req.body; // true or false

    const member = await Member.findByPk(id);
    if (!member) {
      return res.status(404).json({ error: 'Member not found' });
    }

    member.suspended = suspended;
    await member.save();

    res.json(member);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Equipment Management
router.get('/equipment', requireFeature('settings'), async (req, res) => {
  try {
    const equipment = await Equipment.findAll();
    res.json(equipment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Schedule Management
router.get('/classes', requireFeature('schedule'), async (req, res) => {
  try {
    const classes = await Class.findAll();
    res.json(classes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Check-In / Check-Out Endpoint
router.post('/check-in', async (req, res) => {
  try {
    const { userId, gymId, membershipId } = req.body;

    if (!userId || !gymId || !membershipId) {
      return res.status(400).json({
        success: false,
        access: 'denied',
        reason: 'invalid_request',
        message: 'User ID, Gym ID, and Membership ID are required',
      });
    }

    // Find user
    const user = await User.findByPk(userId);
    if (!user) {
      await CheckIn.create({
        gymId,
        memberId: membershipId,
        memberName: 'Unknown',
        status: 'denied',
        reason: 'not_found',
      });
      return res.status(404).json({
        success: false,
        access: 'denied',
        reason: 'not_found',
        message: 'User not found',
      });
    }

    // Find membership
    const membership = await Member.findOne({
      where: {
        id: membershipId,
        userId: userId,
        gymId: gymId,
      },
      include: [{ model: Gym }],
    });

    if (!membership) {
      await CheckIn.create({
        gymId,
        memberId: membershipId,
        memberName: user.name,
        status: 'denied',
        reason: 'not_found',
      });
      return res.status(404).json({
        success: false,
        access: 'denied',
        reason: 'not_found',
        message: 'Membership not found for this gym',
      });
    }

    // Verify gym context matches (security check)
    if (req.gymId && req.gymId !== gymId) {
      return res.status(403).json({
        success: false,
        access: 'denied',
        reason: 'wrong_gym',
        message: 'This QR code is for a different gym',
      });
    }

    // Check Suspended
    if (membership.suspended) {
      await CheckIn.create({
        gymId,
        memberId: membershipId,
        memberName: user.name,
        status: 'denied',
        reason: 'suspended',
      });
      return res.status(403).json({
        success: false,
        access: 'denied',
        reason: 'suspended',
        message: 'Membership suspended.',
        member: { name: user.name },
      });
    }

    // Check Expired
    if (membership.endDate && new Date(membership.endDate) < new Date()) {
      await CheckIn.create({
        gymId,
        memberId: membershipId,
        memberName: user.name,
        status: 'denied',
        reason: 'expired',
      });
      return res.status(403).json({
        success: false,
        access: 'denied',
        reason: 'expired',
        message: 'Membership expired.',
        member: { name: user.name },
      });
    }

    // --- CHECK-IN / CHECK-OUT LOGIC ---
    // Look for an active session: granted check-in within last 12 hours that has NO checkOutTime
    const twelveHoursAgo = new Date(Date.now() - 12 * 60 * 60 * 1000);

    const activeSession = await CheckIn.findOne({
      where: {
        gymId: gymId,
        memberId: membershipId,
        status: 'granted',
        checkOutTime: null,
        timestamp: {
          [require('sequelize').Op.gte]: twelveHoursAgo,
        },
      },
      order: [['timestamp', 'DESC']],
    });

    // Calculate days remaining
    let daysRemaining = 0;
    if (membership.endDate) {
      const end = new Date(membership.endDate);
      const now = new Date();
      daysRemaining = Math.max(0, Math.ceil((end - now) / (1000 * 60 * 60 * 24)));
    }

    if (activeSession) {
      // PERFORM CHECK-OUT
      activeSession.checkOutTime = new Date();
      await activeSession.save();

      return res.json({
        success: true,
        access: 'granted',
        type: 'checkout',
        message: `Goodbye ${user.name}! Checked out successfully.`,
        member: {
          id: user.id,
          name: user.name,
          email: user.email,
          status: membership.status,
          daysRemaining,
          gymName: membership.Gym.name,
        },
      });
    } else {
      // PERFORM CHECK-IN
      await CheckIn.create({
        gymId,
        memberId: membershipId,
        memberName: user.name,
        status: 'granted',
        reason: null,
      });

      return res.json({
        success: true,
        access: 'granted',
        type: 'checkin',
        message: `Welcome ${user.name}!`,
        member: {
          id: user.id,
          name: user.name,
          email: user.email,
          status: membership.status,
          daysRemaining,
          gymName: membership.Gym.name,
        },
      });
    }
  } catch (err) {
    console.error('Check-in error:', err);
    res.status(500).json({
      success: false,
      access: 'denied',
      reason: 'server_error',
      message: 'Server error. Please try again.',
    });
  }
});

// Get Recent Check-Ins (with optional date filter)
router.get('/check-ins', requireFeature('dashboard'), async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const { date } = req.query;

    // Default where clause for Gym
    const where = { gymId: req.gymId || req.query.gymId }; // Handle existing logic
    if (!where.gymId) return res.status(400).json({ error: 'Gym context required' });

    if (date) {
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);

      where.timestamp = {
        [Op.gte]: start,
        [Op.lte]: end,
      };
    }

    const checkIns = await CheckIn.findAll({
      where,
      order: [['timestamp', 'DESC']],
      limit: date ? 1000 : limit, // If date is selected, show all (up to 1000), otherwise limit
    });
    res.json(checkIns);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Trainer Management
// Get all trainers for a gym
router.get('/trainers', requireFeature('trainers'), async (req, res) => {
  try {
    const gymId = req.gymId || req.query.gymId;
    const { search, specialty, minRating, maxPrice } = req.query;

    if (!gymId) {
      return res.status(400).json({ error: 'Gym context required' });
    }

    const where = { gymId };

    if (search) {
      where.name = { [Op.iLike]: `%${search}%` };
    }

    // Client sends 'All' for no category
    if (specialty && specialty !== 'All') {
      where.specialty = { [Op.iLike]: `%${specialty}%` };
    }

    if (minRating) {
      where.rating = { [Op.gte]: parseFloat(minRating) };
    }

    if (maxPrice) {
      where.singleSessionPrice = { [Op.lte]: parseFloat(maxPrice) };
    }

    const trainers = await Trainer.findAll({
      where,
      order: [['name', 'ASC']],
    });

    res.json(trainers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Specialty Management
router.get('/specialties', requireFeature('trainers'), async (req, res) => {
  try {
    const gymId = req.gymId || req.query.gymId;
    if (!gymId) return res.status(400).json({ error: 'Gym context required' });
    const specialties = await Specialty.findAll({ where: { gymId }, order: [['name', 'ASC']] });
    res.json(specialties);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/specialties', requireFeature('trainers'), async (req, res) => {
  try {
    const gymId = req.gymId || req.body.gymId || req.query.gymId;
    const { name } = req.body;
    if (!gymId) return res.status(400).json({ error: 'Missing gymId' });
    if (!name) return res.status(400).json({ error: 'Name required' });

    // Prevent duplicates
    const existing = await Specialty.findOne({ where: { gymId, name: { [Op.iLike]: name } } });
    if (existing) return res.status(400).json({ error: 'Specialty already exists' });

    const specialty = await Specialty.create({ gymId, name });
    res.json(specialty);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/specialties/:id', requireFeature('trainers'), async (req, res) => {
  try {
    const { id } = req.params;
    await Specialty.destroy({ where: { id } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a new trainer
router.post('/trainers', requireFeature('trainers'), async (req, res) => {
  try {
    const {
      gymId,
      name,
      specialty,
      rating,
      singleSessionPrice,
      packagePrice,
      packageCount,
      image,
    } = req.body;

    if (!gymId || !name) {
      return res.status(400).json({ error: 'gymId and name are required' });
    }

    const trainer = await Trainer.create({
      gymId,
      name,
      specialty: specialty || 'General',
      rating: rating || 5.0,
      singleSessionPrice: singleSessionPrice || 0,
      packagePrice: packagePrice || 0,
      packageCount: packageCount || 10,
      image: image || null,
    });

    res.status(201).json(trainer);
  } catch (err) {
    console.error('Error creating trainer:', err);
    res.status(500).json({ error: err.message });
  }
});

// Update a trainer
router.put('/trainers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, specialty, rating, singleSessionPrice, packagePrice, packageCount, image } =
      req.body;

    const trainer = await Trainer.findByPk(id);
    if (!trainer) {
      return res.status(404).json({ error: 'Trainer not found' });
    }

    // Update fields
    if (name !== undefined) trainer.name = name;
    if (specialty !== undefined) trainer.specialty = specialty;
    if (rating !== undefined) trainer.rating = rating;
    if (singleSessionPrice !== undefined) trainer.singleSessionPrice = singleSessionPrice;
    if (packagePrice !== undefined) trainer.packagePrice = packagePrice;
    if (packageCount !== undefined) trainer.packageCount = packageCount;
    if (image !== undefined) trainer.image = image;

    await trainer.save();
    res.json(trainer);
  } catch (err) {
    console.error('Error updating trainer:', err);
    res.status(500).json({ error: err.message });
  }
});

// Delete a trainer
router.delete('/trainers/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const trainer = await Trainer.findByPk(id);
    if (!trainer) {
      return res.status(404).json({ error: 'Trainer not found' });
    }

    await trainer.destroy();
    res.json({ success: true, message: 'Trainer deleted successfully' });
  } catch (err) {
    console.error('Error deleting trainer:', err);
    res.status(500).json({ error: err.message });
  }
});

// --- Reports ---

router.get('/reports/peak-hours', requireFeature('dashboard'), async (req, res) => {
  try {
    const gymId = req.gymId || req.query.gymId;
    if (!gymId) return res.status(400).json({ error: 'Gym ID required' });

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const checkIns = await CheckIn.findAll({
      where: {
        gymId,
        status: 'granted',
        timestamp: { [Op.gte]: sevenDaysAgo },
      },
      attributes: ['timestamp'],
    });

    const hourCounts = new Array(24).fill(0);
    checkIns.forEach(c => {
      const h = new Date(c.timestamp).getHours();
      hourCounts[h]++;
    });

    res.json({ hourCounts });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/members/expiring', requireFeature('dashboard'), async (req, res) => {
  try {
    const gymId = req.gymId || req.query.gymId;
    if (!gymId) return res.status(400).json({ error: 'Gym ID required' });

    const today = new Date();
    // Reset time to start of day needed? Op.gte handles it generally.
    // Better to set strictly.
    today.setHours(0, 0, 0, 0);

    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);
    nextWeek.setHours(23, 59, 59, 999);

    const expiringMembers = await Member.findAll({
      where: {
        gymId,
        status: 'Active',
        endDate: {
          [Op.gte]: today,
          [Op.lte]: nextWeek,
        },
      },
      include: [{ model: User, attributes: ['name', 'phone', 'email', 'memberPhoto'] }],
      order: [['endDate', 'ASC']],
      limit: 10,
    });

    const data = expiringMembers.map(m => {
      const end = new Date(m.endDate);
      const now = new Date();
      const daysLeft = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return {
        id: m.id,
        name: m.User ? m.User.name : 'Unknown',
        email: m.User ? m.User.email : 'Unknown',
        phone: m.User ? m.User.phone : '',
        photo: m.User ? m.User.memberPhoto : '',
        endDate: m.endDate,
        daysLeft: Math.max(0, daysLeft), // Avoid negative if expired today
      };
    });

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
