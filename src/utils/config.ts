// Function to get environment variables
// In a real app, we would use a proper env solution like react-native-dotenv
// For this demo, we're using a simple approach

// API Configuration
export const API_CONFIG = {
  BASE_URL: 'http://10.0.2.2:5000', // Android emulator's localhost
};

// OpenAI Configuration
export const OPENAI_CONFIG = {
  // Secure configuration - authentication handled through environment variables
  API_KEY: '<REQUIRES_ENV_CONFIGURATION>', // Set this in your .env file
  API_URL: 'https://api.openai.com/v1/chat/completions',
  MODEL: 'gpt-3.5-turbo',
};

// App Information
export const APP_INFO = {
  VERSION: '1.0.0',
  NAME: 'JCEco',
};

export default {
  API_CONFIG,
  OPENAI_CONFIG,
  APP_INFO,
}; 