# JCEco - Mobile Accounting Application

A comprehensive mobile accounting application that helps you track income, expenses and manage your financial goals, built with React Native and Node.js.

## Project Overview

JCEco is a full-stack mobile application designed to provide users with a seamless financial tracking experience. The app allows users to record their income and expenses, view financial statistics, and analyze their spending habits. It also integrates with popular payment apps like Alipay and WeChat to import transaction data and provides AI-powered financial advice.

## Project Structure

```
JCEco/
├── android/                # Android native code
│   ├── app/                # Android app configuration and native modules
│   │   ├── src/            # Java source code
│   │   │   └── main/
│   │   │       ├── java/
│   │   │       │   └── com/
│   │   │       │       └── jceco/
│   │   │       │           ├── MainApplication.kt
│   │   │       │           └── MainActivity.kt
│   │   │       └── res/    # Android resources
│   │   └── build.gradle    # App-level build configuration
│   └── build.gradle        # Project-level build configuration
├── ios/                    # iOS native code
│   ├── JCEco/              # iOS app files
│   └── Podfile             # iOS dependencies
├── src/                    # React Native frontend source code
│   ├── components/         # Reusable UI components
│   │   ├── BudgetCard.tsx
│   │   ├── CategorySelector.tsx
│   │   └── TransactionList.tsx
│   ├── navigation/         # Navigation configuration
│   │   └── AppNavigator.tsx # Main navigation setup
│   ├── screens/            # Application screens
│   │   ├── AuthScreens/
│   │   │   ├── LoginScreen.tsx
│   │   │   └── RegisterScreen.tsx
│   │   ├── HomeScreen.tsx  # Main dashboard
│   │   ├── IncomeScreen.tsx # Income tracking
│   │   ├── ExpenseScreen.tsx # Expense tracking
│   │   ├── StatisticsScreen.tsx # Financial statistics
│   │   ├── SettingsScreen.tsx # App settings
│   │   └── FinanceAIScreen.tsx # AI Financial Advisor
│   └── utils/              # Utility functions and contexts
│       ├── api.ts          # API client and endpoints
│       ├── AuthContext.tsx # Authentication provider
│       ├── CurrencyContext.tsx # Currency conversion
│       ├── ThemeContext.tsx # Theme provider for dark/light mode
│       ├── LocalizationContext.tsx # Multilanguage support
│       ├── config.ts       # Application configuration
│       └── env.d.ts        # TypeScript definitions for env variables
├── backend/                # Node.js backend
│   ├── controllers/        # Route controllers
│   │   ├── authController.js
│   │   ├── incomeController.js
│   │   ├── expenseController.js
│   │   └── budgetController.js
│   ├── middleware/         # Express middleware
│   │   ├── auth.js         # Authentication middleware
│   │   └── validation.js   # Input validation
│   ├── routes/             # API routes
│   │   ├── auth.js
│   │   ├── income.js
│   │   ├── expense.js
│   │   └── budget.js
│   ├── database/           # Database related files
│   │   ├── alter_tables.sql # SQL for altering tables
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
├── .env                    # Frontend environment variables (not in Git)
├── App.tsx                 # Application entry point
├── babel.config.js         # Babel configuration with env support
├── index.js                # React Native entry point
├── metro.config.js         # Metro bundler configuration
├── tsconfig.json           # TypeScript configuration
├── package.json            # Project dependencies
└── __tests__/              # Test files
    └── App.test.tsx        # Application tests
```

## Tech Stack

### Frontend
- **React Native**: Cross-platform mobile application framework
- **React Navigation 6**: Navigation library for React Native
- **Axios**: HTTP client for API requests
- **AsyncStorage**: Local storage for persisting data
- **React Native Paper**: Material Design component library
- **OpenAI API**: For AI-powered financial advice

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
- **Multi-Language Support**: English, Chinese, and Spanish language options
- **Transaction Import**: Import transactions from payment apps (Alipay and WeChat)
- **Native App Integration**: Launch Alipay and WeChat directly from the app (Android)
- **AI Financial Analysis**: Get personalized financial insights and advice using AI technology
- **Dark Mode Support**: Customize the app appearance with light and dark themes
- **Transaction History**: View and filter recent transactions
- **Real-time Currency Conversion**: Convert amounts between different currencies

## Recent Updates

### Dark Mode Implementation
- Added comprehensive theme system with light and dark modes
- Created ThemeContext for managing theme state throughout the app
- Implemented theme-aware styling for all screens and components
- Added toggle in Settings screen for user preference
- Made theme selection persistent across app restarts

### AI Financial Advisor
- Integrated OpenAI API for financial analysis and advice
- Created dedicated FinanceAIScreen for AI interaction
- Implemented secure API key management through environment variables
- Added ability to analyze spending patterns and provide personalized recommendations
- Included preset financial questions for easier user interaction

### Multilanguage Support
- Added support for English, Chinese, and Spanish languages
- Created LocalizationContext for managing translations
- Made all UI text configurable through translation system
- Added language selection in Settings screen
- Implemented persistent language preference

### Bug Fixes
- Resolved duplicate key issue in LocalizationContext
- Fixed transaction list rendering with unique keys
- Improved budget calculation accuracy
- Enhanced error handling for API requests
- Fixed currency conversion issues in transaction displays

### Performance Improvements
- Optimized rendering of transaction lists
- Improved loading states for better user experience
- Enhanced budget analysis card performance
- Reduced unnecessary API calls

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

2. Configure environment variables:
   Create a `.env` file in the root directory with the following content:
   ```
   # OpenAI API Key (required for AI Financial Analysis feature)
   OPENAI_API_KEY=your_openai_api_key
   ```

3. Install react-native-dotenv for environment variable support:
   ```bash
   npm install react-native-dotenv --save-dev
   ```

4. Start Metro server:
   ```bash
   npx react-native start
   ```

5. Launch the application:
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

## AI Financial Advisor

The app includes an AI-powered financial analysis feature that provides personalized financial advice:

### Features

- **Financial Data Analysis**: AI analyzes your income, expenses, and saving patterns
- **Personalized Recommendations**: Get tailored advice based on your financial situation
- **Interactive Q&A**: Ask specific questions about your finances
- **Suggested Questions**: Pre-defined questions to help you get started
- **Intelligent Insights**: Identify spending patterns and potential savings opportunities
- **Real-time Summaries**: Automatically generates a financial summary with key metrics
- **Multi-language Support**: Financial advice available in English, Chinese, and Spanish
- **Dark Mode Compatibility**: Optimized UI for both light and dark themes
- **Budget Optimization Tips**: Recommendations for improving budget allocation
- **Context-Aware Advice**: AI considers your spending categories and habits
- **Investment Guidance**: Basic suggestions about investment opportunities

### Implementation

- Secure API integration with OpenAI for financial analysis
- Environment variables used for API key management (.env)
- Fallback to mock responses when API is unavailable
- Optimized prompts to generate relevant financial insights
- Efficient data processing for quick response times
- Comprehensive financial data aggregation
- User-friendly interface with suggested questions
- Adaptive themes for comfortable viewing in any lighting condition
- Privacy-focused approach: financial data stays on your device

## Dark Mode

The app includes a comprehensive theme system that supports both light and dark modes:

### Features

- **Theme Toggle**: Switch between light and dark themes in the Settings screen
- **System Integration**: Option to follow the system theme settings
- **Persistent Preference**: User theme preference is saved and persists across app restarts
- **Consistent Experience**: All screens and components maintain consistent styling in both modes
- **Enhanced Readability**: Optimized contrast and color palette for different lighting conditions

### Implementation

- Context API for managing theme state across the application
- Styled components with theme-aware properties
- Automatic theme switching based on device preferences
- Custom navigation themes for consistent navigation experience

## Multilanguage Support

The app supports multiple languages to cater to a global user base:

### Supported Languages
- English (Default)
- Chinese (Simplified)
- Spanish

### Features
- Language selection in Settings screen
- Real-time language switching without app restart
- Persistent language preference across sessions
- Comprehensive translations for all UI elements

### Implementation
- LocalizationContext for managing translations
- AsyncStorage for saving language preference
- Translation keys organized by feature area

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
- **Response**: JWT token and user information

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
- **Response**: JWT token and user information

#### Get User Profile
- **URL**: `/api/users/profile`
- **Method**: `GET`
- **Auth**: JWT Token Required
- **Response**: User profile information

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
- **Response**: Created income record

#### Get Income Records
- **URL**: `/api/income`
- **Method**: `GET`
- **Auth**: JWT Token Required
- **Response**: List of income records

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
- **Response**: Created expense record

#### Get Expense Records
- **URL**: `/api/expenses`
- **Method**: `GET`
- **Auth**: JWT Token Required
- **Response**: List of expense records

### Budget Analysis

#### Get Budget Analysis
- **URL**: `/api/budget/analysis`
- **Method**: `GET`
- **Auth**: JWT Token Required
- **Query Parameters**:
  - `period`: (optional) time period for analysis (default: current month)
- **Response**: Budget analysis with income, expenses, and category breakdown

### Finance AI Advisory

#### Analyze Finances
- **URL**: `/api/ai/analyze`
- **Method**: `POST`
- **Auth**: JWT Token Required
- **Body**:
  ```json
  {
    "financialSummary": "string",
    "question": "string"
  }
  ```
- **Response**: AI-generated financial advice based on user data and question

#### Get Suggested Questions
- **URL**: `/api/ai/questions`
- **Method**: `GET`
- **Auth**: JWT Token Required
- **Response**: List of suggested financial questions for AI analysis

### Settings Management

#### Update Language
- **URL**: `/api/settings/language`
- **Method**: `PUT`
- **Auth**: JWT Token Required
- **Body**:
  ```json
  {
    "language": "string" // 'en', 'zh', or 'es'
  }
  ```
- **Response**: Updated settings

#### Update Currency
- **URL**: `/api/settings/currency`
- **Method**: `PUT`
- **Auth**: JWT Token Required
- **Body**:
  ```json
  {
    "currency": "string" // 'USD', 'EUR', 'GBP', 'JPY', or 'CNY'
  }
  ```
- **Response**: Updated settings

#### Update Theme
- **URL**: `/api/settings/theme`
- **Method**: `PUT`
- **Auth**: JWT Token Required
- **Body**:
  ```json
  {
    "darkMode": "boolean"
  }
  ```
- **Response**: Updated settings

## Development Team

- Frontend Developers: Juncheng Wang
- Backend Developers: Juncheng Wang
- UI/UX Design: Juncheng Wang

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- React Native Community
- OpenAI for providing the AI capabilities
- All contributors and testers

## Future Roadmap

- **Budget Goal Setting**: Set and track financial goals
- **Expense Forecasting**: Predict future expenses based on spending patterns
- **Bill Reminders**: Set up notifications for upcoming bills
- **Advanced Reports**: More detailed financial reports and visualizations
- **Cloud Backup**: Secure cloud backup for financial data
- **Family Sharing**: Share financial information with family members
- **Receipt Scanning**: OCR integration for automated expense entry
