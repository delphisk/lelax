const mysql = require('mysql2/promise');
require('dotenv').config();

// Database connection configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'government_leave_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true
};

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Test database connection
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Connected to MySQL database successfully');
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
};

// Execute query helper function
const executeQuery = async (query, params = []) => {
  try {
    const [rows] = await pool.execute(query, params);
    return rows;
  } catch (error) {
    console.error('Database query error:', error.message);
    throw error;
  }
};

// Get fiscal year helper function
const getCurrentFiscalYear = () => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const fiscalYearStart = new Date(currentYear, 9, 1); // October 1st
  
  if (now >= fiscalYearStart) {
    return {
      year: currentYear + 543 + 1, // Thai Buddhist year + 1 for next fiscal year
      startDate: new Date(currentYear, 9, 1),
      endDate: new Date(currentYear + 1, 8, 30)
    };
  } else {
    return {
      year: currentYear + 543,
      startDate: new Date(currentYear - 1, 9, 1),
      endDate: new Date(currentYear, 8, 30)
    };
  }
};

module.exports = {
  pool,
  executeQuery,
  testConnection,
  getCurrentFiscalYear
};