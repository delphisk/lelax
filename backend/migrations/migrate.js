const { executeQuery, testConnection } = require('../src/config/database');

const createTables = async () => {
  try {
    // Test connection first
    const isConnected = await testConnection();
    if (!isConnected) {
      console.error('❌ Cannot connect to database. Migration aborted.');
      return;
    }

    console.log('🚀 Starting database migration...');

    // Create departments table
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS departments (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(100) NOT NULL,
        code VARCHAR(20) UNIQUE NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Create positions table
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS positions (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(100) NOT NULL,
        level INT NOT NULL DEFAULT 1,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Create fiscal_years table
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS fiscal_years (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(20) NOT NULL,
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        is_active BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Create users table
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS users (
        id INT PRIMARY KEY AUTO_INCREMENT,
        username VARCHAR(50) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        employee_id VARCHAR(20) UNIQUE NOT NULL,
        first_name VARCHAR(50) NOT NULL,
        last_name VARCHAR(50) NOT NULL,
        email VARCHAR(100) UNIQUE,
        phone VARCHAR(20),
        department_id INT,
        position_id INT,
        role ENUM('employee', 'supervisor', 'hr', 'admin') DEFAULT 'employee',
        hire_date DATE,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (department_id) REFERENCES departments(id),
        FOREIGN KEY (position_id) REFERENCES positions(id)
      )
    `);

    // Create leave_types table
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS leave_types (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(100) NOT NULL,
        code VARCHAR(20) UNIQUE NOT NULL,
        max_days_per_year INT DEFAULT 0,
        description TEXT,
        requires_document BOOLEAN DEFAULT FALSE,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Create leave_balances table
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS leave_balances (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        leave_type_id INT NOT NULL,
        fiscal_year_id INT NOT NULL,
        total_days INT DEFAULT 0,
        used_days INT DEFAULT 0,
        remaining_days INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (leave_type_id) REFERENCES leave_types(id),
        FOREIGN KEY (fiscal_year_id) REFERENCES fiscal_years(id),
        UNIQUE KEY unique_balance (user_id, leave_type_id, fiscal_year_id)
      )
    `);

    // Create leave_requests table
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS leave_requests (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        leave_type_id INT NOT NULL,
        fiscal_year_id INT NOT NULL,
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        days_count INT NOT NULL,
        reason TEXT,
        status ENUM('pending', 'approved', 'denied') DEFAULT 'pending',
        supervisor_id INT,
        supervisor_comment TEXT,
        approved_at TIMESTAMP NULL,
        document_path VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (leave_type_id) REFERENCES leave_types(id),
        FOREIGN KEY (fiscal_year_id) REFERENCES fiscal_years(id),
        FOREIGN KEY (supervisor_id) REFERENCES users(id)
      )
    `);

    // Create user_sessions table for JWT token management
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS user_sessions (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        token_hash VARCHAR(255) NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    console.log('✅ Database migration completed successfully!');
    console.log('📊 Created tables:');
    console.log('  - departments');
    console.log('  - positions');
    console.log('  - fiscal_years');
    console.log('  - users');
    console.log('  - leave_types');
    console.log('  - leave_balances');
    console.log('  - leave_requests');
    console.log('  - user_sessions');

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    throw error;
  }
};

// Run migration if this file is executed directly
if (require.main === module) {
  createTables()
    .then(() => {
      console.log('🎉 Migration process completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Migration process failed:', error.message);
      process.exit(1);
    });
}

module.exports = { createTables };