const express = require('express');
const router = express.Router();
const { Gym, Admin, Member, CheckIn, User } = require('../database');
const { Op } = require('sequelize');

// ============================================
// SUPER ADMIN ROUTES
// ============================================

// Super Admin Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find admin by email
    const admin = await Admin.findOne({ where: { email } });

    if (!admin) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Check if user is a super admin
    if (admin.role !== 'super_admin') {
      return res.status(403).json({ error: 'Access denied. Super admin privileges required.' });
    }

    // Verify password
    const isValidPassword = await admin.validPassword(password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Check if account is active
    if (admin.status !== 'active') {
      return res.status(403).json({ error: 'Account is inactive. Please contact support.' });
    }

    res.json({
      success: true,
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (err) {
    console.error('Super admin login error:', err);
    res.status(500).json({ error: 'Login failed. Please try again.' });
  }
});

// Get all gyms with stats
router.get('/gyms', async (req, res) => {
  try {
    const { search, status } = req.query;
    const where = {};

    if (status && status !== 'all') {
      where.status = status;
    }

    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { subdomain: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const gyms = await Gym.findAll({
      where,
      order: [['createdAt', 'DESC']],
    });

    // Enrich with stats
    const gymsWithStats = await Promise.all(
      gyms.map(async gym => {
        const memberCount = await Member.count({ where: { gymId: gym.id } });
        const adminCount = await Admin.count({ where: { gymId: gym.id } });

        // Today's check-ins
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const todayCheckIns = await CheckIn.count({
          where: {
            gymId: gym.id,
            status: 'granted',
            timestamp: {
              [Op.gte]: today,
              [Op.lt]: tomorrow,
            },
          },
        });

        return {
          ...gym.toJSON(),
          memberCount,
          adminCount,
          todayCheckIns,
        };
      })
    );

    res.json(gymsWithStats);
  } catch (err) {
    console.error('Error fetching gyms:', err);
    res.status(500).json({ error: err.message });
  }
});

// Create new gym
router.post('/gyms', async (req, res) => {
  try {
    const {
      name,
      subdomain,
      logo,
      address,
      phone,
      email,
      plan,
      maxMembers,
      adminName,
      adminEmail,
      adminPassword,
      features,
    } = req.body;

    // Validate required fields
    if (!name || !subdomain || !adminEmail || !adminPassword) {
      return res.status(400).json({
        error: 'Missing required fields: name, subdomain, adminEmail, adminPassword',
      });
    }

    // Check if subdomain already exists
    const existingGym = await Gym.findOne({ where: { subdomain } });
    if (existingGym) {
      return res.status(400).json({ error: 'Subdomain already exists' });
    }

    // Check if admin email already exists
    const existingAdmin = await Admin.findOne({ where: { email: adminEmail } });
    if (existingAdmin) {
      return res.status(400).json({ error: 'Admin email already exists' });
    }

    // Create gym
    const gym = await Gym.create({
      name,
      subdomain: subdomain.toLowerCase(),
      logo,
      address,
      phone,
      email,
      plan: plan || 'starter',
      maxMembers: maxMembers || 100,
      status: 'active',
      features: features || ['dashboard', 'members', 'trainers', 'schedule', 'settings'],
    });

    // Create admin for this gym
    const admin = await Admin.create({
      gymId: gym.id,
      name: adminName || 'Admin',
      email: adminEmail,
      password: adminPassword, // TODO: Hash password in production
      role: 'admin',
      status: 'active',
    });

    res.status(201).json({
      gym,
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
      },
    });
  } catch (err) {
    console.error('Error creating gym:', err);
    res.status(500).json({ error: err.message });
  }
});

// Update gym
router.put('/gyms/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, logo, address, phone, email, status, plan, maxMembers, features } = req.body;

    const gym = await Gym.findByPk(id);
    if (!gym) {
      return res.status(404).json({ error: 'Gym not found' });
    }

    // Update fields
    if (name) gym.name = name;
    if (logo !== undefined) gym.logo = logo;
    if (address !== undefined) gym.address = address;
    if (phone !== undefined) gym.phone = phone;
    if (email !== undefined) gym.email = email;
    if (status) gym.status = status;
    if (plan) gym.plan = plan;
    if (maxMembers) gym.maxMembers = maxMembers;
    if (features) gym.features = features;

    await gym.save();
    res.json(gym);
  } catch (err) {
    console.error('Error updating gym:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get gym details with full stats
router.get('/gyms/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const gym = await Gym.findByPk(id);

    if (!gym) {
      return res.status(404).json({ error: 'Gym not found' });
    }

    const memberCount = await Member.count({ where: { gymId: id } });
    const adminCount = await Admin.count({ where: { gymId: id } });
    const admins = await Admin.findAll({
      where: { gymId: id },
      attributes: ['id', 'name', 'email', 'role', 'status', 'createdAt'],
    });

    // Last 30 days check-in trend
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const checkInCount = await CheckIn.count({
      where: {
        gymId: id,
        status: 'granted',
        timestamp: {
          [Op.gte]: thirtyDaysAgo,
        },
      },
    });

    res.json({
      ...gym.toJSON(),
      memberCount,
      adminCount,
      admins,
      last30DaysCheckIns: checkInCount,
    });
  } catch (err) {
    console.error('Error fetching gym details:', err);
    res.status(500).json({ error: err.message });
  }
});

// Super Admin Dashboard Stats
router.get('/stats', async (req, res) => {
  try {
    const totalGyms = await Gym.count();
    const activeGyms = await Gym.count({ where: { status: 'active' } });
    const totalMembers = await Member.count();
    const totalAdmins = await Admin.count({ where: { role: 'admin' } });

    // Today's check-ins across all gyms
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayCheckIns = await CheckIn.count({
      where: {
        status: 'granted',
        timestamp: {
          [Op.gte]: today,
          [Op.lt]: tomorrow,
        },
      },
    });

    res.json({
      totalGyms,
      activeGyms,
      totalMembers,
      totalAdmins,
      todayCheckIns,
    });
  } catch (err) {
    console.error('Error fetching super admin stats:', err);
    res.status(500).json({ error: err.message });
  }
});

// Update Super Admin Profile
router.put('/profile', async (req, res) => {
  try {
    const { name, email } = req.body;

    // In a real app, you'd get the super admin ID from the authenticated session
    // For now, we'll find the super admin by role
    const superAdmin = await Admin.findOne({ where: { role: 'super_admin' } });

    if (!superAdmin) {
      return res.status(404).json({ error: 'Super admin not found' });
    }

    // Check if email is already taken by another admin
    if (email && email !== superAdmin.email) {
      const existingAdmin = await Admin.findOne({
        where: {
          email,
          id: { [Op.ne]: superAdmin.id },
        },
      });
      if (existingAdmin) {
        return res.status(400).json({ error: 'Email already in use' });
      }
    }

    // Update fields
    if (name) superAdmin.name = name;
    if (email) superAdmin.email = email;

    await superAdmin.save();

    res.json({
      id: superAdmin.id,
      name: superAdmin.name,
      email: superAdmin.email,
      role: superAdmin.role,
    });
  } catch (err) {
    console.error('Error updating super admin profile:', err);
    res.status(500).json({ error: err.message });
  }
});

// Change Super Admin Password
router.put('/change-password', async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required' });
    }

    // In a real app, you'd get the super admin ID from the authenticated session
    const superAdmin = await Admin.findOne({ where: { role: 'super_admin' } });

    if (!superAdmin) {
      return res.status(404).json({ error: 'Super admin not found' });
    }

    // Verify current password (in production, use bcrypt.compare)
    if (superAdmin.password !== currentPassword) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    // Update password (in production, hash with bcrypt)
    superAdmin.password = newPassword;
    await superAdmin.save();

    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    console.error('Error changing super admin password:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get All Members (across all gyms)
router.get('/members', async (req, res) => {
  try {
    const members = await Member.findAll({
      include: [
        {
          model: User,
          attributes: ['id', 'name', 'email', 'phone'],
        },
        {
          model: Gym,
          attributes: ['id', 'name', 'subdomain'],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    // Enrich with days remaining
    const enrichedMembers = members.map(m => {
      let daysRemaining = 0;
      if (m.endDate) {
        const end = new Date(m.endDate);
        const now = new Date();
        const diffTime = end - now;
        daysRemaining = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
      }

      return {
        id: m.id,
        userId: m.userId,
        gymId: m.gymId,
        userName: m.User.name,
        userEmail: m.User.email,
        userPhone: m.User.phone,
        gymName: m.Gym.name,
        gymSubdomain: m.Gym.subdomain,
        status: m.status,
        suspended: m.suspended,
        joinDate: m.joinDate,
        endDate: m.endDate,
        duration: m.duration,
        daysRemaining,
      };
    });

    res.json(enrichedMembers);
  } catch (err) {
    console.error('Error fetching members:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
