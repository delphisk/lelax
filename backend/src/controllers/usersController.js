const bcrypt = require('bcryptjs');
const { executeQuery } = require('../config/database');

// Get all users (HR/Admin only)
const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, department_id, role, search } = req.query;

    let whereConditions = ['u.is_active = TRUE'];
    let queryParams = [];

    // Department filter
    if (department_id) {
      whereConditions.push('u.department_id = ?');
      queryParams.push(department_id);
    }

    // Role filter
    if (role) {
      whereConditions.push('u.role = ?');
      queryParams.push(role);
    }

    // Search filter
    if (search) {
      whereConditions.push('(u.first_name LIKE ? OR u.last_name LIKE ? OR u.employee_id LIKE ?)');
      const searchTerm = `%${search}%`;
      queryParams.push(searchTerm, searchTerm, searchTerm);
    }

    const whereClause = `WHERE ${whereConditions.join(' AND ')}`;

    // Get total count for pagination
    const countQuery = `
      SELECT COUNT(*) as total
      FROM users u
      ${whereClause}
    `;
    const countResult = await executeQuery(countQuery, queryParams);
    const total = countResult[0].total;

    // Calculate pagination
    const offset = (page - 1) * limit;
    const totalPages = Math.ceil(total / limit);

    // Get users
    const query = `
      SELECT u.id, u.username, u.employee_id, u.first_name, u.last_name, 
             u.email, u.phone, u.role, u.hire_date, u.created_at,
             d.name as department_name, d.code as department_code,
             p.name as position_name, p.level as position_level
      FROM users u
      LEFT JOIN departments d ON u.department_id = d.id
      LEFT JOIN positions p ON u.position_id = p.id
      ${whereClause}
      ORDER BY u.first_name, u.last_name
      LIMIT ? OFFSET ?
    `;

    queryParams.push(parseInt(limit), offset);
    const users = await executeQuery(query, queryParams);

    res.status(200).json({
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages
      }
    });

  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      error: 'Failed to get users',
      code: 'GET_USERS_ERROR'
    });
  }
};

// Get user by ID
const getUserById = async (req, res) => {
  try {
    const userId = req.params.id;
    const currentUser = req.user;

    // Check permissions - users can only view their own data unless they're HR/Admin
    if (currentUser.role === 'employee' && currentUser.id != userId) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You can only view your own profile',
        code: 'ACCESS_DENIED'
      });
    }

    if (currentUser.role === 'supervisor') {
      // Supervisors can view users in their department
      const targetUser = await executeQuery(
        'SELECT department_id FROM users WHERE id = ?',
        [userId]
      );
      
      if (targetUser.length === 0) {
        return res.status(404).json({
          error: 'User not found',
          code: 'USER_NOT_FOUND'
        });
      }

      if (targetUser[0].department_id !== currentUser.department_id) {
        return res.status(403).json({
          error: 'Access denied',
          message: 'You can only view users in your department',
          code: 'ACCESS_DENIED'
        });
      }
    }

    // Get user details
    const users = await executeQuery(
      `SELECT u.id, u.username, u.employee_id, u.first_name, u.last_name, 
              u.email, u.phone, u.role, u.hire_date, u.created_at,
              d.name as department_name, d.code as department_code,
              p.name as position_name, p.level as position_level
       FROM users u
       LEFT JOIN departments d ON u.department_id = d.id
       LEFT JOIN positions p ON u.position_id = p.id
       WHERE u.id = ? AND u.is_active = TRUE`,
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({
        error: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    // Get current fiscal year leave balances
    const currentFY = await executeQuery('SELECT id FROM fiscal_years WHERE is_active = TRUE LIMIT 1');
    let leaveBalances = [];

    if (currentFY.length > 0) {
      leaveBalances = await executeQuery(
        `SELECT lb.*, lt.name as leave_type_name, lt.code as leave_type_code
         FROM leave_balances lb
         JOIN leave_types lt ON lb.leave_type_id = lt.id
         WHERE lb.user_id = ? AND lb.fiscal_year_id = ?`,
        [userId, currentFY[0].id]
      );
    }

    res.status(200).json({
      user: {
        ...users[0],
        leave_balances: leaveBalances
      }
    });

  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({
      error: 'Failed to get user',
      code: 'GET_USER_ERROR'
    });
  }
};

// Update user (HR/Admin only)
const updateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const { 
      first_name, 
      last_name, 
      email, 
      phone, 
      department_id, 
      position_id, 
      role,
      hire_date 
    } = req.body;

    // Check if user exists
    const existingUser = await executeQuery('SELECT * FROM users WHERE id = ?', [userId]);
    if (existingUser.length === 0) {
      return res.status(404).json({
        error: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    // Build update query dynamically
    const updateFields = [];
    const updateValues = [];

    if (first_name !== undefined) {
      updateFields.push('first_name = ?');
      updateValues.push(first_name);
    }
    if (last_name !== undefined) {
      updateFields.push('last_name = ?');
      updateValues.push(last_name);
    }
    if (email !== undefined) {
      updateFields.push('email = ?');
      updateValues.push(email);
    }
    if (phone !== undefined) {
      updateFields.push('phone = ?');
      updateValues.push(phone);
    }
    if (department_id !== undefined) {
      updateFields.push('department_id = ?');
      updateValues.push(department_id);
    }
    if (position_id !== undefined) {
      updateFields.push('position_id = ?');
      updateValues.push(position_id);
    }
    if (role !== undefined) {
      updateFields.push('role = ?');
      updateValues.push(role);
    }
    if (hire_date !== undefined) {
      updateFields.push('hire_date = ?');
      updateValues.push(hire_date);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({
        error: 'No fields to update',
        code: 'NO_UPDATE_FIELDS'
      });
    }

    updateFields.push('updated_at = NOW()');
    updateValues.push(userId);

    // Update user
    const updateQuery = `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`;
    await executeQuery(updateQuery, updateValues);

    // Get updated user
    const updatedUser = await executeQuery(
      `SELECT u.id, u.username, u.employee_id, u.first_name, u.last_name, 
              u.email, u.phone, u.role, u.hire_date, u.updated_at,
              d.name as department_name, p.name as position_name
       FROM users u
       LEFT JOIN departments d ON u.department_id = d.id
       LEFT JOIN positions p ON u.position_id = p.id
       WHERE u.id = ?`,
      [userId]
    );

    res.status(200).json({
      message: 'User updated successfully',
      user: updatedUser[0]
    });

  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      error: 'Failed to update user',
      code: 'UPDATE_USER_ERROR'
    });
  }
};

// Create new user (HR/Admin only)
const createUser = async (req, res) => {
  try {
    const {
      username,
      password,
      employee_id,
      first_name,
      last_name,
      email,
      phone,
      department_id,
      position_id,
      role,
      hire_date
    } = req.body;

    // Validation
    if (!username || !password || !employee_id || !first_name || !last_name) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Username, password, employee_id, first_name, and last_name are required',
        code: 'MISSING_FIELDS'
      });
    }

    // Check if username or employee_id already exists
    const existingUser = await executeQuery(
      'SELECT id FROM users WHERE username = ? OR employee_id = ?',
      [username, employee_id]
    );

    if (existingUser.length > 0) {
      return res.status(409).json({
        error: 'User already exists',
        message: 'Username or employee ID already exists',
        code: 'USER_EXISTS'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const result = await executeQuery(
      `INSERT INTO users 
       (username, password, employee_id, first_name, last_name, email, phone, 
        department_id, position_id, role, hire_date) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [username, hashedPassword, employee_id, first_name, last_name, email, 
       phone, department_id, position_id, role || 'employee', hire_date]
    );

    // Initialize leave balances for the new user
    const currentFY = await executeQuery('SELECT id FROM fiscal_years WHERE is_active = TRUE LIMIT 1');
    if (currentFY.length > 0) {
      const leaveTypes = await executeQuery('SELECT id, max_days_per_year FROM leave_types WHERE is_active = TRUE');
      
      for (const leaveType of leaveTypes) {
        await executeQuery(
          'INSERT INTO leave_balances (user_id, leave_type_id, fiscal_year_id, total_days, used_days, remaining_days) VALUES (?, ?, ?, ?, 0, ?)',
          [result.insertId, leaveType.id, currentFY[0].id, leaveType.max_days_per_year, leaveType.max_days_per_year]
        );
      }
    }

    // Get created user details
    const newUser = await executeQuery(
      `SELECT u.id, u.username, u.employee_id, u.first_name, u.last_name, 
              u.email, u.phone, u.role, u.hire_date, u.created_at,
              d.name as department_name, p.name as position_name
       FROM users u
       LEFT JOIN departments d ON u.department_id = d.id
       LEFT JOIN positions p ON u.position_id = p.id
       WHERE u.id = ?`,
      [result.insertId]
    );

    res.status(201).json({
      message: 'User created successfully',
      user: newUser[0]
    });

  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({
      error: 'Failed to create user',
      code: 'CREATE_USER_ERROR'
    });
  }
};

// Deactivate user (Admin only)
const deactivateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const currentUser = req.user;

    // Prevent admin from deactivating themselves
    if (currentUser.id == userId) {
      return res.status(400).json({
        error: 'Cannot deactivate yourself',
        code: 'CANNOT_DEACTIVATE_SELF'
      });
    }

    // Check if user exists
    const user = await executeQuery('SELECT * FROM users WHERE id = ?', [userId]);
    if (user.length === 0) {
      return res.status(404).json({
        error: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    // Deactivate user
    await executeQuery(
      'UPDATE users SET is_active = FALSE, updated_at = NOW() WHERE id = ?',
      [userId]
    );

    // Deactivate all user sessions
    await executeQuery(
      'UPDATE user_sessions SET is_active = FALSE WHERE user_id = ?',
      [userId]
    );

    res.status(200).json({
      message: 'User deactivated successfully'
    });

  } catch (error) {
    console.error('Deactivate user error:', error);
    res.status(500).json({
      error: 'Failed to deactivate user',
      code: 'DEACTIVATE_USER_ERROR'
    });
  }
};

// Get users by department
const getUsersByDepartment = async (req, res) => {
  try {
    const departmentId = req.params.id;
    const currentUser = req.user;

    // Check permissions
    if (currentUser.role === 'supervisor' && currentUser.department_id != departmentId) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You can only view users in your department',
        code: 'ACCESS_DENIED'
      });
    }

    const users = await executeQuery(
      `SELECT u.id, u.username, u.employee_id, u.first_name, u.last_name, 
              u.email, u.role, u.hire_date,
              p.name as position_name, p.level as position_level
       FROM users u
       LEFT JOIN positions p ON u.position_id = p.id
       WHERE u.department_id = ? AND u.is_active = TRUE
       ORDER BY u.first_name, u.last_name`,
      [departmentId]
    );

    res.status(200).json({ users });

  } catch (error) {
    console.error('Get users by department error:', error);
    res.status(500).json({
      error: 'Failed to get users by department',
      code: 'GET_DEPARTMENT_USERS_ERROR'
    });
  }
};

// Get user's subordinates (for supervisors)
const getSubordinates = async (req, res) => {
  try {
    const userId = req.params.id;
    const currentUser = req.user;

    // Only allow supervisors to get their own subordinates (or HR/Admin)
    if (currentUser.role === 'supervisor' && currentUser.id != userId) {
      return res.status(403).json({
        error: 'Access denied',
        code: 'ACCESS_DENIED'
      });
    }

    // Get user info to get department
    const user = await executeQuery(
      'SELECT department_id FROM users WHERE id = ?',
      [userId]
    );

    if (user.length === 0) {
      return res.status(404).json({
        error: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    // Get subordinates (users in the same department with employee role)
    const subordinates = await executeQuery(
      `SELECT u.id, u.username, u.employee_id, u.first_name, u.last_name, 
              u.email, u.role, u.hire_date,
              p.name as position_name, p.level as position_level
       FROM users u
       LEFT JOIN positions p ON u.position_id = p.id
       WHERE u.department_id = ? AND u.role = 'employee' AND u.is_active = TRUE
       ORDER BY u.first_name, u.last_name`,
      [user[0].department_id]
    );

    res.status(200).json({ subordinates });

  } catch (error) {
    console.error('Get subordinates error:', error);
    res.status(500).json({
      error: 'Failed to get subordinates',
      code: 'GET_SUBORDINATES_ERROR'
    });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  updateUser,
  createUser,
  deactivateUser,
  getUsersByDepartment,
  getSubordinates
};