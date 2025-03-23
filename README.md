# JCEco - Mobile Accounting Application

A comprehensive mobile accounting application that helps you track income, expenses and manage your financial goals, built with React Native and Node.js.

## Project Overview

JCEco is a full-stack mobile application designed to provide users with a seamless financial tracking experience. The app allows users to record their income and expenses, view financial statistics, and analyze their spending habits. It also integrates with popular payment apps like Alipay and WeChat to import transaction data.

## Project Structure

```
JCEco/
├── android/                # Android native code
│   └── app/                # Android app configuration and native modules
├── ios/                    # iOS native code
├── src/                    # React Native frontend source code
│   ├── components/         # Reusable UI components
│   ├── navigation/         # Navigation configuration
│   ├── screens/            # Application screens
│   └── utils/              # Utility functions and native module bridges
├── backend/                # Node.js backend
│   ├── database/           # Database related files
│   │   ├── alter_tables.sql  # SQL for altering tables
│   │   ├── db.js           # Database connection module
│   │   ├── init.js         # Database initialization script
│   │   ├── init_data.sql   # Initial data for tables
│   │   ├── README.md       # Database documentation
│   │   ├── run_init.bat    # Batch file for initialization
│   │   ├── schema.sql      # Database schema
│   │   └── setup.sql       # Setup script
│   ├── .env                # Environment variables (not in Git)
│   ├── package.json        # Backend dependencies
│   └── server.js           # Express server
└── __tests__/              # Test files
```

## Tech Stack

### Frontend
- **React Native**: Cross-platform mobile application framework
- **React Navigation**: Navigation library for React Native
- **Axios**: HTTP client for API requests
- **AsyncStorage**: Local storage for persisting data
- **React Native Paper**: Material Design component library

### Backend
- **Node.js**: JavaScript runtime
- **Express.js**: Web framework for Node.js
- **MySQL**: Relational database management system
- **JWT**: JSON Web Tokens for authentication
- **Bcrypt**: Password hashing library

### Native Integrations
- **Native Modules**: Custom native modules for Android to launch third-party apps
- **Deep Linking**: Integration with native payment apps via URI schemes

## Features

- **User Authentication**: Register, login, and account management
- **Income Tracking**: Record and categorize income sources
- **Expense Management**: Track expenses by categories
- **Financial Statistics**: Visualize spending patterns and income sources
- **Budget Analysis**: Analyze spending against budget goals
- **Multi-Currency Support**: Support for USD, EUR, GBP, JPY, CNY currencies
- **Transaction Import**: Import transactions from payment apps (Alipay and WeChat)
- **Native App Integration**: Launch Alipay and WeChat directly from the app (Android)

## Installation and Setup

### Prerequisites
- Node.js (v14+)
- npm or yarn
- MySQL database
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up the database:
   ```bash
   cd database
   run_init.bat
   ```

4. Configure environment variables:
   Create a `.env` file in the `backend` directory with the following content:
   ```
   DB_HOST=127.0.0.1
   DB_USER=your_username
   DB_PASSWORD=your_password
   DB_DATABASE=jceco_db
   JWT_SECRET=your_jwt_secret
   PORT=5000
   ```

5. Start the server:
   ```bash
   node server.js
   ```

### Frontend Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start Metro server:
   ```bash
   npx react-native start
   ```

3. Launch the application:
   ```bash
   # For Android
   npx react-native run-android

   # For iOS
   npx react-native run-ios
   ```

## Native Payment App Integration

### Android
The app includes native modules to interact with Alipay and WeChat on Android devices:

- **AppLauncherModule**: Custom native module to launch payment apps
- **Deep Link Handling**: Custom URI scheme support (`jceco://`) for app-to-app communication
- **Multiple Launch Methods**: Fallback mechanisms to ensure compatibility across different device configurations

### Usage

The payment app integration allows users to:

1. Import transaction data from Alipay and WeChat
2. Automatically categorize imported transactions
3. Track spending across different payment platforms
4. Maintain a unified view of finances across multiple payment methods

## API Documentation

### Authentication

#### Register
- **URL**: `/api/users/register`
- **Method**: `POST`
- **Body**:
  ```json
  {
    "username": "string",
    "email": "string",
    "password": "string"
  }
  ```

#### Login
- **URL**: `/api/users/login`
- **Method**: `POST`
- **Body**:
  ```json
  {
    "email": "string",
    "password": "string"
  }
  ```

### Income Management

#### Add Income
- **URL**: `/api/income`
- **Method**: `POST`
- **Auth**: JWT Token Required
- **Body**:
  ```json
  {
    "amount": "number",
    "category": "string",
    "date": "YYYY-MM-DD",
    "description": "string"
  }
  ```

#### Get Income Records
- **URL**: `/api/income`
- **Method**: `GET`
- **Auth**: JWT Token Required

### Expense Management

#### Add Expense
- **URL**: `/api/expenses`
- **Method**: `POST`
- **Auth**: JWT Token Required
- **Body**:
  ```json
  {
    "amount": "number",
    "category": "string",
    "date": "YYYY-MM-DD",
    "description": "string"
  }
  ```

#### Get Expense Records
- **URL**: `/api/expenses`
- **Method**: `GET`
- **Auth**: JWT Token Required

### Transaction Import

#### Import Transactions
- **URL**: `/api/import`
- **Method**: `POST`
- **Auth**: JWT Token Required
- **Body**:
  ```json
  {
    "transactions": [
      {
        "id": "string",
        "date": "YYYY-MM-DD",
        "amount": "number",
        "description": "string",
        "category": "string",
        "type": "income|expense",
        "source": "alipay|wechat"
      }
    ]
  }
  ```

## Development

### Running Tests
```bash
npm test
```

### Debugging
For debugging the React Native application:
1. In Android Studio: Use the built-in debugger
2. In Chrome: Use the React Native Debugger extension
3. For native module debugging: Check Logcat in Android Studio with filter tag "AppLauncherModule"

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- React Native community
- Express.js community
- All contributors who have helped to improve this project
