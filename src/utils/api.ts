import axios from 'axios';
// 暂时注释掉 AsyncStorage
// import AsyncStorage from '@react-native-async-storage/async-storage';

// 内存中存储令牌
let memoryToken: string | null = null;

// 后端API基础URL
// 在Android模拟器中访问本地主机需要使用10.0.2.2
// 在真机上测试时需要使用实际的IP地址
const API_BASE_URL = 'http://10.0.2.2:5000';
console.log('API基础URL:', API_BASE_URL);

// 创建axios实例
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // 添加超时设置
  timeout: 10000,
});

// 添加请求拦截器，用于调试
api.interceptors.request.use(
  (config) => {
    console.log('发送请求:', config.method, config.url, config.data);
    return config;
  },
  (error) => {
    console.error('请求错误:', error);
    return Promise.reject(error);
  }
);

// 添加响应拦截器，用于调试
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.config.url, response.status);
    return response;
  },
  (error) => {
    if (error.response) {
      // 服务器响应了，但状态码不在2xx范围内
      console.error('API Error:', error.config?.url, error.response.status, error.response.data);
    } else if (error.request) {
      // 请求已发送，但没有收到响应
      console.error('API No Response:', error.config?.url, error.request);
    } else {
      // 设置请求时发生了错误
      console.error('API Request Error:', error.message);
    }
    return Promise.reject(error);
  }
);

// 请求拦截器 - 添加认证令牌
api.interceptors.request.use(
  async (config) => {
    // 使用内存中的令牌代替 AsyncStorage
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

// 用户API
export const userAPI = {
  // 用户注册
  register: async (userData: { username: string; email: string; password: string }) => {
    try {
      const response = await api.post('/users/register', userData);
      return response.data;
    } catch (error) {
      console.error('注册失败:', error);
      throw error;
    }
  },

  // 用户登录
  login: async (credentials: { email: string; password: string }) => {
    try {
      const response = await api.post('/users/login', credentials);
      // 保存令牌到内存
      if (response.data.token) {
        memoryToken = response.data.token;
      }
      return response.data;
    } catch (error) {
      console.error('登录失败:', error);
      throw error;
    }
  },

  // 获取用户信息
  getProfile: async () => {
    try {
      const response = await api.get('/users/profile');
      return response.data;
    } catch (error) {
      console.error('获取用户信息失败:', error);
      throw error;
    }
  },

  // 登出
  logout: async () => {
    try {
      // 清除内存中的令牌
      memoryToken = null;
      return { success: true };
    } catch (error) {
      console.error('登出失败:', error);
      throw error;
    }
  },
};

// 收入API
export const incomeAPI = {
  // 添加收入记录
  addIncome: async (incomeData: { 
    amount: number; 
    category: string; 
    date: string; 
    description: string;
  }) => {
    try {
      // 发送所有字段，包括description
      const response = await api.post('/income', incomeData);
      return response.data;
    } catch (error) {
      console.error('添加收入记录失败:', error);
      throw error;
    }
  },

  // 获取收入记录
  getIncomes: async () => {
    try {
      const response = await api.get('/income');
      return response.data;
    } catch (error) {
      console.error('获取收入记录失败:', error);
      throw error;
    }
  },
};

// 支出API
export const expenseAPI = {
  // 添加支出记录
  addExpense: async (expenseData: { 
    amount: number; 
    category: string; 
    date: string; 
    description: string;
  }) => {
    try {
      // 发送所有字段，包括description
      const response = await api.post('/expenses', expenseData);
      return response.data;
    } catch (error) {
      console.error('添加支出记录失败:', error);
      throw error;
    }
  },

  // 获取支出记录
  getExpenses: async () => {
    try {
      const response = await api.get('/expenses');
      return response.data;
    } catch (error) {
      console.error('获取支出记录失败:', error);
      throw error;
    }
  },
};

// 预算分析API
export const budgetAPI = {
  // 获取预算分析
  getBudgetAnalysis: async () => {
    try {
      const response = await api.get('/budget/analysis');
      return response.data;
    } catch (error) {
      console.error('获取预算分析失败:', error);
      throw error;
    }
  },
};

export default api; 