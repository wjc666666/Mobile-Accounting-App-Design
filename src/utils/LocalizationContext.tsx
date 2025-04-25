import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 定义支持的语言类型
export type Language = 'en' | 'zh' | 'es';

// 本地化上下文类型
interface LocalizationContextType {
  language: Language;
  setLanguage: (language: Language) => Promise<void>;
  t: (key: string) => string;
  isRTL: boolean;
}

// 创建上下文
const LocalizationContext = createContext<LocalizationContextType | undefined>(undefined);

// 翻译对象
const translations = {
  en: {
    common: {
      loading: 'Loading...',
      error: 'An error occurred',
      retry: 'Retry',
      save: 'Save',
      cancel: 'Cancel',
      confirm: 'Confirm',
      delete: 'Delete',
      edit: 'Edit',
      add: 'Add',
    },
    auth: {
      login: 'Login',
      register: 'Register',
      email: 'Email',
      password: 'Password',
      confirmPassword: 'Confirm Password',
      forgotPassword: 'Forgot Password',
      resetPassword: 'Reset Password',
      noAccount: "Don't have an account?",
      hasAccount: 'Already have an account?',
      signUp: 'Sign Up',
      signIn: 'Sign In',
    },
    home: {
      welcome: 'Welcome',
      totalIncome: 'Total Income',
      totalExpenses: 'Total Expenses',
      balance: 'Balance',
      recentTransactions: 'Recent Transactions',
      viewAll: 'View All',
      noTransactions: 'No transactions yet',
    },
    income: {
      title: 'Income',
      addIncome: 'Add Income',
      incomeHistory: 'Income History',
      noIncome: 'No income records yet',
      amount: 'Amount',
      category: 'Category',
      description: 'Description',
      date: 'Date',
    },
    incomeCategories: {
      salary: 'Salary',
      freelance: 'Freelance',
      investment: 'Investment',
      gift: 'Gift',
      otherIncome: 'Other',
    },
    expenses: {
      title: 'Expenses',
      addExpense: 'Add Expense',
      expenseHistory: 'Expense History',
      noExpenses: 'No expense records yet',
      amount: 'Amount',
      category: 'Category',
      description: 'Description',
      date: 'Date',
    },
    expenseCategories: {
      food: 'Food',
      transport: 'Transport',
      housing: 'Housing',
      entertainment: 'Entertainment',
      shopping: 'Shopping',
      utilities: 'Utilities',
      otherExpense: 'Other',
    },
    settings: {
      title: 'Settings',
      language: 'Language',
      currency: 'Currency',
      theme: 'Theme',
      darkMode: 'Dark Mode',
      notification: 'Notifications',
      about: 'About',
      logout: 'Logout',
    },
    financeAI: {
      title: 'Finance AI Analysis',
      analyze: 'Analyze',
      question: 'Ask a question about your finances',
      loading: 'Analyzing your finances...',
      error: 'Failed to get analysis',
      placeholder: 'e.g., How can I improve my saving rate?',
      summary: 'Financial Summary',
      insights: 'AI Insights',
      questionSuggestions: 'Question Suggestions',
      savingRate: 'How can I improve my saving rate?',
      incomeVsExpenses: 'Is my income-to-expense ratio healthy?',
      spendingPatterns: 'What spending patterns can I optimize?',
      incomeDiversification: 'How can I diversify my income sources?',
    }
  },
  zh: {
    common: {
      loading: '加载中...',
      error: '发生错误',
      retry: '重试',
      save: '保存',
      cancel: '取消',
      confirm: '确认',
      delete: '删除',
      edit: '编辑',
      add: '添加',
    },
    auth: {
      login: '登录',
      register: '注册',
      email: '邮箱',
      password: '密码',
      confirmPassword: '确认密码',
      forgotPassword: '忘记密码',
      resetPassword: '重置密码',
      noAccount: '没有账号？',
      hasAccount: '已有账号？',
      signUp: '注册',
      signIn: '登录',
    },
    home: {
      welcome: '欢迎',
      totalIncome: '总收入',
      totalExpenses: '总支出',
      balance: '余额',
      recentTransactions: '最近交易',
      viewAll: '查看全部',
      noTransactions: '暂无交易记录',
    },
    income: {
      title: '收入',
      addIncome: '添加收入',
      incomeHistory: '收入历史',
      noIncome: '暂无收入记录',
      amount: '金额',
      category: '类别',
      description: '描述',
      date: '日期',
    },
    incomeCategories: {
      salary: '工资',
      freelance: '自由职业',
      investment: '投资',
      gift: '礼物',
      otherIncome: '其他',
    },
    expenses: {
      title: '支出',
      addExpense: '添加支出',
      expenseHistory: '支出历史',
      noExpenses: '暂无支出记录',
      amount: '金额',
      category: '类别',
      description: '描述',
      date: '日期',
    },
    expenseCategories: {
      food: '食品',
      transport: '交通',
      housing: '住房',
      entertainment: '娱乐',
      shopping: '购物',
      utilities: '水电',
      otherExpense: '其他',
    },
    settings: {
      title: '设置',
      language: '语言',
      currency: '货币',
      theme: '主题',
      darkMode: '深色模式',
      notification: '通知',
      about: '关于',
      logout: '退出登录',
    },
    financeAI: {
      title: '财务AI分析',
      analyze: '分析',
      question: '询问有关您财务的问题',
      loading: '正在分析您的财务...',
      error: '获取分析失败',
      placeholder: '例如：如何提高我的储蓄率？',
      summary: '财务摘要',
      insights: 'AI洞察',
      questionSuggestions: '问题建议',
      savingRate: '如何提高我的储蓄率？',
      incomeVsExpenses: '我的收入支出比例健康吗？',
      spendingPatterns: '我可以优化哪些支出模式？',
      incomeDiversification: '如何使我的收入来源多样化？',
    }
  },
  es: {
    common: {
      loading: 'Cargando...',
      error: 'Error',
      retry: 'Reintentar',
      save: 'Guardar',
      cancel: 'Cancelar',
      confirm: 'Confirmar',
      delete: 'Eliminar',
      edit: 'Editar',
      add: 'Añadir',
    },
    auth: {
      login: 'Iniciar Sesión',
      register: 'Registrarse',
      email: 'Correo Electrónico',
      password: 'Contraseña',
      confirmPassword: 'Confirmar Contraseña',
      forgotPassword: '¿Olvidó su contraseña?',
      resetPassword: 'Restablecer Contraseña',
      noAccount: "¿No tiene una cuenta?",
      hasAccount: '¿Ya tiene una cuenta?',
      signUp: 'Registrarse',
      signIn: 'Iniciar Sesión',
    },
    home: {
      welcome: 'Bienvenido de nuevo',
      totalIncome: 'Ingresos Totales',
      totalExpenses: 'Gastos Totales',
      balance: 'Balance',
      recentTransactions: 'Transacciones Recientes',
      viewAll: 'Ver Todo',
      noTransactions: 'No hay transacciones todavía',
    },
    income: {
      title: 'Ingresos',
      addIncome: 'Añadir Ingreso',
      incomeHistory: 'Historial de Ingresos',
      noIncome: 'No hay registros de ingresos',
      amount: 'Monto',
      category: 'Categoría',
      description: 'Descripción',
      date: 'Fecha',
    },
    incomeCategories: {
      salary: 'Salario',
      freelance: 'Freelance',
      investment: 'Inversión',
      gift: 'Regalo',
      otherIncome: 'Otros Ingresos',
    },
    expenses: {
      title: 'Gastos',
      addExpense: 'Añadir Gasto',
      expenseHistory: 'Historial de Gastos',
      noExpenses: 'No hay registros de gastos',
      amount: 'Monto',
      category: 'Categoría',
      description: 'Descripción',
      date: 'Fecha',
    },
    expenseCategories: {
      food: 'Comida',
      transport: 'Transporte',
      housing: 'Vivienda',
      entertainment: 'Entretenimiento',
      shopping: 'Compras',
      utilities: 'Servicios',
      otherExpense: 'Otro',
    },
    settings: {
      title: 'Configuración',
      language: 'Idioma',
      currency: 'Moneda',
      theme: 'Tema',
      darkMode: 'Modo Oscuro',
      notification: 'Notificaciones',
      about: 'Acerca de',
      logout: 'Cerrar Sesión',
    },
    financeAI: {
      title: 'Análisis de AI Financiero',
      analyze: 'Analizar',
      question: 'Haga su pregunta sobre sus finanzas',
      loading: 'Analizando sus finanzas...',
      error: 'Error al obtener análisis',
      placeholder: 'Por ejemplo: ¿Cómo puedo mejorar mi tasa de ahorro?',
      summary: 'Resumen Financiero',
      insights: 'Revelaciones de AI',
      questionSuggestions: 'Sugerencias de Pregunta',
      savingRate: '¿Cómo puedo mejorar mi tasa de ahorro?',
      incomeVsExpenses: '¿Es mi ratio de ingresos-gastos saludable?',
      spendingPatterns: '¿Qué patrones de gasto puedo optimizar?',
      incomeDiversification: '¿Cómo puedo diversificar mis fuentes de ingresos?',
    }
  }
};

// 从AsyncStorage获取保存的语言或使用默认语言
const loadStoredLanguage = async (): Promise<Language> => {
  try {
    const storedLang = await AsyncStorage.getItem('@language');
    return (storedLang as Language) || 'en';
  } catch (error) {
    console.error('Failed to load language preference', error);
    return 'en';
  }
};

// 翻译函数
const translate = (key: string, language: Language): string => {
  try {
    const keys = key.split('.');
    let current: any = translations[language];
    for (const k of keys) {
      if (current?.[k] === undefined) {
        return key;
      }
      current = current[k];
    }
    return typeof current === 'string' ? current : key;
  } catch (error) {
    console.error('Translation error:', error);
    return key;
  }
};

// LocalizationProvider组件
export const LocalizationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('en');
  const [isLoading, setIsLoading] = useState(true);

  // 初始化时加载保存的语言
  useEffect(() => {
    loadStoredLanguage().then((lang) => {
      setLanguageState(lang);
      setIsLoading(false);
    });
  }, []);

  // 设置新语言并保存到AsyncStorage
  const setLanguage = async (newLanguage: Language) => {
    try {
      await AsyncStorage.setItem('@language', newLanguage);
      setLanguageState(newLanguage);
    } catch (error) {
      console.error('Failed to save language preference', error);
    }
  };

  // 翻译函数
  const t = (key: string): string => translate(key, language);

  // 判断是否为RTL语言
  const isRTL = false; // 当前没有支持RTL的语言，将来如果添加阿拉伯语等RTL语言可以更新此处

  const contextValue = {
    language,
    setLanguage,
    t,
    isRTL,
  };

  if (isLoading) {
    // 返回加载状态组件或占位符
    return null;
  }

  return (
    <LocalizationContext.Provider value={contextValue}>
      {children}
    </LocalizationContext.Provider>
  );
};

// 自定义Hook
export const useLocalization = (): LocalizationContextType => {
  const context = useContext(LocalizationContext);
  if (context === undefined) {
    throw new Error('useLocalization must be used within a LocalizationProvider');
  }
  return context;
};

export default LocalizationContext; 