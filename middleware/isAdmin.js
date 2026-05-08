const User = require('../models/User');

module.exports = async function isAdmin(req, res, next) {
  try {
    // req.user is set by isAuthenticated middleware
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.isAdmin) {
      return res.status(403).json({ message: 'Access denied. Admin resources only.' });
    }

    next();
  } catch (error) {
    console.error('Admin middleware error:', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};
