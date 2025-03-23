import { Linking } from 'react-native';
import axios from 'axios';
import api from './api';

// API endpoints for our backend that will handle payment app integration
const IMPORT_API_ENDPOINT = '/api/import';

// Types for imported transaction data
export interface ImportedTransaction {
  id: string;
  date: string;
  amount: number;
  description: string;
  category: string;
  type: 'income' | 'expense';
  source: 'alipay' | 'wechat';
}

// Handle deep linking schemes
const ALIPAY_SCHEME = 'alipays://';
const WECHAT_SCHEME = 'weixin://';

// Mock API endpoints for testing (replace with real endpoints later)
const ALIPAY_BILLS_API = 'https://api.mock-alipay.com/v2/bills';
const WECHAT_BILLS_API = 'https://api.mock-wechat.com/v2/bills';

/**
 * Payment APIs for importing transactions from Alipay and WeChat
 */
const paymentApis = {
  /**
   * Check if Alipay is installed on the device
   */
  isAlipayInstalled: async (): Promise<boolean> => {
    try {
      const canOpen = await Linking.canOpenURL(ALIPAY_SCHEME);
      return canOpen;
    } catch (error) {
      console.error('Failed to check if Alipay is installed:', error);
      return false;
    }
  },

  /**
   * Check if WeChat is installed on the device
   */
  isWeChatInstalled: async (): Promise<boolean> => {
    try {
      const canOpen = await Linking.canOpenURL(WECHAT_SCHEME);
      return canOpen;
    } catch (error) {
      console.error('Failed to check if WeChat is installed:', error);
      return false;
    }
  },

  /**
   * Open Alipay for bill export authorization
   * This uses actual Alipay URI schemes
   */
  openAlipayForAuth: async (): Promise<boolean> => {
    try {
      // 打开支付宝账单页面
      // 实际的支付宝账单页面URI scheme
      const billUrl = `${ALIPAY_SCHEME}platformapi/startapp?appId=20000003`;
      
      // 打开支付宝到账单页面
      await Linking.openURL(billUrl);
      return true;
    } catch (error) {
      console.error('Failed to open Alipay:', error);
      return false;
    }
  },

  /**
   * Open WeChat for bill export authorization
   * This uses actual WeChat URI schemes
   */
  openWeChatForAuth: async (): Promise<boolean> => {
    try {
      // 打开微信到账单页面
      // 实际的微信账单页面URI scheme
      const billUrl = `${WECHAT_SCHEME}dl/business/?t=money/index`;
      
      // 打开微信到账单页面
      await Linking.openURL(billUrl);
      return true;
    } catch (error) {
      console.error('Failed to open WeChat:', error);
      return false;
    }
  },

  /**
   * Import bills from Alipay 
   * In a real app, this would follow OAuth authorization
   */
  importAlipayBills: async (startDate: string, endDate: string): Promise<ImportedTransaction[]> => {
    try {
      // This is a mock implementation
      // In a production app, you would:
      // 1. Exchange the authorization code for an access token
      // 2. Use the access token to fetch the bill data from Alipay's API
      
      // Mock API call to simulate getting bills from Alipay
      const mockResponse = await axios.get(`${ALIPAY_BILLS_API}?startDate=${startDate}&endDate=${endDate}`);
      
      // Process the bill data into our app's format
      // This is a mock transformer, actual data format from Alipay would be different
      const transactions: ImportedTransaction[] = mockResponse.data.map((bill: any) => ({
        id: bill.tradeNo,
        date: bill.gmtCreate,
        amount: bill.amount,
        description: bill.subject,
        category: mapAlipayCategory(bill.category),
        type: bill.direction === 'in' ? 'income' : 'expense',
        source: 'alipay'
      }));
      
      return transactions;
    } catch (error) {
      console.error('Failed to import Alipay bills:', error);
      
      // Return mock data for testing or if the real API fails
      return getMockAlipayBills(startDate, endDate);
    }
  },

  /**
   * Import bills from WeChat
   */
  importWeChatBills: async (startDate: string, endDate: string): Promise<ImportedTransaction[]> => {
    try {
      // Mock API call to simulate getting bills from WeChat
      const mockResponse = await axios.get(`${WECHAT_BILLS_API}?startDate=${startDate}&endDate=${endDate}`);
      
      // Process the bill data into our app's format
      const transactions: ImportedTransaction[] = mockResponse.data.map((bill: any) => ({
        id: bill.transactionId,
        date: bill.time,
        amount: bill.fee,
        description: bill.description,
        category: mapWeChatCategory(bill.type),
        type: bill.income ? 'income' : 'expense',
        source: 'wechat'
      }));
      
      return transactions;
    } catch (error) {
      console.error('Failed to import WeChat bills:', error);
      
      // Return mock data for testing or if the real API fails
      return getMockWeChatBills(startDate, endDate);
    }
  },

  /**
   * Save imported transactions to our backend
   */
  saveImportedTransactions: async (transactions: ImportedTransaction[]): Promise<{
    success: boolean;
    message: string;
    summary?: {
      income: number;
      incomeTotal: number;
      expense: number;
      expenseTotal: number;
    }
  }> => {
    try {
      // Send the transactions to our backend
      const response = await api.post(IMPORT_API_ENDPOINT, { transactions });
      return response.data;
    } catch (error) {
      console.error('Failed to save imported transactions:', error);
      throw error;
    }
  }
};

/**
 * Map Alipay categories to our app's categories
 */
function mapAlipayCategory(alipayCategory: string): string {
  // This would be a comprehensive mapping in a real app
  const categoryMap: {[key: string]: string} = {
    'Shopping': 'Shopping',
    'Food': 'Food',
    'Transport': 'Transportation',
    'Entertainment': 'Entertainment',
    // Add more mappings as needed
  };
  
  return categoryMap[alipayCategory] || 'Other';
}

/**
 * Map WeChat categories to our app's categories
 */
function mapWeChatCategory(wechatType: string): string {
  // This would be a comprehensive mapping in a real app
  const categoryMap: {[key: string]: string} = {
    'SHOPPING': 'Shopping',
    'RESTAURANT': 'Food',
    'TRANSPORT': 'Transportation',
    'ENTERTAINMENT': 'Entertainment',
    // Add more mappings as needed
  };
  
  return categoryMap[wechatType] || 'Other';
}

/**
 * Get mock Alipay bills for testing
 */
function getMockAlipayBills(_startDate: string, _endDate: string): ImportedTransaction[] {
  return [
    {
      id: 'alipay123456',
      date: '2025-03-20',
      amount: 25.8,
      description: '超市购物',
      category: 'Shopping',
      type: 'expense',
      source: 'alipay'
    },
    {
      id: 'alipay123457',
      date: '2025-03-18',
      amount: 35.5,
      description: '午餐',
      category: 'Food',
      type: 'expense',
      source: 'alipay'
    },
    {
      id: 'alipay123458',
      date: '2025-03-15',
      amount: 99.0,
      description: '电影票',
      category: 'Entertainment',
      type: 'expense',
      source: 'alipay'
    },
    {
      id: 'alipay123459',
      date: '2025-03-10',
      amount: 1000.0,
      description: '微信红包',
      category: 'Income',
      type: 'income',
      source: 'alipay'
    }
  ];
}

/**
 * Get mock WeChat bills for testing
 */
function getMockWeChatBills(_startDate: string, _endDate: string): ImportedTransaction[] {
  return [
    {
      id: 'wechat123456',
      date: '2025-03-19',
      amount: 30.0,
      description: '网上购物',
      category: 'Shopping',
      type: 'expense',
      source: 'wechat'
    },
    {
      id: 'wechat123457',
      date: '2025-03-17',
      amount: 45.5,
      description: '晚餐',
      category: 'Food',
      type: 'expense',
      source: 'wechat'
    },
    {
      id: 'wechat123458',
      date: '2025-03-14',
      amount: 15.0,
      description: '公交',
      category: 'Transportation',
      type: 'expense',
      source: 'wechat'
    },
    {
      id: 'wechat123459',
      date: '2025-03-05',
      amount: 500.0,
      description: '工资',
      category: 'Income',
      type: 'income',
      source: 'wechat'
    }
  ];
}

export default paymentApis; 