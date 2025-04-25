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
    // Common
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    add: 'Add',
    confirm: 'Confirm',
    back: 'Back',
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    change: 'changed to',
    retry: 'Retry',
    unknown: 'Unknown',
    noDataAvailable: 'No data available',
    
    // Auth Screens
    login: 'Login',
    register: 'Register',
    email: 'Email',
    password: 'Password',
    username: 'Username',
    forgotPassword: 'Forgot Password?',
    noAccount: "Don't have an account?",
    signUp: 'Sign Up',
    haveAccount: 'Already have an account?',
    signIn: 'Sign In',
    
    // Home Screen
    welcome: 'Welcome back',
    personalFinanceAssistant: 'Your Personal Finance Assistant',
    income: 'Income',
    expenses: 'Expenses',
    balance: 'Balance',
    recentTransactions: 'Recent Transactions',
    noTransactions: 'No transactions yet',
    viewAll: 'View All',
    budgetAnalysis: 'Budget Analysis',
    topExpenses: 'Top Expenses',
    monthlyBudget: 'Monthly Budget',
    remaining: 'Remaining',
    savingRate: 'Saving Rate',
    budgetUsed: 'Budget Used',
    fetchDataFailed: 'Failed to fetch data. Please try again later.',
    serverError: 'Server error',
    noServerResponse: 'No response from server. Please check your connection.',
    
    // Income Screen
    addIncome: 'Add Income',
    incomeDescription: 'Income description',
    incomeHistory: 'Income History',
    noIncomeRecords: 'No income records found',
    incomeAdded: 'Income record added',
    failedToAddIncome: 'Failed to add income record. Please try again',
    
    // Categories
    salary: 'Salary',
    bonus: 'Bonus',
    investment: 'Investment',
    freelance: 'Freelance',
    otherIncome: 'Other Income',
    
    // Expense Screen
    addExpense: 'Add Expense',
    expenseDescription: 'Expense description',
    expenseHistory: 'Expense History',
    noExpenseRecords: 'No expense records found',
    expenseAdded: 'Expense record added',
    failedToAddExpense: 'Failed to add expense record. Please try again',
    
    // Expense Categories
    food: 'Food',
    transport: 'Transport',
    housing: 'Housing',
    entertainment: 'Entertainment',
    shopping: 'Shopping',
    utilities: 'Utilities',
    otherExpense: 'Other',
    
    // Settings Screen
    settings: 'Settings',
    userInformation: 'User Information',
    logout: 'Logout',
    appearance: 'Appearance',
    darkMode: 'Dark Mode',
    preferences: 'Preferences',
    notifications: 'Notifications',
    currency: 'Currency',
    language: 'Language',
    dataManagement: 'Data Management',
    clearAllData: 'Clear All Data',
    clearDataConfirm: 'Are you sure you want to clear all your financial data? This action cannot be undone.',
    clearDataDone: 'All financial data has been cleared',
    resetSettings: 'Reset to Default Settings',
    resetSettingsConfirm: 'Are you sure you want to reset language to English and currency to USD?',
    resetSettingsDone: 'Settings have been reset to defaults',
    about: 'About',
    version: 'Version',
    
    // Finance AI Screen
    financeAI: 'Financial Advisor',
    askFinanceQuestion: 'Ask your financial question...',
    analyzingData: 'Analyzing your financial data...',
    suggestedQuestions: 'Suggested Questions',
    howToSave: 'How can I save more money?',
    spendingTrends: 'What are my spending trends?',
    budgetRecommendations: 'Any budget recommendations?',
    investmentAdvice: 'Should I invest more?',
    summary: 'Summary',
    advice: 'Advice',
    ask: 'Ask',
  },
  zh: {
    // Common
    save: '保存',
    cancel: '取消',
    delete: '删除',
    edit: '编辑',
    add: '添加',
    confirm: '确认',
    back: '返回',
    loading: '加载中...',
    error: '错误',
    success: '成功',
    change: '已更改为',
    retry: '重试',
    unknown: '未知',
    noDataAvailable: '暂无数据',
    
    // Auth Screens
    login: '登录',
    register: '注册',
    email: '邮箱',
    password: '密码',
    username: '用户名',
    forgotPassword: '忘记密码？',
    noAccount: "没有账号？",
    signUp: '注册',
    haveAccount: '已有账号？',
    signIn: '登录',
    
    // Home Screen
    welcome: '欢迎回来',
    personalFinanceAssistant: '您的个人财务助手',
    income: '收入',
    expenses: '支出',
    balance: '余额',
    recentTransactions: '最近交易',
    noTransactions: '暂无交易记录',
    viewAll: '查看全部',
    budgetAnalysis: '预算分析',
    topExpenses: '主要支出',
    monthlyBudget: '月度预算',
    remaining: '剩余',
    savingRate: '储蓄率',
    budgetUsed: '预算使用',
    fetchDataFailed: '获取数据失败，请稍后再试。',
    serverError: '服务器错误',
    noServerResponse: '服务器无响应，请检查网络连接。',
    
    // Income Screen
    addIncome: '添加收入',
    incomeDescription: '收入描述',
    incomeHistory: '收入历史',
    noIncomeRecords: '没有找到收入记录',
    incomeAdded: '收入记录已添加',
    failedToAddIncome: '添加收入记录失败，请重试',
    
    // Categories
    salary: '工资',
    bonus: '奖金',
    investment: '投资',
    freelance: '自由职业',
    otherIncome: '其他收入',
    
    // Expense Screen
    addExpense: '添加支出',
    expenseDescription: '支出描述',
    expenseHistory: '支出历史',
    noExpenseRecords: '没有找到支出记录',
    expenseAdded: '支出记录已添加',
    failedToAddExpense: '添加支出记录失败，请重试',
    
    // Expense Categories
    food: '食物',
    transport: '交通',
    housing: '住房',
    entertainment: '娱乐',
    shopping: '购物',
    utilities: '水电费',
    otherExpense: '其他',
    
    // Settings Screen
    settings: '设置',
    userInformation: '用户信息',
    logout: '退出登录',
    appearance: '外观',
    darkMode: '深色模式',
    preferences: '偏好设置',
    notifications: '通知',
    currency: '货币',
    language: '语言',
    dataManagement: '数据管理',
    clearAllData: '清除所有数据',
    clearDataConfirm: '您确定要清除所有财务数据吗？此操作无法撤消。',
    clearDataDone: '所有财务数据已清除',
    resetSettings: '重置为默认设置',
    resetSettingsConfirm: '您确定要将语言重置为英语，货币重置为美元吗？',
    resetSettingsDone: '设置已重置为默认值',
    about: '关于',
    version: '版本',
    
    // Finance AI Screen
    financeAI: '财务顾问',
    askFinanceQuestion: '提出您的财务问题...',
    analyzingData: '正在分析您的财务数据...',
    suggestedQuestions: '推荐问题',
    howToSave: '如何节省更多钱？',
    spendingTrends: '我的消费趋势是什么？',
    budgetRecommendations: '有什么预算建议？',
    investmentAdvice: '我应该增加投资吗？',
    summary: '摘要',
    advice: '建议',
    ask: '提问',
  },
  es: {
    // Common
    save: 'Guardar',
    cancel: 'Cancelar',
    delete: 'Eliminar',
    edit: 'Editar',
    add: 'Añadir',
    confirm: 'Confirmar',
    back: 'Atrás',
    loading: 'Cargando...',
    error: 'Error',
    success: 'Éxito',
    change: 'cambiado a',
    retry: 'Reintentar',
    unknown: 'Desconocido',
    noDataAvailable: 'No hay datos disponibles',
    
    // Auth Screens
    login: 'Iniciar Sesión',
    register: 'Registrarse',
    email: 'Correo Electrónico',
    password: 'Contraseña',
    username: 'Nombre de Usuario',
    forgotPassword: '¿Olvidó su contraseña?',
    noAccount: "¿No tiene una cuenta?",
    signUp: 'Registrarse',
    haveAccount: '¿Ya tiene una cuenta?',
    signIn: 'Iniciar Sesión',
    
    // Home Screen
    welcome: 'Bienvenido de nuevo',
    personalFinanceAssistant: 'Su Asistente Financiero Personal',
    income: 'Ingresos',
    expenses: 'Gastos',
    balance: 'Balance',
    recentTransactions: 'Transacciones Recientes',
    noTransactions: 'No hay transacciones todavía',
    viewAll: 'Ver Todo',
    budgetAnalysis: 'Análisis de Presupuesto',
    topExpenses: 'Principales Gastos',
    monthlyBudget: 'Presupuesto Mensual',
    remaining: 'Restante',
    savingRate: 'Tasa de Ahorro',
    budgetUsed: 'Presupuesto Utilizado',
    fetchDataFailed: 'Error al obtener datos. Por favor, inténtelo de nuevo más tarde.',
    serverError: 'Error del servidor',
    noServerResponse: 'Sin respuesta del servidor. Por favor, compruebe su conexión.',
    
    // Income Screen
    addIncome: 'Añadir Ingreso',
    incomeDescription: 'Descripción del ingreso',
    incomeHistory: 'Historial de Ingresos',
    noIncomeRecords: 'No se encontraron registros de ingresos',
    incomeAdded: 'Registro de ingreso añadido',
    failedToAddIncome: 'Error al añadir registro de ingreso. Por favor, inténtelo de nuevo',
    
    // Categories
    salary: 'Salario',
    bonus: 'Bono',
    investment: 'Inversión',
    freelance: 'Freelance',
    otherIncome: 'Otros Ingresos',
    
    // Expense Screen
    addExpense: 'Añadir Gasto',
    expenseDescription: 'Descripción del gasto',
    expenseHistory: 'Historial de Gastos',
    noExpenseRecords: 'No se encontraron registros de gastos',
    expenseAdded: 'Registro de gasto añadido',
    failedToAddExpense: 'Error al añadir registro de gasto. Por favor, inténtelo de nuevo',
    
    // Expense Categories
    food: 'Comida',
    transport: 'Transporte',
    housing: 'Vivienda',
    entertainment: 'Entretenimiento',
    shopping: 'Compras',
    utilities: 'Servicios',
    otherExpense: 'Otro',
    
    // Settings Screen
    settings: 'Configuración',
    userInformation: 'Información del Usuario',
    logout: 'Cerrar Sesión',
    appearance: 'Apariencia',
    darkMode: 'Modo Oscuro',
    preferences: 'Preferencias',
    notifications: 'Notificaciones',
    currency: 'Moneda',
    language: 'Idioma',
    dataManagement: 'Gestión de Datos',
    clearAllData: 'Borrar Todos los Datos',
    clearDataConfirm: '¿Está seguro de que desea borrar todos sus datos financieros? Esta acción no se puede deshacer.',
    clearDataDone: 'Todos los datos financieros han sido borrados',
    resetSettings: 'Restablecer a Configuración Predeterminada',
    resetSettingsConfirm: '¿Está seguro de que desea restablecer el idioma a inglés y la moneda a USD?',
    resetSettingsDone: 'La configuración se ha restablecido a los valores predeterminados',
    about: 'Acerca de',
    version: 'Versión',
    
    // Finance AI Screen
    financeAI: 'Asesor Financiero',
    askFinanceQuestion: 'Haga su pregunta financiera...',
    analyzingData: 'Analizando sus datos financieros...',
    suggestedQuestions: 'Preguntas Sugeridas',
    howToSave: '¿Cómo puedo ahorrar más dinero?',
    spendingTrends: '¿Cuáles son mis tendencias de gasto?',
    budgetRecommendations: '¿Alguna recomendación para mi presupuesto?',
    investmentAdvice: '¿Debería invertir más?',
    summary: 'Resumen',
    advice: 'Consejo',
    ask: 'Preguntar',
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
  // @ts-ignore
  return translations[language][key] || key;
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