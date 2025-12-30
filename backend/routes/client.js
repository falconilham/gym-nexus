const express = require('express');
const router = express.Router();
const { Member, Class, Trainer, Booking, CheckIn } = require('../database');
const QRCode = require('qrcode'); // Import qrcode library

// QR Code Generation Endpoint
router.get('/qr/:id', async (req, res) => {
  const userId = req.params.id;
  try {
    // Generate QR Data
    const ttl = 2 * 60 * 1000; // 2 minutes
    const now = Date.now();
    const qrData = JSON.stringify({
      memberId: userId,
      timestamp: now,
      expiresAt: now + ttl,
      valid: true,
    });

    // Generate QR Code as Data URL (or Buffer)
    // Here we act as an image server
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

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await Member.findOne({ where: { email, password } });

    if (user) {
      // Return user info sans password
      const { password, ...userInfo } = user.toJSON();
      res.json({ success: true, user: userInfo });
    } else {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Forgot Password
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  try {
    const user = await Member.findOne({ where: { email } });
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

// Member Dashboard Data
router.get('/dashboard/:id', async (req, res) => {
  const userId = parseInt(req.params.id);

  try {
    const user = await Member.findByPk(userId);
    const upcomingClasses = await Class.findAll({ limit: 2 }); // Just grab first 2 for now

    if (!user) return res.status(404).json({ message: 'User not found' });

    // Calculate Remaining Days
    let daysRemaining = null;
    if (user.endDate) {
      const end = new Date(user.endDate);
      const now = new Date();
      const diffTime = end - now;
      daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    // Recent Check-in History
    const recentCheckIns = await CheckIn.findAll({
      where: { memberId: userId },
      order: [['timestamp', 'DESC']],
      limit: 5,
    });

    const latestCheckIn = recentCheckIns.find(c => c.status === 'granted');

    res.json({
      user: {
        name: user.name,
        status: user.status,
        suspended: user.suspended,
        daysRemaining: daysRemaining > 0 ? daysRemaining : 0,
      },
      stats: {
        workouts: 12, // Mock - ideally count unique days from checkIns
        kcal: 4500, // Mock
        minutes: 320, // Mock
      },
      upcomingClasses,
      latestCheckIn,
      recentCheckIns,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Trainers
router.get('/trainers', async (req, res) => {
  try {
    const trainers = await Trainer.findAll();
    res.json(trainers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Available Classes
router.get('/classes', async (req, res) => {
  try {
    const classes = await Class.findAll();
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
