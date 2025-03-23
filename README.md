# 移动记账应用

一个功能完整的移动记账应用，包括前端和后端实现。

## 项目结构

```
/
├── frontend/           # React Native 前端
│   └── JCEco/          # 前端项目目录
│       ├── src/        # 源代码
│       │   ├── components/  # 可复用组件
│       │   ├── screens/     # 屏幕组件
│       │   ├── navigation/  # 导航配置
│       │   └── utils/       # 工具函数和API
│       ├── android/    # Android 配置
│       └── ios/        # iOS 配置
└── backend/            # Node.js 后端
    ├── server.js       # 服务器入口
    ├── database.sql    # 数据库脚本
    └── .env            # 环境变量配置
```

## 技术栈

### 前端
- React Native
- React Navigation
- React Native Paper
- Axios
- AsyncStorage

### 后端
- Node.js
- Express.js
- MySQL
- JWT 认证
- Bcrypt 密码加密

## 功能特性

- 用户认证（注册、登录、登出）
- 收入记录管理
- 支出记录管理
- 财务概览和统计
- 预算分析

## 安装和运行

### 前提条件
- Node.js (v14+)
- npm 或 yarn
- MySQL 数据库
- Android Studio (用于Android开发)
- Xcode (用于iOS开发，仅Mac)

### 后端设置

1. 进入后端目录
```bash
cd backend
```

2. 安装依赖
```bash
npm install
```

3. 创建数据库和表
```bash
mysql -u root -p < database.sql
```

4. 配置环境变量
创建 `.env` 文件，内容如下：
```
DB_HOST=127.0.0.1
DB_USER=root
DB_PASSWORD=你的数据库密码
DB_DATABASE=mobile_accounting_db
JWT_SECRET=你的密钥
PORT=5000
```

5. 启动服务器
```bash
node server.js
```

### 前端设置

1. 进入前端目录
```bash
cd frontend/JCEco
```

2. 安装依赖
```bash
npm install
```

3. 启动Metro服务器
```bash
npm start
```

4. 在新的终端中运行应用
```bash
# 对于Android
npm run android

# 对于iOS
npm run ios
```

## API文档

### 用户认证

#### 注册
- **URL**: `/users/register`
- **方法**: `POST`
- **请求体**:
  ```json
  {
    "username": "用户名",
    "email": "邮箱",
    "password": "密码"
  }
  ```

#### 登录
- **URL**: `/users/login`
- **方法**: `POST`
- **请求体**:
  ```json
  {
    "email": "邮箱",
    "password": "密码"
  }
  ```

### 收入管理

#### 添加收入
- **URL**: `/income`
- **方法**: `POST`
- **认证**: 需要JWT令牌
- **请求体**:
  ```json
  {
    "amount": 1000,
    "category": "Salary",
    "date": "2023-03-01",
    "description": "月薪"
  }
  ```

#### 获取收入记录
- **URL**: `/income`
- **方法**: `GET`
- **认证**: 需要JWT令牌

### 支出管理

#### 添加支出
- **URL**: `/expenses`
- **方法**: `POST`
- **认证**: 需要JWT令牌
- **请求体**:
  ```json
  {
    "amount": 100,
    "category": "Food",
    "date": "2023-03-05",
    "description": "晚餐"
  }
  ```

#### 获取支出记录
- **URL**: `/expenses`
- **方法**: `GET`
- **认证**: 需要JWT令牌

### 预算分析

#### 获取预算分析
- **URL**: `/budget/analysis`
- **方法**: `GET`
- **认证**: 需要JWT令牌

## 贡献

欢迎提交问题和拉取请求。

## 许可证

MIT
