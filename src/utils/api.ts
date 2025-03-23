import axios from 'axios';
// Temporarily comment out AsyncStorage
// import AsyncStorage from '@react-native-async-storage/async-storage';

// Store token in memory
let memoryToken: string | null = null;

// Backend API base URL
// To access localhost from Android emulator, use 10.0.2.2
// For real device testing, use the actual IP address
const API_BASE_URL = 'http://10.0.2.2:5000';
console.log('API base URL:', API_BASE_URL);

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // Add timeout setting
  timeout: 10000,
});

// Add request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    console.log('Sending request:', config.method, config.url, config.data);
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.config.url, response.status);
    // Log detailed response data for debugging
    console.log('Response data type:', typeof response.data);
    console.log('Is response data array?', Array.isArray(response.data));
    if (Array.isArray(response.data) && response.data.length > 0) {
      console.log('First item in response:', JSON.stringify(response.data[0]));
      if (response.data[0].amount) {
        console.log('First item amount:', response.data[0].amount);
        console.log('First item amount type:', typeof response.data[0].amount);
      }
    }
    return response;
  },
  (error) => {
    if (error.response) {
      // Server responded with a status code outside of 2xx range
      console.error('API Error:', error.config?.url, error.response.status, error.response.data);
    } else if (error.request) {
      // Request was made but no response received
      console.error('API No Response:', error.config?.url, error.request);
    } else {
      // Error setting up the request
      console.error('API Request Error:', error.message);
    }
    return Promise.reject(error);
  }
);

// Request interceptor - add authentication token
api.interceptors.request.use(
  async (config) => {
    // Use token from memory instead of AsyncStorage
    const token = memoryToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// User API
export const userAPI = {
  // User registration
  register: async (userData: { username: string; email: string; password: string }) => {
    try {
      const response = await api.post('/users/register', userData);
      return response.data;
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  },

  // User login
  login: async (credentials: { email: string; password: string }) => {
    try {
      const response = await api.post('/users/login', credentials);
      // Save token to memory
      if (response.data.token) {
        memoryToken = response.data.token;
      }
      return response.data;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  },

  // Get user profile
  getProfile: async () => {
    try {
      const response = await api.get('/users/profile');
      return response.data;
    } catch (error) {
      console.error('Failed to get user profile:', error);
      throw error;
    }
  },

  // Logout
  logout: async () => {
    try {
      // Clear token from memory
      memoryToken = null;
      return { success: true };
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    }
  },
};

// Income API
export const incomeAPI = {
  // Add income record
  addIncome: async (incomeData: { 
    amount: number; 
    category: string; 
    date: string; 
    description: string;
  }) => {
    try {
      // Send all fields including description
      const response = await api.post('/income', incomeData);
      return response.data;
    } catch (error) {
      console.error('Failed to add income record:', error);
      throw error;
    }
  },

  // Get income records
  getIncomes: async () => {
    try {
      const response = await api.get('/income');
      return response.data;
    } catch (error) {
      console.error('Failed to get income records:', error);
      throw error;
    }
  },
};

// Expense API
export const expenseAPI = {
  // Add expense record
  addExpense: async (expenseData: { 
    amount: number; 
    category: string; 
    date: string; 
    description: string;
  }) => {
    try {
      // Send all fields including description
      const response = await api.post('/expenses', expenseData);
      return response.data;
    } catch (error) {
      console.error('Failed to add expense record:', error);
      throw error;
    }
  },

  // Get expense records
  getExpenses: async () => {
    try {
      const response = await api.get('/expenses');
      return response.data;
    } catch (error) {
      console.error('Failed to get expense records:', error);
      throw error;
    }
  },
};

// Budget analysis API
export const budgetAPI = {
  // Get budget analysis
  getBudgetAnalysis: async () => {
    try {
      const response = await api.get('/budget/analysis');
      return response.data;
    } catch (error) {
      console.error('Failed to get budget analysis:', error);
      throw error;
    }
  },
};

export default api; 