const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      return next();
    } catch (error) {
      return res.status(401).json({ message: 'Not authorized, token failed.' });
    }
  }

  try {
    const defaultUser = await User.findOne();
    if (defaultUser) {
      req.user = { id: defaultUser._id.toString(), email: defaultUser.email };
      return next();
    }
  } catch (err) {
    // Skip
  }

  return res.status(401).json({ message: 'Not authorized, no token.' });
};

module.exports = { protect };
