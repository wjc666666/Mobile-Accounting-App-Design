import React, { createContext, useState, useEffect, useContext } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 定义主题类型
export type ThemeType = 'light' | 'dark';

// 定义主题上下文类型
interface ThemeContextType {
  theme: ThemeType;
  isDarkMode: boolean;
  toggleTheme: () => void;
  setTheme: (theme: ThemeType) => void;
}

// 创建主题上下文
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// 存储键
const THEME_STORAGE_KEY = '@jceco_theme';

// 主题提供者组件
export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const deviceTheme = useColorScheme();
  const [theme, setThemeState] = useState<ThemeType>('light');

  // 在组件挂载时从 AsyncStorage 加载主题设置
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (savedTheme) {
          setThemeState(savedTheme as ThemeType);
        } else if (deviceTheme) {
          // 如果没有保存的主题，使用设备默认主题
          setThemeState(deviceTheme as ThemeType);
        }
      } catch (error) {
        console.error('Failed to load theme:', error);
      }
    };

    loadTheme();
  }, [deviceTheme]);

  // 设置主题函数
  const setTheme = async (newTheme: ThemeType) => {
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, newTheme);
      setThemeState(newTheme);
    } catch (error) {
      console.error('Failed to save theme:', error);
    }
  };

  // 切换主题函数
  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
  };

  // 是否为暗黑模式
  const isDarkMode = theme === 'dark';

  return (
    <ThemeContext.Provider
      value={{
        theme,
        isDarkMode,
        toggleTheme,
        setTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

// 自定义钩子，用于访问主题上下文
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme必须在ThemeProvider内部使用');
  }
  return context;
};

// 定义浅色主题颜色
export const lightTheme = {
  background: '#f5f5f5',
  card: '#ffffff',
  text: '#333333',
  primaryText: '#000000',
  secondaryText: '#666666',
  border: '#e0e0e0',
  primary: '#3498db',
  secondary: '#2ecc71',
  danger: '#e74c3c',
  warning: '#f1c40f',
  success: '#2ecc71',
  info: '#3498db',
  header: '#3498db',
  tabBar: '#ffffff',
  inactive: '#858585',
};

// 定义深色主题颜色
export const darkTheme = {
  background: '#121212',
  card: '#1e1e1e',
  text: '#e0e0e0',
  primaryText: '#ffffff',
  secondaryText: '#aaaaaa',
  border: '#333333',
  primary: '#2980b9',
  secondary: '#27ae60',
  danger: '#c0392b',
  warning: '#f39c12',
  success: '#27ae60',
  info: '#2980b9',
  header: '#1e272e',
  tabBar: '#1e1e1e',
  inactive: '#666666',
};

// 获取当前主题颜色
export const getThemeColors = (isDark: boolean) => {
  return isDark ? darkTheme : lightTheme;
}; 