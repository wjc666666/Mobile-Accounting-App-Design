import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 支持的货币类型
export type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'JPY' | 'CNY';

// 货币上下文类型
interface CurrencyContextType {
  currency: CurrencyCode;
  setCurrency: (currency: CurrencyCode) => Promise<void>;
  formatAmount: (amount: number | undefined | null) => string;
  convertAmount: (amount: number, fromCurrency: CurrencyCode, toCurrency: CurrencyCode) => number;
  getCurrencySymbol: (currencyCode: CurrencyCode) => string;
}

// 创建上下文
const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

// 汇率表（相对于USD）
const exchangeRates: Record<CurrencyCode, number> = {
  USD: 1,
  EUR: 0.93,
  GBP: 0.80,
  JPY: 155.67,
  CNY: 7.24,
};

// 货币符号
const currencySymbols: Record<CurrencyCode, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
  CNY: '¥',
};

// 从AsyncStorage获取保存的货币或使用默认货币
const loadStoredCurrency = async (): Promise<CurrencyCode> => {
  try {
    const storedCurrency = await AsyncStorage.getItem('@currency');
    return (storedCurrency as CurrencyCode) || 'USD';
  } catch (error) {
    console.error('Failed to load currency preference', error);
    return 'USD';
  }
};

// CurrencyProvider组件
export const CurrencyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currency, setCurrencyState] = useState<CurrencyCode>('USD');
  const [isLoading, setIsLoading] = useState(true);

  // 初始化时加载保存的货币
  useEffect(() => {
    loadStoredCurrency().then((curr) => {
      setCurrencyState(curr);
      setIsLoading(false);
    });
  }, []);

  // 设置新货币并保存到AsyncStorage
  const setCurrency = async (newCurrency: CurrencyCode) => {
    try {
      await AsyncStorage.setItem('@currency', newCurrency);
      setCurrencyState(newCurrency);
    } catch (error) {
      console.error('Failed to save currency preference', error);
    }
  };

  // 格式化金额
  const formatAmount = (amount: number | undefined | null): string => {
    // 处理无效值
    if (amount === undefined || amount === null || isNaN(amount)) {
      return `${currencySymbols[currency]}0.00`;
    }
    
    try {
      // 先将金额根据当前货币的汇率进行转换（假设后端存储的是USD）
      const convertedAmount = convertAmount(amount, 'USD', currency);
      
      // 根据货币格式化数字
      if (currency === 'JPY' || currency === 'CNY') {
        // 日元和人民币通常不显示小数
        return `${currencySymbols[currency]}${Math.round(convertedAmount).toLocaleString()}`;
      } else {
        return `${currencySymbols[currency]}${convertedAmount.toFixed(2)}`;
      }
    } catch (error) {
      console.error('Format amount error:', error, 'Amount value:', amount);
      return `${currencySymbols[currency]}0.00`;
    }
  };

  // 货币转换
  const convertAmount = (amount: number, fromCurrency: CurrencyCode, toCurrency: CurrencyCode): number => {
    if (fromCurrency === toCurrency) return amount;
    
    // 确保金额是有效数字
    if (amount === undefined || amount === null || isNaN(amount)) {
      return 0;
    }

    // 先转换为USD，再转换为目标货币
    const amountInUSD = amount / exchangeRates[fromCurrency];
    const convertedAmount = amountInUSD * exchangeRates[toCurrency];
    
    // 四舍五入到两位小数，避免浮点数计算误差
    return Math.round(convertedAmount * 100) / 100;
  };

  // 获取货币符号
  const getCurrencySymbol = (currencyCode: CurrencyCode): string => {
    return currencySymbols[currencyCode] || '$';
  };

  const contextValue = {
    currency,
    setCurrency,
    formatAmount,
    convertAmount,
    getCurrencySymbol,
  };

  if (isLoading) {
    // 返回加载状态组件或占位符
    return null;
  }

  return (
    <CurrencyContext.Provider value={contextValue}>
      {children}
    </CurrencyContext.Provider>
  );
};

// 自定义Hook
export const useCurrency = (): CurrencyContextType => {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};

export default CurrencyContext; 