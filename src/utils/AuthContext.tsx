import React, { createContext, useState, useEffect, useContext } from 'react';
// 暂时注释掉 AsyncStorage
// import AsyncStorage from '@react-native-async-storage/async-storage';
import { userAPI } from './api';

// 定义用户类型
interface User {
  id: number;
  username: string;
  email: string;
}

// 定义认证上下文类型
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isLoggedIn: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

// 创建认证上下文
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 内存中存储令牌
let memoryToken: string | null = null;

// 认证提供者组件
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // 检查用户是否已登录
  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        // 使用内存中的令牌代替 AsyncStorage
        const token = memoryToken;
        if (token) {
          // 获取用户信息
          const userData = await userAPI.getProfile();
          setUser(userData);
          setIsLoggedIn(true);
        }
      } catch (error) {
        console.error('检查登录状态失败:', error);
        // 如果获取用户信息失败，清除令牌
        memoryToken = null;
      } finally {
        setIsLoading(false);
      }
    };

    checkLoginStatus();
  }, []);

  // 登录函数
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await userAPI.login({ email, password });
      if (response.token) {
        // 保存令牌到内存
        memoryToken = response.token;
        const userData = await userAPI.getProfile();
        setUser(userData);
        setIsLoggedIn(true);
      }
    } catch (error) {
      console.error('登录失败:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // 注册函数
  const register = async (username: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      await userAPI.register({ username, email, password });
      // 注册成功后自动登录
      await login(email, password);
    } catch (error) {
      console.error('注册失败:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // 登出函数
  const logout = async () => {
    setIsLoading(true);
    try {
      // 清除内存中的令牌
      memoryToken = null;
      setUser(null);
      setIsLoggedIn(false);
    } catch (error) {
      console.error('登出失败:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isLoggedIn,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// 自定义钩子，用于访问认证上下文
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth必须在AuthProvider内部使用');
  }
  return context;
}; 