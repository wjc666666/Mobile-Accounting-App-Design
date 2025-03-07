# 数据库管理

本目录包含与数据库相关的文件和脚本。

## 文件说明

- `schema.sql`: 数据库表结构定义
- `init_data.sql`: 初始测试数据
- `db.js`: 数据库连接模块
- `init.js`: 数据库初始化脚本
- `run_init.bat`: 运行数据库初始化的批处理脚本
- `alter_tables.sql`: 修改表结构的SQL脚本

## 如何初始化数据库

1. 确保MySQL服务已启动
2. 确保项目根目录的`.env`文件中包含正确的数据库配置：
   ```
   DB_HOST=127.0.0.1
   DB_USER=root
   DB_PASSWORD=你的密码
   DB_DATABASE=mobile_accounting_db
   ```
3. 双击运行`run_init.bat`或在命令行中执行`node init.js`

## 如何修改表结构

如果需要修改表结构，可以编辑`alter_tables.sql`文件，然后在MySQL客户端中执行：

```sql
USE mobile_accounting_db;
source alter_tables.sql;
```

或者使用命令行：

```bash
mysql -u root -p mobile_accounting_db < alter_tables.sql
``` 