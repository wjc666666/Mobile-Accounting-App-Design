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
      console.log('Checking if Alipay is installed');
      // 尝试多种可能的scheme格式
      const schemes = ['alipays://', 'alipay://'];
      
      for (const scheme of schemes) {
        console.log(`Checking scheme: ${scheme}`);
        try {
          const canOpen = await Linking.canOpenURL(scheme);
          console.log(`${scheme} can be opened:`, canOpen);
          if (canOpen) return true;
        } catch (e) {
          console.error(`Error checking ${scheme}:`, e);
        }
      }
      
      return false;
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
      console.log('Checking if WeChat is installed');
      // 尝试多种可能的scheme格式
      const schemes = ['weixin://', 'wechat://'];
      
      for (const scheme of schemes) {
        console.log(`Checking scheme: ${scheme}`);
        try {
          const canOpen = await Linking.canOpenURL(scheme);
          console.log(`${scheme} can be opened:`, canOpen);
          if (canOpen) return true;
        } catch (e) {
          console.error(`Error checking ${scheme}:`, e);
        }
      }
      
      return false;
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
      // 尝试多种可能的URI格式
      const uris = [
        // Standard URI schemes
        'alipays://platformapi/startapp?appId=20000003',
        'alipay://platformapi/startapp?appId=20000003',
        
        // Basic schemes
        'alipays://',
        'alipay://',
        
        // Android Intent URIs (more explicit for Android)
        'intent://platformapi/startapp?appId=20000003#Intent;scheme=alipay;package=com.eg.android.AlipayGphone;end',
        'intent:#Intent;scheme=alipay;package=com.eg.android.AlipayGphone;end',
        
        // Hong Kong variant
        'intent:#Intent;scheme=alipay;package=hk.alipay.wallet;end'
      ];
      
      console.log('Device is attempting to open Alipay');
      console.log('Available URIs to try:', uris);
      
      // Skip the canOpenURL check which seems to be failing
      // and directly try to open each URI
      for (const uri of uris) {
        console.log(`Directly trying to open Alipay with URI: ${uri}`);
        try {
          await Linking.openURL(uri);
          console.log(`Call to openURL with ${uri} did not throw an error`);
          // Wait a bit to see if the app opens
          await new Promise(resolve => setTimeout(resolve, 500));
          return true;
        } catch (e) {
          console.error(`Error with ${uri}:`, e);
          if (e instanceof Error) {
            console.error(`Error name: ${e.name}, message: ${e.message}`);
          }
        }
      }
      
      console.error('All URI attempts failed');
      return false;
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
      // 尝试多种可能的URI格式
      const uris = [
        // Standard URI schemes
        'weixin://dl/business/?t=money/index',
        
        // Basic schemes
        'weixin://',
        'wechat://',
        
        // Android Intent URIs (more explicit for Android)
        'intent://dl/business/?t=money/index#Intent;scheme=weixin;package=com.tencent.mm;end',
        'intent:#Intent;scheme=weixin;package=com.tencent.mm;end'
      ];
      
      console.log('Device is attempting to open WeChat');
      console.log('Available URIs to try:', uris);
      
      // Skip the canOpenURL check which seems to be failing
      // and directly try to open each URI
      for (const uri of uris) {
        console.log(`Directly trying to open WeChat with URI: ${uri}`);
        try {
          await Linking.openURL(uri);
          console.log(`Call to openURL with ${uri} did not throw an error`);
          // Wait a bit to see if the app opens
          await new Promise(resolve => setTimeout(resolve, 500));
          return true;
        } catch (e) {
          console.error(`Error with ${uri}:`, e);
          if (e instanceof Error) {
            console.error(`Error name: ${e.name}, message: ${e.message}`);
          }
        }
      }
      
      console.error('All URI attempts failed');
      return false;
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
      category: 'gift',
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
      category: 'salary',
      type: 'income',
      source: 'wechat'
    }
  ];
}

export default paymentApis; 