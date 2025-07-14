const express = require('express');
const router = express.Router();
const usersController = require('../controllers/usersController');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

// GET /api/users - Get all users (HR/Admin only)
router.get('/', authenticateToken, authorizeRole(['hr', 'admin']), usersController.getAllUsers);

// GET /api/users/:id - Get user by ID
router.get('/:id', authenticateToken, usersController.getUserById);

// PUT /api/users/:id - Update user (HR/Admin only)
router.put('/:id', authenticateToken, authorizeRole(['hr', 'admin']), usersController.updateUser);

// POST /api/users - Create new user (HR/Admin only)
router.post('/', authenticateToken, authorizeRole(['hr', 'admin']), usersController.createUser);

// DELETE /api/users/:id - Deactivate user (Admin only)
router.delete('/:id', authenticateToken, authorizeRole(['admin']), usersController.deactivateUser);

// GET /api/users/department/:id - Get users by department
router.get('/department/:id', authenticateToken, authorizeRole(['supervisor', 'hr', 'admin']), usersController.getUsersByDepartment);

// GET /api/users/:id/subordinates - Get user's subordinates (for supervisors)
router.get('/:id/subordinates', authenticateToken, authorizeRole(['supervisor', 'hr', 'admin']), usersController.getSubordinates);

module.exports = router;