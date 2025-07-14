const express = require('express');
const router = express.Router();
const reportsController = require('../controllers/reportsController');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

// GET /api/reports/statistics - Get leave statistics
router.get('/statistics', authenticateToken, reportsController.getLeaveStatistics);

// GET /api/reports/department/:id - Get department leave report
router.get('/department/:id', authenticateToken, authorizeRole(['supervisor', 'hr', 'admin']), reportsController.getDepartmentReport);

// GET /api/reports/user/:id - Get user leave report
router.get('/user/:id', authenticateToken, authorizeRole(['hr', 'admin']), reportsController.getUserReport);

// GET /api/reports/summary - Get summary report for current fiscal year
router.get('/summary', authenticateToken, authorizeRole(['hr', 'admin']), reportsController.getSummaryReport);

// GET /api/reports/usage - Get leave usage report
router.get('/usage', authenticateToken, authorizeRole(['hr', 'admin']), reportsController.getLeaveUsageReport);

// GET /api/reports/export - Export reports (future implementation)
router.get('/export', authenticateToken, authorizeRole(['hr', 'admin']), reportsController.exportReport);

module.exports = router;