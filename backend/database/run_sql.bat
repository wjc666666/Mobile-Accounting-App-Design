@echo off
echo 正在执行SQL命令...
mysql -u root -p mobile_accounting_db -e "ALTER TABLE income ADD COLUMN IF NOT EXISTS description TEXT; ALTER TABLE expenses ADD COLUMN IF NOT EXISTS description TEXT;"
echo SQL命令执行完成！
pause 