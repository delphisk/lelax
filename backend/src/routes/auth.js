const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');

// POST /api/auth/login
router.post('/login', authController.login);

// POST /api/auth/logout
router.post('/logout', authenticateToken, authController.logout);

// GET /api/auth/me - Get current user profile
router.get('/me', authenticateToken, authController.getProfile);

// POST /api/auth/refresh - Refresh token
router.post('/refresh', authenticateToken, authController.refreshToken);

// POST /api/auth/change-password - Change password
router.post('/change-password', authenticateToken, authController.changePassword);

module.exports = router;