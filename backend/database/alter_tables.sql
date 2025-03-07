-- 使用数据库
USE mobile_accounting_db;

-- 检查income表中是否存在description字段，如果不存在则添加
ALTER TABLE income ADD COLUMN IF NOT EXISTS description TEXT;

-- 检查expenses表中是否存在description字段，如果不存在则添加
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS description TEXT; 