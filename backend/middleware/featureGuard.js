const requireFeature = feature => {
  return (req, res, next) => {
    // If no gym context, we can't check feature flags.
    // Assuming tenantMiddleware has run.
    if (!req.gym) return next();

    const features = req.gym.features;

    // Legacy support: if features is null/undefined, allow all.
    if (!features) return next();

    if (!features.includes(feature)) {
      return res.status(403).json({
        error: 'Forbidden',
        message: `Feature '${feature}' is disabled for this gym.`,
      });
    }

    next();
  };
};

module.exports = { requireFeature };
