const jwt = require('jsonwebtoken');

module.exports = async function isAuthenticated(req, res, next) {
  // Check for token in cookies or Authorization header
  const token = req.cookies?.accessToken || req.headers['authorization']?.split(' ')[1];

  // console.log("Cookies:", req.cookies);
  // console.log("Token:", token);

  if (!token) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  // Verify token
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET || process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      console.error('Authentication error:', err.message);
      return res.status(403).json({ message: 'Invalid or expired token' });
    }

    // decoded contains { UserInfo: { id, email }, iat, exp } based on auth.controller.js
    req.user = decoded.UserInfo || decoded;
    next();
  });
};
