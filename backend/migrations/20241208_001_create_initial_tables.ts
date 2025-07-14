import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Create departments table
  await knex.schema.createTable('departments', (table) => {
    table.increments('id').primary();
    table.string('name', 100).notNullable();
    table.string('code', 20).notNullable().unique();
    table.integer('manager_id').unsigned().nullable();
    table.boolean('is_active').defaultTo(true);
    table.timestamps(true, true);
    
    table.index(['code']);
    table.index(['is_active']);
  });

  // Create positions table
  await knex.schema.createTable('positions', (table) => {
    table.increments('id').primary();
    table.string('name', 100).notNullable();
    table.integer('level').notNullable();
    table.boolean('is_active').defaultTo(true);
    table.timestamps(true, true);
    
    table.index(['level']);
    table.index(['is_active']);
  });

  // Create users table
  await knex.schema.createTable('users', (table) => {
    table.increments('id').primary();
    table.string('employee_id', 20).notNullable().unique();
    table.string('username', 50).notNullable().unique();
    table.string('password', 255).notNullable();
    table.string('first_name', 50).notNullable();
    table.string('last_name', 50).notNullable();
    table.string('email', 100).notNullable().unique();
    table.string('phone', 20).nullable();
    table.integer('department_id').unsigned().notNullable();
    table.integer('position_id').unsigned().notNullable();
    table.enum('role', ['employee', 'supervisor', 'hr', 'admin']).defaultTo('employee');
    table.date('hire_date').notNullable();
    table.boolean('is_active').defaultTo(true);
    table.timestamps(true, true);
    
    table.foreign('department_id').references('id').inTable('departments');
    table.foreign('position_id').references('id').inTable('positions');
    
    table.index(['employee_id']);
    table.index(['username']);
    table.index(['email']);
    table.index(['department_id']);
    table.index(['role']);
    table.index(['is_active']);
  });

  // Add foreign key for department manager
  await knex.schema.alterTable('departments', (table) => {
    table.foreign('manager_id').references('id').inTable('users');
  });

  // Create leave_types table
  await knex.schema.createTable('leave_types', (table) => {
    table.increments('id').primary();
    table.string('name', 100).notNullable();
    table.string('code', 20).notNullable().unique();
    table.integer('annual_quota').notNullable();
    table.boolean('can_carryover').defaultTo(false);
    table.integer('max_carryover_days').defaultTo(0);
    table.boolean('requires_medical_cert').defaultTo(false);
    table.integer('advance_notice_days').defaultTo(0);
    table.integer('max_consecutive_days').defaultTo(365);
    table.boolean('is_active').defaultTo(true);
    table.timestamps(true, true);
    
    table.index(['code']);
    table.index(['is_active']);
  });

  // Create fiscal_years table
  await knex.schema.createTable('fiscal_years', (table) => {
    table.increments('id').primary();
    table.integer('year').notNullable().unique();
    table.date('start_date').notNullable();
    table.date('end_date').notNullable();
    table.boolean('is_active').defaultTo(false);
    table.timestamps(true, true);
    
    table.index(['year']);
    table.index(['is_active']);
    table.index(['start_date', 'end_date']);
  });

  // Create leave_balances table
  await knex.schema.createTable('leave_balances', (table) => {
    table.increments('id').primary();
    table.integer('user_id').unsigned().notNullable();
    table.integer('fiscal_year_id').unsigned().notNullable();
    table.integer('leave_type_id').unsigned().notNullable();
    table.decimal('opening_balance', 8, 2).defaultTo(0);
    table.decimal('earned_days', 8, 2).defaultTo(0);
    table.decimal('used_days', 8, 2).defaultTo(0);
    table.decimal('carried_over', 8, 2).defaultTo(0);
    table.decimal('remaining_balance', 8, 2).defaultTo(0);
    table.timestamps(true, true);
    
    table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.foreign('fiscal_year_id').references('id').inTable('fiscal_years');
    table.foreign('leave_type_id').references('id').inTable('leave_types');
    
    table.unique(['user_id', 'fiscal_year_id', 'leave_type_id']);
    table.index(['user_id']);
    table.index(['fiscal_year_id']);
    table.index(['leave_type_id']);
  });

  // Create leave_requests table
  await knex.schema.createTable('leave_requests', (table) => {
    table.increments('id').primary();
    table.integer('user_id').unsigned().notNullable();
    table.integer('leave_type_id').unsigned().notNullable();
    table.date('start_date').notNullable();
    table.date('end_date').notNullable();
    table.decimal('total_days', 8, 2).notNullable();
    table.text('reason').notNullable();
    table.enum('status', ['pending', 'approved', 'rejected', 'cancelled']).defaultTo('pending');
    table.integer('supervisor_id').unsigned().nullable();
    table.text('supervisor_comment').nullable();
    table.integer('hr_id').unsigned().nullable();
    table.text('hr_comment').nullable();
    table.timestamp('approved_at').nullable();
    table.string('medical_certificate', 255).nullable();
    table.text('attachments').nullable();
    table.timestamps(true, true);
    
    table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.foreign('leave_type_id').references('id').inTable('leave_types');
    table.foreign('supervisor_id').references('id').inTable('users');
    table.foreign('hr_id').references('id').inTable('users');
    
    table.index(['user_id']);
    table.index(['leave_type_id']);
    table.index(['status']);
    table.index(['start_date', 'end_date']);
    table.index(['supervisor_id']);
    table.index(['hr_id']);
  });

  // Create user_sessions table
  await knex.schema.createTable('user_sessions', (table) => {
    table.increments('id').primary();
    table.integer('user_id').unsigned().notNullable();
    table.text('token').notNullable();
    table.timestamp('expires_at').notNullable();
    table.boolean('is_active').defaultTo(true);
    table.timestamps(true, true);
    
    table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE');
    
    table.index(['user_id']);
    table.index(['expires_at']);
    table.index(['is_active']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('user_sessions');
  await knex.schema.dropTableIfExists('leave_requests');
  await knex.schema.dropTableIfExists('leave_balances');
  await knex.schema.dropTableIfExists('fiscal_years');
  await knex.schema.dropTableIfExists('leave_types');
  
  // Remove foreign key constraint before dropping users table
  await knex.schema.alterTable('departments', (table) => {
    table.dropForeign(['manager_id']);
  });
  
  await knex.schema.dropTableIfExists('users');
  await knex.schema.dropTableIfExists('positions');
  await knex.schema.dropTableIfExists('departments');
}