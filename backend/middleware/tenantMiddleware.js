const { Gym, Admin } = require('../database');

// Middleware to extract gymId from subdomain or header
const extractGymContext = async (req, res, next) => {
  try {
    let gymId = null;
    let gym = null;

    // Method 1: From subdomain (e.g., powerhouse.gymnexus.app) OR header
    const host = req.get('host') || '';
    let subdomain = host.split('.')[0];

    // Method: From query parameter (explicit subdomain)
    if (req.query.subdomain) {
      subdomain = req.query.subdomain;
    }

    // Override if custom header is present (useful for cross-domain API calls)
    if (req.headers['x-gym-subdomain']) {
      subdomain = req.headers['x-gym-subdomain'];
    }

    if (subdomain && subdomain !== 'localhost' && subdomain !== 'www' && !subdomain.includes(':')) {
      gym = await Gym.findOne({ where: { subdomain } });
      if (gym) {
        gymId = gym.id;
      }
    }

    // fallback: try extracting from Origin header (helpful for local dev CORS)
    if (!gymId) {
      const origin = req.get('origin');
      if (origin) {
        const cleanOrigin = origin.replace(/^https?:\/\//, '');
        const originSubdomain = cleanOrigin.split('.')[0];
        if (
          originSubdomain &&
          originSubdomain !== 'localhost' &&
          originSubdomain !== 'www' &&
          !originSubdomain.includes(':')
        ) {
          gym = await Gym.findOne({ where: { subdomain: originSubdomain } });
          if (gym) {
            gymId = gym.id;
          }
        }
      }
    }

    // Method 2: From custom header (for development/mobile)
    if (!gymId && req.headers['x-gym-id']) {
      gymId = parseInt(req.headers['x-gym-id']);
      gym = await Gym.findByPk(gymId);
    }

    // Method 3: From query parameter (fallback)
    if (!gymId && req.query.gymId) {
      gymId = parseInt(req.query.gymId);
      gym = await Gym.findByPk(gymId);
    }

    // Attach to request
    req.gymId = gymId;
    req.gym = gym;

    next();
  } catch (error) {
    console.error('Error extracting gym context:', error);
    next();
  }
};

// Middleware to require gym context
const requireGym = (req, res, next) => {
  if (!req.gymId || !req.gym) {
    return res.status(400).json({
      error: 'Gym context required',
      message: 'Please provide gym information via subdomain, header, or query parameter',
    });
  }

  // Check if gym is active
  if (req.gym.status !== 'active') {
    return res.status(403).json({
      error: 'Gym suspended',
      message: 'This gym account is currently suspended. Please contact support.',
    });
  }

  next();
};

// Middleware to verify admin authentication
const requireAdmin = async (req, res, next) => {
  try {
    // In production, you'd verify JWT token here
    // For now, we'll use a simple header-based auth
    const adminId = req.headers['x-admin-id'];

    if (!adminId) {
      return res.status(401).json({ error: 'Admin authentication required' });
    }

    const admin = await Admin.findByPk(adminId);

    if (!admin || admin.status !== 'active') {
      return res.status(401).json({ error: 'Invalid or inactive admin' });
    }

    // Verify admin belongs to the gym
    if (req.gymId && admin.gymId !== req.gymId) {
      return res.status(403).json({ error: 'Admin does not belong to this gym' });
    }

    req.admin = admin;
    next();
  } catch (error) {
    console.error('Error verifying admin:', error);
    res.status(500).json({ error: 'Authentication error' });
  }
};

// Middleware to require super admin
const requireSuperAdmin = async (req, res, next) => {
  try {
    const adminId = req.headers['x-admin-id'];

    if (!adminId) {
      return res.status(401).json({ error: 'Super admin authentication required' });
    }

    const admin = await Admin.findByPk(adminId);

    if (!admin || admin.role !== 'super_admin' || admin.status !== 'active') {
      return res.status(403).json({ error: 'Super admin access required' });
    }

    req.admin = admin;
    next();
  } catch (error) {
    console.error('Error verifying super admin:', error);
    res.status(500).json({ error: 'Authentication error' });
  }
};

module.exports = {
  extractGymContext,
  requireGym,
  requireAdmin,
  requireSuperAdmin,
};
