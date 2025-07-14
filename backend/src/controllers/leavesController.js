const moment = require('moment');
const { executeQuery, getCurrentFiscalYear } = require('../config/database');

// Get leave balance for current user
const getLeaveBalance = async (req, res) => {
  try {
    const userId = req.user.id;
    const fiscalYearId = req.query.fiscal_year_id;

    let currentFY;
    if (fiscalYearId) {
      currentFY = await executeQuery('SELECT * FROM fiscal_years WHERE id = ?', [fiscalYearId]);
    } else {
      currentFY = await executeQuery('SELECT * FROM fiscal_years WHERE is_active = TRUE LIMIT 1');
    }

    if (currentFY.length === 0) {
      return res.status(404).json({
        error: 'Fiscal year not found',
        message: 'No active fiscal year found',
        code: 'FISCAL_YEAR_NOT_FOUND'
      });
    }

    const leaveBalances = await executeQuery(
      `SELECT lb.*, lt.name as leave_type_name, lt.code as leave_type_code, lt.description
       FROM leave_balances lb
       JOIN leave_types lt ON lb.leave_type_id = lt.id
       WHERE lb.user_id = ? AND lb.fiscal_year_id = ?
       ORDER BY lt.name`,
      [userId, currentFY[0].id]
    );

    res.status(200).json({
      fiscal_year: currentFY[0],
      leave_balances: leaveBalances
    });

  } catch (error) {
    console.error('Get leave balance error:', error);
    res.status(500).json({
      error: 'Failed to get leave balance',
      message: 'Internal server error',
      code: 'LEAVE_BALANCE_ERROR'
    });
  }
};

// Get leave balance by user ID
const getLeaveBalanceByUserId = async (req, res) => {
  try {
    const userId = req.params.userId;
    const fiscalYearId = req.query.fiscal_year_id;

    let currentFY;
    if (fiscalYearId) {
      currentFY = await executeQuery('SELECT * FROM fiscal_years WHERE id = ?', [fiscalYearId]);
    } else {
      currentFY = await executeQuery('SELECT * FROM fiscal_years WHERE is_active = TRUE LIMIT 1');
    }

    if (currentFY.length === 0) {
      return res.status(404).json({
        error: 'Fiscal year not found',
        message: 'No active fiscal year found',
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
        message: 'User does not exist',
        code: 'USER_NOT_FOUND'
      });
    }

    const leaveBalances = await executeQuery(
      `SELECT lb.*, lt.name as leave_type_name, lt.code as leave_type_code, lt.description
       FROM leave_balances lb
       JOIN leave_types lt ON lb.leave_type_id = lt.id
       WHERE lb.user_id = ? AND lb.fiscal_year_id = ?
       ORDER BY lt.name`,
      [userId, currentFY[0].id]
    );

    res.status(200).json({
      user: user[0],
      fiscal_year: currentFY[0],
      leave_balances: leaveBalances
    });

  } catch (error) {
    console.error('Get leave balance by user ID error:', error);
    res.status(500).json({
      error: 'Failed to get leave balance',
      message: 'Internal server error',
      code: 'LEAVE_BALANCE_ERROR'
    });
  }
};

// Get leave requests
const getLeaveRequests = async (req, res) => {
  try {
    const user = req.user;
    const { status, fiscal_year_id, page = 1, limit = 10 } = req.query;

    let whereConditions = [];
    let queryParams = [];

    // Role-based filtering
    if (user.role === 'employee') {
      whereConditions.push('lr.user_id = ?');
      queryParams.push(user.id);
    } else if (user.role === 'supervisor') {
      // Supervisors can see their department's requests
      whereConditions.push('u.department_id = ?');
      queryParams.push(user.department_id);
    }
    // HR and Admin can see all requests

    // Status filter
    if (status) {
      whereConditions.push('lr.status = ?');
      queryParams.push(status);
    }

    // Fiscal year filter
    if (fiscal_year_id) {
      whereConditions.push('lr.fiscal_year_id = ?');
      queryParams.push(fiscal_year_id);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Get total count for pagination
    const countQuery = `
      SELECT COUNT(*) as total
      FROM leave_requests lr
      JOIN users u ON lr.user_id = u.id
      ${whereClause}
    `;
    const countResult = await executeQuery(countQuery, queryParams);
    const total = countResult[0].total;

    // Calculate pagination
    const offset = (page - 1) * limit;
    const totalPages = Math.ceil(total / limit);

    // Get leave requests
    const query = `
      SELECT lr.*, 
             u.first_name, u.last_name, u.employee_id,
             lt.name as leave_type_name, lt.code as leave_type_code,
             fy.name as fiscal_year_name,
             sup.first_name as supervisor_first_name, sup.last_name as supervisor_last_name
      FROM leave_requests lr
      JOIN users u ON lr.user_id = u.id
      JOIN leave_types lt ON lr.leave_type_id = lt.id
      JOIN fiscal_years fy ON lr.fiscal_year_id = fy.id
      LEFT JOIN users sup ON lr.supervisor_id = sup.id
      ${whereClause}
      ORDER BY lr.created_at DESC
      LIMIT ? OFFSET ?
    `;

    queryParams.push(parseInt(limit), offset);
    const requests = await executeQuery(query, queryParams);

    res.status(200).json({
      requests,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages
      }
    });

  } catch (error) {
    console.error('Get leave requests error:', error);
    res.status(500).json({
      error: 'Failed to get leave requests',
      message: 'Internal server error',
      code: 'LEAVE_REQUESTS_ERROR'
    });
  }
};

// Get leave request by ID
const getLeaveRequestById = async (req, res) => {
  try {
    const requestId = req.params.id;
    const user = req.user;

    const query = `
      SELECT lr.*, 
             u.first_name, u.last_name, u.employee_id, u.department_id,
             lt.name as leave_type_name, lt.code as leave_type_code,
             fy.name as fiscal_year_name,
             sup.first_name as supervisor_first_name, sup.last_name as supervisor_last_name,
             d.name as department_name
      FROM leave_requests lr
      JOIN users u ON lr.user_id = u.id
      JOIN leave_types lt ON lr.leave_type_id = lt.id
      JOIN fiscal_years fy ON lr.fiscal_year_id = fy.id
      LEFT JOIN users sup ON lr.supervisor_id = sup.id
      LEFT JOIN departments d ON u.department_id = d.id
      WHERE lr.id = ?
    `;

    const requests = await executeQuery(query, [requestId]);

    if (requests.length === 0) {
      return res.status(404).json({
        error: 'Request not found',
        message: 'Leave request does not exist',
        code: 'REQUEST_NOT_FOUND'
      });
    }

    const request = requests[0];

    // Check access permissions
    if (user.role === 'employee' && request.user_id !== user.id) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You can only view your own requests',
        code: 'ACCESS_DENIED'
      });
    }

    if (user.role === 'supervisor' && request.department_id !== user.department_id) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You can only view requests from your department',
        code: 'ACCESS_DENIED'
      });
    }

    res.status(200).json({ request });

  } catch (error) {
    console.error('Get leave request by ID error:', error);
    res.status(500).json({
      error: 'Failed to get leave request',
      message: 'Internal server error',
      code: 'LEAVE_REQUEST_ERROR'
    });
  }
};

// Create leave request
const createLeaveRequest = async (req, res) => {
  try {
    const user = req.user;
    const { leave_type_id, start_date, end_date, reason } = req.body;

    // Validation
    if (!leave_type_id || !start_date || !end_date) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Leave type, start date, and end date are required',
        code: 'MISSING_FIELDS'
      });
    }

    // Validate dates
    const startDate = moment(start_date);
    const endDate = moment(end_date);
    
    if (!startDate.isValid() || !endDate.isValid()) {
      return res.status(400).json({
        error: 'Invalid dates',
        message: 'Start date and end date must be valid dates',
        code: 'INVALID_DATES'
      });
    }

    if (endDate.isBefore(startDate)) {
      return res.status(400).json({
        error: 'Invalid date range',
        message: 'End date cannot be before start date',
        code: 'INVALID_DATE_RANGE'
      });
    }

    // Calculate days count (including weekends for now)
    const daysCount = endDate.diff(startDate, 'days') + 1;

    // Get current fiscal year
    const currentFY = await executeQuery('SELECT * FROM fiscal_years WHERE is_active = TRUE LIMIT 1');
    if (currentFY.length === 0) {
      return res.status(400).json({
        error: 'No active fiscal year',
        message: 'No active fiscal year found',
        code: 'NO_ACTIVE_FISCAL_YEAR'
      });
    }

    // Check leave balance
    const balance = await executeQuery(
      'SELECT * FROM leave_balances WHERE user_id = ? AND leave_type_id = ? AND fiscal_year_id = ?',
      [user.id, leave_type_id, currentFY[0].id]
    );

    if (balance.length === 0) {
      return res.status(400).json({
        error: 'Leave balance not found',
        message: 'Leave balance not initialized for this user and leave type',
        code: 'BALANCE_NOT_FOUND'
      });
    }

    if (balance[0].remaining_days < daysCount) {
      return res.status(400).json({
        error: 'Insufficient leave balance',
        message: `You have only ${balance[0].remaining_days} days remaining for this leave type`,
        code: 'INSUFFICIENT_BALANCE'
      });
    }

    // Find supervisor (for now, we'll use a simple rule - anyone with supervisor role in the same department)
    const supervisors = await executeQuery(
      'SELECT id FROM users WHERE role = ? AND department_id = ? AND id != ? LIMIT 1',
      ['supervisor', user.department_id, user.id]
    );

    const supervisorId = supervisors.length > 0 ? supervisors[0].id : null;

    // Create leave request
    const result = await executeQuery(
      `INSERT INTO leave_requests 
       (user_id, leave_type_id, fiscal_year_id, start_date, end_date, days_count, reason, supervisor_id) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [user.id, leave_type_id, currentFY[0].id, start_date, end_date, daysCount, reason, supervisorId]
    );

    // Get the created request
    const newRequest = await executeQuery(
      `SELECT lr.*, lt.name as leave_type_name, fy.name as fiscal_year_name
       FROM leave_requests lr
       JOIN leave_types lt ON lr.leave_type_id = lt.id
       JOIN fiscal_years fy ON lr.fiscal_year_id = fy.id
       WHERE lr.id = ?`,
      [result.insertId]
    );

    res.status(201).json({
      message: 'Leave request created successfully',
      request: newRequest[0]
    });

  } catch (error) {
    console.error('Create leave request error:', error);
    res.status(500).json({
      error: 'Failed to create leave request',
      message: 'Internal server error',
      code: 'CREATE_REQUEST_ERROR'
    });
  }
};

// Update leave request (approve/deny)
const updateLeaveRequest = async (req, res) => {
  try {
    const requestId = req.params.id;
    const user = req.user;
    const { status, supervisor_comment } = req.body;

    if (!['approved', 'denied'].includes(status)) {
      return res.status(400).json({
        error: 'Invalid status',
        message: 'Status must be either "approved" or "denied"',
        code: 'INVALID_STATUS'
      });
    }

    // Get the request
    const requests = await executeQuery(
      `SELECT lr.*, u.department_id 
       FROM leave_requests lr 
       JOIN users u ON lr.user_id = u.id 
       WHERE lr.id = ?`,
      [requestId]
    );

    if (requests.length === 0) {
      return res.status(404).json({
        error: 'Request not found',
        message: 'Leave request does not exist',
        code: 'REQUEST_NOT_FOUND'
      });
    }

    const request = requests[0];

    // Check if request is still pending
    if (request.status !== 'pending') {
      return res.status(400).json({
        error: 'Request already processed',
        message: `Request is already ${request.status}`,
        code: 'REQUEST_ALREADY_PROCESSED'
      });
    }

    // Check permissions
    if (user.role === 'supervisor' && request.department_id !== user.department_id) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You can only approve requests from your department',
        code: 'ACCESS_DENIED'
      });
    }

    // Update request
    await executeQuery(
      `UPDATE leave_requests 
       SET status = ?, supervisor_id = ?, supervisor_comment = ?, approved_at = NOW(), updated_at = NOW()
       WHERE id = ?`,
      [status, user.id, supervisor_comment, requestId]
    );

    // Update leave balance if approved
    if (status === 'approved') {
      await executeQuery(
        `UPDATE leave_balances 
         SET used_days = used_days + ?, remaining_days = remaining_days - ?, updated_at = NOW()
         WHERE user_id = ? AND leave_type_id = ? AND fiscal_year_id = ?`,
        [request.days_count, request.days_count, request.user_id, request.leave_type_id, request.fiscal_year_id]
      );
    }

    // Get updated request
    const updatedRequest = await executeQuery(
      `SELECT lr.*, 
             u.first_name, u.last_name, u.employee_id,
             lt.name as leave_type_name,
             sup.first_name as supervisor_first_name, sup.last_name as supervisor_last_name
       FROM leave_requests lr
       JOIN users u ON lr.user_id = u.id
       JOIN leave_types lt ON lr.leave_type_id = lt.id
       LEFT JOIN users sup ON lr.supervisor_id = sup.id
       WHERE lr.id = ?`,
      [requestId]
    );

    res.status(200).json({
      message: `Leave request ${status} successfully`,
      request: updatedRequest[0]
    });

  } catch (error) {
    console.error('Update leave request error:', error);
    res.status(500).json({
      error: 'Failed to update leave request',
      message: 'Internal server error',
      code: 'UPDATE_REQUEST_ERROR'
    });
  }
};

// Cancel leave request
const cancelLeaveRequest = async (req, res) => {
  try {
    const requestId = req.params.id;
    const user = req.user;

    // Get the request
    const requests = await executeQuery('SELECT * FROM leave_requests WHERE id = ?', [requestId]);

    if (requests.length === 0) {
      return res.status(404).json({
        error: 'Request not found',
        message: 'Leave request does not exist',
        code: 'REQUEST_NOT_FOUND'
      });
    }

    const request = requests[0];

    // Check permissions - only the requester can cancel their own request
    if (request.user_id !== user.id && !['hr', 'admin'].includes(user.role)) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You can only cancel your own requests',
        code: 'ACCESS_DENIED'
      });
    }

    // Check if request can be cancelled
    if (request.status === 'approved' && moment(request.start_date).isBefore(moment())) {
      return res.status(400).json({
        error: 'Cannot cancel',
        message: 'Cannot cancel approved request that has already started',
        code: 'CANNOT_CANCEL'
      });
    }

    // If approved, restore leave balance
    if (request.status === 'approved') {
      await executeQuery(
        `UPDATE leave_balances 
         SET used_days = used_days - ?, remaining_days = remaining_days + ?, updated_at = NOW()
         WHERE user_id = ? AND leave_type_id = ? AND fiscal_year_id = ?`,
        [request.days_count, request.days_count, request.user_id, request.leave_type_id, request.fiscal_year_id]
      );
    }

    // Update request status to denied (cancelled)
    await executeQuery(
      'UPDATE leave_requests SET status = ?, supervisor_comment = ?, updated_at = NOW() WHERE id = ?',
      ['denied', 'Cancelled by user', requestId]
    );

    res.status(200).json({
      message: 'Leave request cancelled successfully'
    });

  } catch (error) {
    console.error('Cancel leave request error:', error);
    res.status(500).json({
      error: 'Failed to cancel leave request',
      message: 'Internal server error',
      code: 'CANCEL_REQUEST_ERROR'
    });
  }
};

// Get leave history
const getLeaveHistory = async (req, res) => {
  try {
    const user = req.user;
    const { fiscal_year_id, page = 1, limit = 20 } = req.query;

    let whereConditions = ['lr.user_id = ?'];
    let queryParams = [user.id];

    if (fiscal_year_id) {
      whereConditions.push('lr.fiscal_year_id = ?');
      queryParams.push(fiscal_year_id);
    }

    const whereClause = `WHERE ${whereConditions.join(' AND ')}`;

    // Get total count
    const countQuery = `SELECT COUNT(*) as total FROM leave_requests lr ${whereClause}`;
    const countResult = await executeQuery(countQuery, queryParams);
    const total = countResult[0].total;

    // Calculate pagination
    const offset = (page - 1) * limit;
    const totalPages = Math.ceil(total / limit);

    // Get history
    const query = `
      SELECT lr.*, 
             lt.name as leave_type_name, lt.code as leave_type_code,
             fy.name as fiscal_year_name,
             sup.first_name as supervisor_first_name, sup.last_name as supervisor_last_name
      FROM leave_requests lr
      JOIN leave_types lt ON lr.leave_type_id = lt.id
      JOIN fiscal_years fy ON lr.fiscal_year_id = fy.id
      LEFT JOIN users sup ON lr.supervisor_id = sup.id
      ${whereClause}
      ORDER BY lr.created_at DESC
      LIMIT ? OFFSET ?
    `;

    queryParams.push(parseInt(limit), offset);
    const history = await executeQuery(query, queryParams);

    res.status(200).json({
      history,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages
      }
    });

  } catch (error) {
    console.error('Get leave history error:', error);
    res.status(500).json({
      error: 'Failed to get leave history',
      message: 'Internal server error',
      code: 'LEAVE_HISTORY_ERROR'
    });
  }
};

// Get leave types
const getLeaveTypes = async (req, res) => {
  try {
    const leaveTypes = await executeQuery(
      'SELECT * FROM leave_types WHERE is_active = TRUE ORDER BY name'
    );

    res.status(200).json({ leave_types: leaveTypes });

  } catch (error) {
    console.error('Get leave types error:', error);
    res.status(500).json({
      error: 'Failed to get leave types',
      message: 'Internal server error',
      code: 'LEAVE_TYPES_ERROR'
    });
  }
};

// Get fiscal years
const getFiscalYears = async (req, res) => {
  try {
    const fiscalYears = await executeQuery(
      'SELECT * FROM fiscal_years ORDER BY start_date DESC'
    );

    res.status(200).json({ fiscal_years: fiscalYears });

  } catch (error) {
    console.error('Get fiscal years error:', error);
    res.status(500).json({
      error: 'Failed to get fiscal years',
      message: 'Internal server error',
      code: 'FISCAL_YEARS_ERROR'
    });
  }
};

// Get pending approvals
const getPendingApprovals = async (req, res) => {
  try {
    const user = req.user;
    const { page = 1, limit = 10 } = req.query;

    let whereConditions = ['lr.status = ?'];
    let queryParams = ['pending'];

    // Role-based filtering
    if (user.role === 'supervisor') {
      whereConditions.push('u.department_id = ?');
      queryParams.push(user.department_id);
    }
    // HR and Admin can see all pending requests

    const whereClause = `WHERE ${whereConditions.join(' AND ')}`;

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM leave_requests lr
      JOIN users u ON lr.user_id = u.id
      ${whereClause}
    `;
    const countResult = await executeQuery(countQuery, queryParams);
    const total = countResult[0].total;

    // Calculate pagination
    const offset = (page - 1) * limit;
    const totalPages = Math.ceil(total / limit);

    // Get pending requests
    const query = `
      SELECT lr.*, 
             u.first_name, u.last_name, u.employee_id,
             lt.name as leave_type_name, lt.code as leave_type_code,
             fy.name as fiscal_year_name,
             d.name as department_name
      FROM leave_requests lr
      JOIN users u ON lr.user_id = u.id
      JOIN leave_types lt ON lr.leave_type_id = lt.id
      JOIN fiscal_years fy ON lr.fiscal_year_id = fy.id
      LEFT JOIN departments d ON u.department_id = d.id
      ${whereClause}
      ORDER BY lr.created_at ASC
      LIMIT ? OFFSET ?
    `;

    queryParams.push(parseInt(limit), offset);
    const pendingRequests = await executeQuery(query, queryParams);

    res.status(200).json({
      pending_requests: pendingRequests,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages
      }
    });

  } catch (error) {
    console.error('Get pending approvals error:', error);
    res.status(500).json({
      error: 'Failed to get pending approvals',
      message: 'Internal server error',
      code: 'PENDING_APPROVALS_ERROR'
    });
  }
};

module.exports = {
  getLeaveBalance,
  getLeaveBalanceByUserId,
  getLeaveRequests,
  getLeaveRequestById,
  createLeaveRequest,
  updateLeaveRequest,
  cancelLeaveRequest,
  getLeaveHistory,
  getLeaveTypes,
  getFiscalYears,
  getPendingApprovals
};