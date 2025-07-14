const express = require('express');
const router = express.Router();
const leavesController = require('../controllers/leavesController');
const { authenticateToken, authorizeRole, authorizeUserAccess } = require('../middleware/auth');

// GET /api/leaves/balance - Get leave balances for current user
router.get('/balance', authenticateToken, leavesController.getLeaveBalance);

// GET /api/leaves/balance/:userId - Get leave balances for specific user
router.get('/balance/:userId', authenticateToken, authorizeUserAccess, leavesController.getLeaveBalanceByUserId);

// GET /api/leaves/requests - Get leave requests
router.get('/requests', authenticateToken, leavesController.getLeaveRequests);

// GET /api/leaves/requests/:id - Get specific leave request
router.get('/requests/:id', authenticateToken, leavesController.getLeaveRequestById);

// POST /api/leaves/requests - Create new leave request
router.post('/requests', authenticateToken, leavesController.createLeaveRequest);

// PUT /api/leaves/requests/:id - Update leave request (approve/deny)
router.put('/requests/:id', authenticateToken, authorizeRole(['supervisor', 'hr', 'admin']), leavesController.updateLeaveRequest);

// DELETE /api/leaves/requests/:id - Cancel leave request
router.delete('/requests/:id', authenticateToken, leavesController.cancelLeaveRequest);

// GET /api/leaves/history - Get leave history
router.get('/history', authenticateToken, leavesController.getLeaveHistory);

// GET /api/leaves/types - Get all leave types
router.get('/types', authenticateToken, leavesController.getLeaveTypes);

// GET /api/leaves/fiscal-years - Get fiscal years
router.get('/fiscal-years', authenticateToken, leavesController.getFiscalYears);

// GET /api/leaves/pending-approvals - Get pending approval requests (for supervisors)
router.get('/pending-approvals', authenticateToken, authorizeRole(['supervisor', 'hr', 'admin']), leavesController.getPendingApprovals);

module.exports = router;