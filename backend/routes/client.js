const express = require('express');
const router = express.Router();
const {
  User,
  Member,
  Gym,
  Class,
  Trainer,
  Booking,
  CheckIn,
  Specialty,
  sequelize,
} = require('../database');
const QRCode = require('qrcode');
const { Op } = require('sequelize');

// Public Config (Colors, Logo)
router.get('/config', async (req, res) => {
  try {
    if (!req.gym) {
      return res.status(404).json({ error: 'Gym not found' });
    }
    const { id, name, logo, primaryColor, secondaryColor, subdomain, features } = req.gym;
    res.json({ gymId: id, name, logo, primaryColor, secondaryColor, subdomain, features });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// QR Code Generation Endpoint
router.get('/qr/:userId/:membershipId', async (req, res) => {
  const { userId, membershipId } = req.params;
  try {
    // Verify membership exists
    const membership = await Member.findOne({
      where: { id: membershipId, userId: userId },
      include: [{ model: Gym }],
    });

    if (!membership) {
      return res.status(404).send('Membership not found');
    }

    // Generate QR Data
    const ttl = 2 * 60 * 1000; // 2 minutes
    const now = Date.now();
    const qrData = JSON.stringify({
      userId: parseInt(userId),
      gymId: membership.gymId,
      membershipId: parseInt(membershipId),
      timestamp: now,
      expiresAt: now + ttl,
      valid: true,
    });

    const qrImage = await QRCode.toBuffer(qrData);

    res.writeHead(200, {
      'Content-Type': 'image/png',
      'Content-Length': qrImage.length,
    });
    res.end(qrImage);
  } catch (err) {
    console.error('QR Generation Error:', err);
    res.status(500).send('Error generating QR code');
  }
});

// Login - Returns user + all memberships
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find user (global account)
    const user = await User.findOne({ where: { email } });

    if (!user || !(await user.validPassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Get all memberships for this user
    const memberships = await Member.findAll({
      where: { userId: user.id },
      include: [
        {
          model: Gym,
          attributes: ['id', 'name', 'logo', 'subdomain', 'address', 'features'],
        },
      ],
    });

    // Calculate days remaining for each membership
    const enrichedMemberships = memberships.map(m => {
      let daysRemaining = 0;
      if (m.endDate) {
        const end = new Date(m.endDate);
        const now = new Date();
        const diffTime = end - now;
        daysRemaining = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
      }

      return {
        id: m.id,
        gymId: m.gymId,
        gymName: m.Gym.name,
        gymLogo: m.Gym.logo,
        gymSubdomain: m.Gym.subdomain,
        gymAddress: m.Gym.address,
        status: m.status,
        suspended: m.suspended,
        joinDate: m.joinDate,
        endDate: m.endDate,
        duration: m.duration,
        daysRemaining,
      };
    });

    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        memberPhoto: user.memberPhoto,
      },
      memberships: enrichedMemberships,
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Update Profile
// Get Profile
router.get('/profile/:userId', async (req, res) => {
  try {
    const user = await User.findByPk(req.params.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/profile/:userId', async (req, res) => {
  const { userId } = req.params;
  const { memberPhoto } = req.body;

  try {
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (memberPhoto !== undefined) {
      user.memberPhoto = memberPhoto;
    }

    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        memberPhoto: user.memberPhoto,
      },
    });
  } catch (err) {
    console.error('Profile update error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Forgot Password
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ where: { email } });
    if (user) {
      // In a real app, send email here
      console.log(`Password reset requested for: ${email}`);
      res.json({
        success: true,
        message: 'If account exists, reset link sent.',
      });
    } else {
      // Security: Don't reveal if user exists, just say sent
      res.json({
        success: true,
        message: 'If account exists, reset link sent.',
      });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Member Dashboard Data (gym-specific)
router.get('/dashboard/:userId/:membershipId', async (req, res) => {
  const { userId, membershipId } = req.params;

  try {
    // Get user
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get membership
    const membership = await Member.findOne({
      where: { id: membershipId, userId: userId },
      include: [{ model: Gym }],
    });

    if (!membership) {
      return res.status(404).json({ message: 'Membership not found' });
    }

    const gymId = membership.gymId;

    // Get upcoming classes for this gym
    const upcomingClasses = await Class.findAll({
      where: { gymId },
      limit: 5,
    });

    // Calculate Remaining Days
    let daysRemaining = 0;
    if (membership.endDate) {
      const end = new Date(membership.endDate);
      const now = new Date();
      const diffTime = end - now;
      daysRemaining = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    }

    // Recent Check-in History for this gym
    const recentCheckIns = await CheckIn.findAll({
      where: {
        gymId: gymId,
        memberId: membershipId,
      },
      order: [['timestamp', 'DESC']],
      limit: 10,
    });

    // Latest active check-in (granted, no checkout)
    const latestCheckIn = recentCheckIns.find(c => c.status === 'granted' && !c.checkOutTime);

    res.json({
      user: {
        name: user.name,
        email: user.email,
        status: membership.status,
        suspended: membership.suspended,
        daysRemaining,
      },
      gym: {
        id: membership.Gym.id,
        name: membership.Gym.name,
        logo: membership.Gym.logo,
        features: membership.Gym.features,
      },
      stats: {
        workouts: recentCheckIns.filter(c => c.status === 'granted').length,
        kcal: 4500, // Mock
        minutes: 320, // Mock
      },
      upcomingClasses,
      latestCheckIn,
      recentCheckIns,
    });
  } catch (err) {
    console.error('Dashboard error:', err);
    res.status(500).json({ message: err.message });
  }
});

// Specialties
router.get('/specialties', async (req, res) => {
  try {
    const gymId = req.gymId || req.query.gymId;
    if (!gymId) return res.status(400).json({ error: 'Gym context required' });

    // 1. Get specialties from the managed table
    const managedSpecialties = await Specialty.findAll({
      where: { gymId },
      attributes: ['name'],
    });

    // 2. Get distinct specialties from existing trainers (legacy data support)
    const trainerSpecialties = await Trainer.findAll({
      where: { gymId },
      attributes: [[sequelize.fn('DISTINCT', sequelize.col('specialty')), 'specialty']],
      raw: true,
    });

    // 3. Merge and deduplicate
    const names = new Set([
      ...managedSpecialties.map(s => s.name),
      ...trainerSpecialties.map(t => t.specialty),
    ]);

    // Filter out null/empty and sort
    const result = Array.from(names)
      .filter(n => n && n.trim().length > 0)
      .sort((a, b) => a.localeCompare(b))
      .map((name, index) => ({ id: index, name })); // Map to object structure expected by client

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Trainers
router.get('/trainers', async (req, res) => {
  try {
    // Get gymId from middleware or query parameter
    const gymId = req.gymId || req.query.gymId;
    const { search, specialty, minRating, maxPrice } = req.query;

    if (!gymId) {
      return res.status(400).json({ error: 'Gym context required' });
    }

    const where = { gymId };

    if (search) {
      where.name = { [Op.iLike]: `%${search}%` };
    }

    if (specialty && specialty !== 'All') {
      where.specialty = specialty;
    }

    if (minRating) {
      where.rating = { [Op.gte]: parseFloat(minRating) };
    }

    if (maxPrice) {
      where.singleSessionPrice = { [Op.lte]: parseInt(maxPrice) };
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

// Available Classes
router.get('/classes', async (req, res) => {
  try {
    // Get gymId from middleware or query parameter
    const gymId = req.gymId || req.query.gymId;

    if (!gymId) {
      return res.status(400).json({ error: 'Gym context required' });
    }

    const classes = await Class.findAll({
      where: { gymId },
      order: [['time', 'ASC']],
    });

    res.json(classes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Book Trainer
router.post('/book-trainer', async (req, res) => {
  const { trainerId, memberId, date, bookingType } = req.body; // bookingType: 'single' | 'package'

  try {
    const typeStr = bookingType === 'package' ? 'trainer_package' : 'trainer_single';

    await Booking.create({
      type: typeStr,
      itemId: trainerId,
      memberId,
      date,
    });
    res.json({
      success: true,
      message: `Booking confirmed: ${
        bookingType === 'package' ? '10 Session Package' : 'Single Session'
      }`,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Booking failed.' });
  }
});

// Book Class
router.post('/book-class', async (req, res) => {
  const { classId, memberId } = req.body;

  try {
    // Find class and increment booked count
    const cls = await Class.findByPk(classId);
    if (cls) {
      if (cls.booked >= cls.capacity) {
        return res.json({ success: false, message: 'Class is full!' });
      }
      await cls.increment('booked');

      await Booking.create({
        type: 'class',
        itemId: classId,
        memberId,
      });

      res.json({ success: true, message: 'Class booked successfully!' });
    } else {
      res.status(404).json({ success: false, message: 'Class not found.' });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: 'Booking failed.' });
  }
});

module.exports = router;
