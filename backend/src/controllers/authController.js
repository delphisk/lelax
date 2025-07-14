const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const moment = require('moment');
const { executeQuery } = require('../config/database');

// Login controller
const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        error: 'Missing credentials',
        message: 'Username and password are required',
        code: 'MISSING_CREDENTIALS'
      });
    }

    // Get user by username
    const users = await executeQuery(
      `SELECT u.*, d.name as department_name, p.name as position_name 
       FROM users u 
       LEFT JOIN departments d ON u.department_id = d.id 
       LEFT JOIN positions p ON u.position_id = p.id 
       WHERE u.username = ? AND u.is_active = TRUE`,
      [username]
    );

    if (users.length === 0) {
      return res.status(401).json({
        error: 'Invalid credentials',
        message: 'Username or password is incorrect',
        code: 'INVALID_CREDENTIALS'
      });
    }

    const user = users[0];

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        error: 'Invalid credentials',
        message: 'Username or password is incorrect',
        code: 'INVALID_CREDENTIALS'
      });
    }

    // Generate JWT token
    const tokenPayload = {
      userId: user.id,
      username: user.username,
      role: user.role
    };

    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    });

    // Store token in database
    const expiresAt = moment().add(7, 'days').format('YYYY-MM-DD HH:mm:ss');
    await executeQuery(
      'INSERT INTO user_sessions (user_id, token_hash, expires_at) VALUES (?, ?, ?)',
      [user.id, token, expiresAt]
    );

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    res.status(200).json({
      message: 'Login successful',
      user: userWithoutPassword,
      token,
      expiresAt
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Login failed',
      message: 'Internal server error',
      code: 'LOGIN_ERROR'
    });
  }
};

// Logout controller
const logout = async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      // Deactivate token in database
      await executeQuery(
        'UPDATE user_sessions SET is_active = FALSE WHERE token_hash = ?',
        [token]
      );
    }

    res.status(200).json({
      message: 'Logout successful'
    });

  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      error: 'Logout failed',
      message: 'Internal server error',
      code: 'LOGOUT_ERROR'
    });
  }
};

// Get profile controller
const getProfile = async (req, res) => {
  try {
    const user = req.user;

    // Get additional user statistics
    const currentFiscalYear = await executeQuery(
      'SELECT id FROM fiscal_years WHERE is_active = TRUE LIMIT 1'
    );

    let leaveBalances = [];
    if (currentFiscalYear.length > 0) {
      leaveBalances = await executeQuery(
        `SELECT lb.*, lt.name as leave_type_name, lt.code as leave_type_code
         FROM leave_balances lb
         JOIN leave_types lt ON lb.leave_type_id = lt.id
         WHERE lb.user_id = ? AND lb.fiscal_year_id = ?`,
        [user.id, currentFiscalYear[0].id]
      );
    }

    res.status(200).json({
      user: {
        ...user,
        leave_balances: leaveBalances
      }
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      error: 'Failed to get profile',
      message: 'Internal server error',
      code: 'PROFILE_ERROR'
    });
  }
};

// Refresh token controller
const refreshToken = async (req, res) => {
  try {
    const user = req.user;

    // Generate new token
    const tokenPayload = {
      userId: user.id,
      username: user.username,
      role: user.role
    };

    const newToken = jwt.sign(tokenPayload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    });

    // Deactivate old token
    const authHeader = req.headers['authorization'];
    const oldToken = authHeader && authHeader.split(' ')[1];
    
    if (oldToken) {
      await executeQuery(
        'UPDATE user_sessions SET is_active = FALSE WHERE token_hash = ?',
        [oldToken]
      );
    }

    // Store new token
    const expiresAt = moment().add(7, 'days').format('YYYY-MM-DD HH:mm:ss');
    await executeQuery(
      'INSERT INTO user_sessions (user_id, token_hash, expires_at) VALUES (?, ?, ?)',
      [user.id, newToken, expiresAt]
    );

    res.status(200).json({
      message: 'Token refreshed successfully',
      token: newToken,
      expiresAt
    });

  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(500).json({
      error: 'Token refresh failed',
      message: 'Internal server error',
      code: 'REFRESH_ERROR'
    });
  }
};

// Change password controller
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = req.user;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        error: 'Missing passwords',
        message: 'Current password and new password are required',
        code: 'MISSING_PASSWORDS'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        error: 'Weak password',
        message: 'New password must be at least 6 characters long',
        code: 'WEAK_PASSWORD'
      });
    }

    // Get current user password
    const users = await executeQuery(
      'SELECT password FROM users WHERE id = ?',
      [user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({
        error: 'User not found',
        message: 'User does not exist',
        code: 'USER_NOT_FOUND'
      });
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, users[0].password);
    if (!isCurrentPasswordValid) {
      return res.status(401).json({
        error: 'Invalid current password',
        message: 'Current password is incorrect',
        code: 'INVALID_CURRENT_PASSWORD'
      });
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await executeQuery(
      'UPDATE users SET password = ?, updated_at = NOW() WHERE id = ?',
      [hashedNewPassword, user.id]
    );

    // Deactivate all existing sessions for security
    await executeQuery(
      'UPDATE user_sessions SET is_active = FALSE WHERE user_id = ?',
      [user.id]
    );

    res.status(200).json({
      message: 'Password changed successfully. Please login again.'
    });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      error: 'Password change failed',
      message: 'Internal server error',
      code: 'PASSWORD_CHANGE_ERROR'
    });
  }
};

module.exports = {
  login,
  logout,
  getProfile,
  refreshToken,
  changePassword
};