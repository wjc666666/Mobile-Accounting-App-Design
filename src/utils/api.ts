import axios from 'axios';
// Temporarily comment out AsyncStorage
// import AsyncStorage from '@react-native-async-storage/async-storage';
import { OPENAI_API_KEY } from '@env';

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

// OpenAI API URL
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

// Financial AI API
export const financialAIAPI = {
  // 分析财务数据
  analyzeFinances: async (financialData: string, question: string) => {
    try {
      console.log('Starting financial analysis...');
      
      // Always use mock response for now - safer implementation
      const useMockResponse = true;
      console.log('Using mock response - default fallback');
      
      if (useMockResponse) {
        // Generate a mocked response based on the question
        let mockedResponse = '';
        
        if (question.toLowerCase().includes('saving rate')) {
          mockedResponse = `Based on your financial data, your current saving rate is ${Math.floor(Math.random() * 15) + 5}%, which is ${Math.random() > 0.5 ? 'below' : 'close to'} the recommended 20% saving rate for financial stability.
          
To improve your saving rate, consider:
1. Creating a detailed budget to track all expenses
2. Automating transfers to a savings account
3. Reducing discretionary spending on non-essential items
4. Looking for opportunities to increase your income
5. Reviewing and negotiating fixed expenses like insurance and subscriptions`;
        } else if (question.toLowerCase().includes('income') && question.toLowerCase().includes('expense')) {
          mockedResponse = `Analyzing your income and expenses:

Your total income appears to be sufficient to cover your basic expenses, but there's room for optimization. Your highest expense category is taking up a significant portion of your budget.

Recommendations:
1. Review your highest expense category to identify potential areas for reduction
2. Consider building an emergency fund of 3-6 months of expenses
3. Allocate at least 20% of income to savings and investments
4. Track daily expenses for 30 days to identify spending patterns
5. Consider the 50/30/20 rule: 50% for needs, 30% for wants, and 20% for savings`;
        } else if (question.toLowerCase().includes('spending') || question.toLowerCase().includes('expenses')) {
          mockedResponse = `Your spending patterns show potential areas for optimization:

1. Look at recurring subscriptions and services - are you using all of them?
2. Meal planning and cooking at home can significantly reduce food expenses
3. Consider energy efficiency improvements to reduce utility costs
4. Shop around for better insurance rates annually
5. Use cash-back or rewards credit cards for regular purchases (but pay them off monthly)
6. Implement a 24-hour rule for non-essential purchases to avoid impulse buying`;
        } else if (question.toLowerCase().includes('income') && question.toLowerCase().includes('diversif')) {
          mockedResponse = `Regarding income diversification:

Your current income sources appear somewhat limited. Diversifying income streams is important for financial resilience.

Consider these options:
1. Develop skills for freelance or consulting work in your field
2. Explore passive income opportunities like investments or rental property
3. Create digital products related to your expertise
4. Start a small side business based on your skills or interests
5. Invest in dividend-paying stocks or REITs for income
6. Look for opportunities to increase value at your current job to negotiate raises`;
        } else {
          mockedResponse = `Based on your financial summary, here are some general insights:

1. Your current balance shows you're managing to keep expenses below income, which is positive
2. Consider building or strengthening your emergency fund to cover 3-6 months of expenses
3. Review your highest expense category to identify potential savings
4. Set specific, measurable financial goals for the short, medium, and long term
5. Consider consulting with a financial advisor for personalized investment strategies
6. Regularly review your financial progress and adjust your plan as needed`;
        }
        
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        return mockedResponse;
      }
      
      // Real API call if API key is available
      console.log('Using OpenAI API for analysis');
      
      // 构建发送给OpenAI的消息
      const messages = [
        {
          role: "system",
          content: "You are a professional financial analyst and advisor specializing in personal finance. Your responses should be based on the user's financial data, providing insightful analysis and practical advice."
        },
        {
          role: "user",
          content: `Here is my financial data:\n${financialData}\n\nMy question is: ${question}`
        }
      ];

      // 调用OpenAI API
      const response = await fetch(OPENAI_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo", // Using a more widely available model
          messages: messages,
          max_tokens: 1000,
          temperature: 0.7
        })
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('OpenAI API error details:', errorData);
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error('Failed to analyze finances:', error);
      throw error;
    }
  },
};

export default api; 