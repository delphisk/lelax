const jwt = require('jsonwebtoken');
const { executeQuery } = require('../config/database');

// Verify JWT token
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        error: 'Access token required',
        message: 'No token provided',
        code: 'NO_TOKEN'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if token exists in database and is active
    const session = await executeQuery(
      'SELECT * FROM user_sessions WHERE token_hash = ? AND is_active = TRUE AND expires_at > NOW()',
      [token]
    );

    if (session.length === 0) {
      return res.status(401).json({
        error: 'Invalid token',
        message: 'Token not found or expired',
        code: 'INVALID_TOKEN'
      });
    }

    // Get user information
    const user = await executeQuery(
      `SELECT u.*, d.name as department_name, p.name as position_name 
       FROM users u 
       LEFT JOIN departments d ON u.department_id = d.id 
       LEFT JOIN positions p ON u.position_id = p.id 
       WHERE u.id = ? AND u.is_active = TRUE`,
      [decoded.userId]
    );

    if (user.length === 0) {
      return res.status(401).json({
        error: 'User not found',
        message: 'User does not exist or is inactive',
        code: 'USER_NOT_FOUND'
      });
    }

    // Add user info to request
    req.user = {
      id: user[0].id,
      username: user[0].username,
      employee_id: user[0].employee_id,
      first_name: user[0].first_name,
      last_name: user[0].last_name,
      email: user[0].email,
      department_id: user[0].department_id,
      department_name: user[0].department_name,
      position_id: user[0].position_id,
      position_name: user[0].position_name,
      role: user[0].role
    };

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: 'Invalid token',
        message: 'Token is malformed',
        code: 'INVALID_TOKEN'
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Token expired',
        message: 'Token has expired',
        code: 'TOKEN_EXPIRED'
      });
    }

    console.error('Authentication error:', error);
    return res.status(500).json({
      error: 'Authentication failed',
      message: 'Internal authentication error',
      code: 'AUTH_ERROR'
    });
  }
};

// Check user role authorization
const authorizeRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Authentication required',
        message: 'User not authenticated',
        code: 'NOT_AUTHENTICATED'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Insufficient permissions',
        message: `Access denied. Required roles: ${roles.join(', ')}`,
        code: 'INSUFFICIENT_PERMISSIONS'
      });
    }

    next();
  };
};

// Check if user can access specific user data
const authorizeUserAccess = (req, res, next) => {
  const targetUserId = parseInt(req.params.userId || req.body.user_id);
  const currentUser = req.user;

  // Admin and HR can access all users
  if (['admin', 'hr'].includes(currentUser.role)) {
    return next();
  }

  // Supervisors can access users in their department
  if (currentUser.role === 'supervisor') {
    // Additional check would be needed to verify if target user is in supervisor's department
    // For now, we'll allow supervisors to access any user (can be refined later)
    return next();
  }

  // Employees can only access their own data
  if (currentUser.role === 'employee') {
    if (targetUserId && targetUserId !== currentUser.id) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You can only access your own data',
        code: 'ACCESS_DENIED'
      });
    }
  }

  next();
};

// Validate request body
const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Validation failed',
        message: error.details[0].message,
        code: 'VALIDATION_ERROR'
      });
    }
    next();
  };
};

module.exports = {
  authenticateToken,
  authorizeRole,
  authorizeUserAccess,
  validateRequest
};