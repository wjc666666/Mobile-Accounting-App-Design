-- Add missing columns to goals table
USE mobile_accounting_db;

-- Check if columns already exist before adding
SET @exist_description := (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'mobile_accounting_db' AND TABLE_NAME = 'goals' AND COLUMN_NAME = 'description');
SET @exist_status := (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'mobile_accounting_db' AND TABLE_NAME = 'goals' AND COLUMN_NAME = 'status');

-- Add description column if it doesn't exist
SET @query_description := IF(@exist_description = 0, 'ALTER TABLE goals ADD COLUMN description TEXT AFTER deadline', 'SELECT ''description column already exists''');
PREPARE stmt FROM @query_description;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add status column if it doesn't exist
SET @query_status := IF(@exist_status = 0, 'ALTER TABLE goals ADD COLUMN status VARCHAR(20) DEFAULT ''active'' AFTER description', 'SELECT ''status column already exists''');
PREPARE stmt FROM @query_status;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
