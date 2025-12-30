const express = require('express');
const router = express.Router();
const { Member, Class, Equipment, CheckIn } = require('../database');

// Get Dashboard Stats
router.get('/stats', async (req, res) => {
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
          $gte: today,
          $lt: tomorrow,
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

// Member Management
router.get('/members', async (req, res) => {
  try {
    const members = await Member.findAll();
    res.json(members);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/members', async (req, res) => {
  try {
    const { name, email, duration } = req.body;

    // Calculate Dates
    const joinDate = new Date();
    const endDate = new Date(joinDate);
    const monthsToAdd = parseInt(duration) || 1; // Default to 1 if parsing fails
    endDate.setMonth(endDate.getMonth() + monthsToAdd);

    const newMember = await Member.create({
      name,
      email,
      duration,
      password: 'password', // Default
      status: 'Active',
      joinDate: joinDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
    });
    res.status(201).json(newMember);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/members/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await Member.destroy({ where: { id } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/members/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, extendDuration } = req.body;

    const member = await Member.findByPk(id);
    if (!member) {
      return res.status(404).json({ error: 'Member not found' });
    }

    // Update basic info
    if (name) member.name = name;
    if (email) member.email = email;

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
    res.json(member);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Suspend/Unsuspend Member
router.patch('/members/:id/suspend', async (req, res) => {
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
router.get('/equipment', async (req, res) => {
  try {
    const equipment = await Equipment.findAll();
    res.json(equipment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Schedule Management
router.get('/classes', async (req, res) => {
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
    const { memberId } = req.body;

    if (!memberId) {
      return res.status(400).json({
        success: false,
        access: 'denied',
        reason: 'invalid_request',
        message: 'Member ID is required',
      });
    }

    // Find member
    const member = await Member.findByPk(memberId);

    if (!member) {
      await CheckIn.create({
        memberId,
        memberName: 'Unknown',
        status: 'denied',
        reason: 'not_found',
      });
      return res.status(404).json({
        success: false,
        access: 'denied',
        reason: 'not_found',
        message: 'Member not found',
      });
    }

    // Check Suspended
    if (member.suspended) {
      await CheckIn.create({
        memberId: member.id,
        memberName: member.name,
        status: 'denied',
        reason: 'suspended',
      });
      return res.status(403).json({
        success: false,
        access: 'denied',
        reason: 'suspended',
        message: 'Membership suspended.',
        member: { name: member.name },
      });
    }

    // Check Expired
    if (member.endDate && new Date(member.endDate) < new Date()) {
      await CheckIn.create({
        memberId: member.id,
        memberName: member.name,
        status: 'denied',
        reason: 'expired',
      });
      return res.status(403).json({
        success: false,
        access: 'denied',
        reason: 'expired',
        message: 'Membership expired.',
        member: { name: member.name },
      });
    }

    // --- CHECK-IN / CHECK-OUT LOGIC ---
    // Look for an active session: granted check-in within last 12 hours that has NO checkOutTime
    const twelveHoursAgo = new Date(Date.now() - 12 * 60 * 60 * 1000);

    const activeSession = await CheckIn.findOne({
      where: {
        memberId: member.id,
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
    if (member.endDate) {
      const end = new Date(member.endDate);
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
        message: 'Goodbye! Checked out successfully.',
        member: {
          id: member.id,
          name: member.name,
          email: member.email,
          status: member.status,
          daysRemaining,
        },
      });
    } else {
      // PERFORM CHECK-IN
      await CheckIn.create({
        memberId: member.id,
        memberName: member.name,
        status: 'granted',
        reason: null,
      });

      return res.json({
        success: true,
        access: 'granted',
        type: 'checkin',
        message: 'Access granted. Welcome!',
        member: {
          id: member.id,
          name: member.name,
          email: member.email,
          status: member.status,
          daysRemaining,
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

// Get Recent Check-Ins
router.get('/check-ins', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const checkIns = await CheckIn.findAll({
      order: [['timestamp', 'DESC']],
      limit,
    });
    res.json(checkIns);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
