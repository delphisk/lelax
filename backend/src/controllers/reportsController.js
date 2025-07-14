const { executeQuery } = require('../config/database');

// Get leave statistics for current user
const getLeaveStatistics = async (req, res) => {
  try {
    const user = req.user;
    const { fiscal_year_id } = req.query;

    // Get current or specified fiscal year
    let currentFY;
    if (fiscal_year_id) {
      currentFY = await executeQuery('SELECT * FROM fiscal_years WHERE id = ?', [fiscal_year_id]);
    } else {
      currentFY = await executeQuery('SELECT * FROM fiscal_years WHERE is_active = TRUE LIMIT 1');
    }

    if (currentFY.length === 0) {
      return res.status(404).json({
        error: 'Fiscal year not found',
        code: 'FISCAL_YEAR_NOT_FOUND'
      });
    }

    // Get leave statistics by type
    const leaveStats = await executeQuery(
      `SELECT 
         lt.name as leave_type_name,
         lt.code as leave_type_code,
         lb.total_days,
         lb.used_days,
         lb.remaining_days,
         COALESCE(lr_stats.total_requests, 0) as total_requests,
         COALESCE(lr_stats.approved_requests, 0) as approved_requests,
         COALESCE(lr_stats.pending_requests, 0) as pending_requests,
         COALESCE(lr_stats.denied_requests, 0) as denied_requests
       FROM leave_balances lb
       JOIN leave_types lt ON lb.leave_type_id = lt.id
       LEFT JOIN (
         SELECT 
           leave_type_id,
           COUNT(*) as total_requests,
           SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved_requests,
           SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_requests,
           SUM(CASE WHEN status = 'denied' THEN 1 ELSE 0 END) as denied_requests
         FROM leave_requests 
         WHERE user_id = ? AND fiscal_year_id = ?
         GROUP BY leave_type_id
       ) lr_stats ON lb.leave_type_id = lr_stats.leave_type_id
       WHERE lb.user_id = ? AND lb.fiscal_year_id = ?
       ORDER BY lt.name`,
      [user.id, currentFY[0].id, user.id, currentFY[0].id]
    );

    res.status(200).json({
      fiscal_year: currentFY[0],
      statistics: leaveStats
    });

  } catch (error) {
    console.error('Get leave statistics error:', error);
    res.status(500).json({
      error: 'Failed to get leave statistics',
      code: 'STATISTICS_ERROR'
    });
  }
};

// Get department report (for supervisors, HR, admin)
const getDepartmentReport = async (req, res) => {
  try {
    const departmentId = req.params.id;
    const user = req.user;
    const { fiscal_year_id } = req.query;

    // Check permissions
    if (user.role === 'supervisor' && user.department_id != departmentId) {
      return res.status(403).json({
        error: 'Access denied',
        code: 'ACCESS_DENIED'
      });
    }

    // Get fiscal year
    let currentFY;
    if (fiscal_year_id) {
      currentFY = await executeQuery('SELECT * FROM fiscal_years WHERE id = ?', [fiscal_year_id]);
    } else {
      currentFY = await executeQuery('SELECT * FROM fiscal_years WHERE is_active = TRUE LIMIT 1');
    }

    if (currentFY.length === 0) {
      return res.status(404).json({
        error: 'Fiscal year not found',
        code: 'FISCAL_YEAR_NOT_FOUND'
      });
    }

    // Get department info
    const department = await executeQuery('SELECT * FROM departments WHERE id = ?', [departmentId]);
    if (department.length === 0) {
      return res.status(404).json({
        error: 'Department not found',
        code: 'DEPARTMENT_NOT_FOUND'
      });
    }

    // Get department users and their leave summary
    const departmentSummary = await executeQuery(
      `SELECT 
         u.id, u.first_name, u.last_name, u.employee_id,
         SUM(lb.total_days) as total_entitled_days,
         SUM(lb.used_days) as total_used_days,
         SUM(lb.remaining_days) as total_remaining_days,
         COUNT(DISTINCT lr.id) as total_requests,
         SUM(CASE WHEN lr.status = 'pending' THEN 1 ELSE 0 END) as pending_requests
       FROM users u
       LEFT JOIN leave_balances lb ON u.id = lb.user_id AND lb.fiscal_year_id = ?
       LEFT JOIN leave_requests lr ON u.id = lr.user_id AND lr.fiscal_year_id = ?
       WHERE u.department_id = ? AND u.is_active = TRUE
       GROUP BY u.id, u.first_name, u.last_name, u.employee_id
       ORDER BY u.first_name, u.last_name`,
      [currentFY[0].id, currentFY[0].id, departmentId]
    );

    res.status(200).json({
      department: department[0],
      fiscal_year: currentFY[0],
      employees_summary: departmentSummary
    });

  } catch (error) {
    console.error('Get department report error:', error);
    res.status(500).json({
      error: 'Failed to get department report',
      code: 'DEPARTMENT_REPORT_ERROR'
    });
  }
};

// Get user report (for HR, admin)
const getUserReport = async (req, res) => {
  try {
    const userId = req.params.id;
    const { fiscal_year_id } = req.query;

    // Get fiscal year
    let currentFY;
    if (fiscal_year_id) {
      currentFY = await executeQuery('SELECT * FROM fiscal_years WHERE id = ?', [fiscal_year_id]);
    } else {
      currentFY = await executeQuery('SELECT * FROM fiscal_years WHERE is_active = TRUE LIMIT 1');
    }

    if (currentFY.length === 0) {
      return res.status(404).json({
        error: 'Fiscal year not found',
        code: 'FISCAL_YEAR_NOT_FOUND'
      });
    }

    // Get user info
    const user = await executeQuery(
      `SELECT u.*, d.name as department_name, p.name as position_name
       FROM users u
       LEFT JOIN departments d ON u.department_id = d.id
       LEFT JOIN positions p ON u.position_id = p.id
       WHERE u.id = ?`,
      [userId]
    );

    if (user.length === 0) {
      return res.status(404).json({
        error: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    // Get leave balances
    const leaveBalances = await executeQuery(
      `SELECT lb.*, lt.name as leave_type_name, lt.code as leave_type_code
       FROM leave_balances lb
       JOIN leave_types lt ON lb.leave_type_id = lt.id
       WHERE lb.user_id = ? AND lb.fiscal_year_id = ?`,
      [userId, currentFY[0].id]
    );

    // Get leave requests
    const leaveRequests = await executeQuery(
      `SELECT lr.*, lt.name as leave_type_name, lt.code as leave_type_code
       FROM leave_requests lr
       JOIN leave_types lt ON lr.leave_type_id = lt.id
       WHERE lr.user_id = ? AND lr.fiscal_year_id = ?
       ORDER BY lr.created_at DESC`,
      [userId, currentFY[0].id]
    );

    res.status(200).json({
      user: user[0],
      fiscal_year: currentFY[0],
      leave_balances: leaveBalances,
      leave_requests: leaveRequests
    });

  } catch (error) {
    console.error('Get user report error:', error);
    res.status(500).json({
      error: 'Failed to get user report',
      code: 'USER_REPORT_ERROR'
    });
  }
};

// Get summary report for current fiscal year
const getSummaryReport = async (req, res) => {
  try {
    const { fiscal_year_id } = req.query;

    // Get fiscal year
    let currentFY;
    if (fiscal_year_id) {
      currentFY = await executeQuery('SELECT * FROM fiscal_years WHERE id = ?', [fiscal_year_id]);
    } else {
      currentFY = await executeQuery('SELECT * FROM fiscal_years WHERE is_active = TRUE LIMIT 1');
    }

    if (currentFY.length === 0) {
      return res.status(404).json({
        error: 'Fiscal year not found',
        code: 'FISCAL_YEAR_NOT_FOUND'
      });
    }

    // Get overall statistics
    const overallStats = await executeQuery(
      `SELECT 
         COUNT(DISTINCT u.id) as total_employees,
         COUNT(DISTINCT lr.id) as total_requests,
         SUM(CASE WHEN lr.status = 'pending' THEN 1 ELSE 0 END) as pending_requests,
         SUM(CASE WHEN lr.status = 'approved' THEN 1 ELSE 0 END) as approved_requests,
         SUM(CASE WHEN lr.status = 'denied' THEN 1 ELSE 0 END) as denied_requests,
         SUM(CASE WHEN lr.status = 'approved' THEN lr.days_count ELSE 0 END) as total_approved_days
       FROM users u
       LEFT JOIN leave_requests lr ON u.id = lr.user_id AND lr.fiscal_year_id = ?
       WHERE u.is_active = TRUE`,
      [currentFY[0].id]
    );

    // Get statistics by department
    const departmentStats = await executeQuery(
      `SELECT 
         d.id, d.name as department_name,
         COUNT(DISTINCT u.id) as total_employees,
         COUNT(DISTINCT lr.id) as total_requests,
         SUM(CASE WHEN lr.status = 'approved' THEN lr.days_count ELSE 0 END) as total_approved_days
       FROM departments d
       LEFT JOIN users u ON d.id = u.department_id AND u.is_active = TRUE
       LEFT JOIN leave_requests lr ON u.id = lr.user_id AND lr.fiscal_year_id = ?
       GROUP BY d.id, d.name
       ORDER BY d.name`,
      [currentFY[0].id]
    );

    // Get statistics by leave type
    const leaveTypeStats = await executeQuery(
      `SELECT 
         lt.id, lt.name as leave_type_name, lt.code,
         COUNT(lr.id) as total_requests,
         SUM(CASE WHEN lr.status = 'approved' THEN lr.days_count ELSE 0 END) as total_approved_days
       FROM leave_types lt
       LEFT JOIN leave_requests lr ON lt.id = lr.leave_type_id AND lr.fiscal_year_id = ?
       WHERE lt.is_active = TRUE
       GROUP BY lt.id, lt.name, lt.code
       ORDER BY lt.name`,
      [currentFY[0].id]
    );

    res.status(200).json({
      fiscal_year: currentFY[0],
      overall_statistics: overallStats[0],
      department_statistics: departmentStats,
      leave_type_statistics: leaveTypeStats
    });

  } catch (error) {
    console.error('Get summary report error:', error);
    res.status(500).json({
      error: 'Failed to get summary report',
      code: 'SUMMARY_REPORT_ERROR'
    });
  }
};

// Get leave usage report
const getLeaveUsageReport = async (req, res) => {
  try {
    const { fiscal_year_id, department_id } = req.query;

    // Get fiscal year
    let currentFY;
    if (fiscal_year_id) {
      currentFY = await executeQuery('SELECT * FROM fiscal_years WHERE id = ?', [fiscal_year_id]);
    } else {
      currentFY = await executeQuery('SELECT * FROM fiscal_years WHERE is_active = TRUE LIMIT 1');
    }

    if (currentFY.length === 0) {
      return res.status(404).json({
        error: 'Fiscal year not found',
        code: 'FISCAL_YEAR_NOT_FOUND'
      });
    }

    let whereCondition = 'WHERE u.is_active = TRUE';
    let queryParams = [currentFY[0].id];

    if (department_id) {
      whereCondition += ' AND u.department_id = ?';
      queryParams.push(department_id);
    }

    // Get leave usage details
    const usageReport = await executeQuery(
      `SELECT 
         u.id, u.first_name, u.last_name, u.employee_id,
         d.name as department_name,
         lt.name as leave_type_name,
         lb.total_days,
         lb.used_days,
         lb.remaining_days,
         ROUND((lb.used_days / lb.total_days) * 100, 2) as usage_percentage
       FROM users u
       LEFT JOIN departments d ON u.department_id = d.id
       LEFT JOIN leave_balances lb ON u.id = lb.user_id AND lb.fiscal_year_id = ?
       LEFT JOIN leave_types lt ON lb.leave_type_id = lt.id
       ${whereCondition}
       ORDER BY d.name, u.first_name, u.last_name, lt.name`,
      queryParams
    );

    res.status(200).json({
      fiscal_year: currentFY[0],
      usage_report: usageReport
    });

  } catch (error) {
    console.error('Get leave usage report error:', error);
    res.status(500).json({
      error: 'Failed to get leave usage report',
      code: 'USAGE_REPORT_ERROR'
    });
  }
};

// Export report (placeholder for future implementation)
const exportReport = async (req, res) => {
  try {
    // This would be implemented to export reports in various formats (PDF, Excel, etc.)
    res.status(501).json({
      message: 'Export functionality not yet implemented',
      code: 'NOT_IMPLEMENTED'
    });

  } catch (error) {
    console.error('Export report error:', error);
    res.status(500).json({
      error: 'Failed to export report',
      code: 'EXPORT_ERROR'
    });
  }
};

module.exports = {
  getLeaveStatistics,
  getDepartmentReport,
  getUserReport,
  getSummaryReport,
  getLeaveUsageReport,
  exportReport
};