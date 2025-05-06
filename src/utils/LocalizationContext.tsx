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
      update: 'Update',
    },
    navigation: {
      home: 'Home',
      income: 'Income',
      expense: 'Expense',
      statistics: 'Stats',
      financeAI: 'AI',
      settings: 'Settings',
      plan: 'My Plan',
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
    budget: {
      monthlyBudget: 'Monthly Budget',
      income: 'Income',
      expenses: 'Expenses',
      budgetUsed: 'Budget Used',
      remaining: 'Remaining',
      savingRate: 'Saving Rate',
      topExpenses: 'Top Expenses',
      noDataAvailable: 'No Data Available',
      unknown: 'Unknown',
    },
    income: {
      title: 'Income',
      addIncome: 'Add Income',
      editIncome: 'Edit Income',
      incomeHistory: 'Income History',
      noIncome: 'No income records yet',
      amount: 'Amount',
      category: 'Category',
      description: 'Description',
      date: 'Date',
      dateFormat: 'Format: YYYY-MM-DD',
      deleteConfirm: 'Are you sure you want to delete this income record?',
      deleteSuccess: 'Income record deleted successfully',
      deleteFailed: 'Failed to delete income record',
      updateSuccess: 'Income record updated successfully',
      updateFailed: 'Failed to update income record',
      invalidAmount: 'Please enter a valid amount',
      descriptionRequired: 'Please enter a description',
    },
    incomeCategories: {
      salary: 'Salary',
      bonus: 'Bonus',
      freelance: 'Freelance',
      investment: 'Investment',
      gift: 'Gift',
      otherIncome: 'Other',
    },
    expenses: {
      title: 'Expenses',
      addExpense: 'Add Expense',
      editExpense: 'Edit Expense',
      expenseHistory: 'Expense History',
      noExpenses: 'No expense records yet',
      amount: 'Amount',
      category: 'Category',
      description: 'Description',
      date: 'Date',
      dateFormat: 'Format: YYYY-MM-DD',
      deleteConfirm: 'Are you sure you want to delete this expense record?',
      deleteSuccess: 'Expense record deleted successfully',
      deleteFailed: 'Failed to delete expense record',
      updateSuccess: 'Expense record updated successfully',
      updateFailed: 'Failed to update expense record',
      invalidAmount: 'Please enter a valid amount',
      descriptionRequired: 'Please enter a description',
      addSuccess: 'Expense record added successfully',
      addFailed: 'Failed to add expense record',
      fetchFailed: 'Failed to fetch expense records',
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
      askFinanceQuestion: 'Ask a question about your finances',
      analyzingData: 'Analyzing your financial data...',
      advice: 'AI Advice',
      suggestedQuestions: 'Suggested Questions',
      ask: 'Ask',
      howToSave: 'How can I save more money?',
      spendingTrends: 'What are my spending trends?',
      budgetRecommendations: 'What budget recommendations do you have?',
      investmentAdvice: 'Do you have investment advice?'
    },
    statistics: {
      title: 'Statistics',
      income: 'Income',
      expenses: 'Expenses',
      balance: 'Balance',
      savingRate: 'Saving Rate',
      expenseByCategory: 'Expenses by Category',
      incomeByCategory: 'Income by Category',
      expenseDetails: 'Expense Details',
      incomeDetails: 'Income Details',
      noDataAvailable: 'No Data Available',
      importTransactions: 'Import Transactions',
      percentageOfTotal: '% of total'
    },
    myPlan: {
      title: 'My Financial Plan',
      addGoal: 'Add New Goal',
      editGoal: 'Edit Goal',
      noGoals: 'No financial goals yet',
      goalName: 'Goal Name',
      targetAmount: 'Target Amount',
      currentAmount: 'Current Amount',
      deadline: 'Deadline',
      noDeadline: 'Not set',
      description: 'Description',
      progress: 'Progress',
      importFromAI: 'Import from AI',
      saveGoal: 'Save Goal',
      deleteGoal: 'Delete Goal',
      cancelEdit: 'Cancel',
      completionDate: 'Completion Date',
      status: 'Status',
      active: 'Active',
      completed: 'Completed',
      importAIAdvice: 'Import AI Advice',
      aiSuggestions: 'AI Suggestions',
      chooseSuggestion: 'Choose a suggestion to import',
      importSuccess: 'Successfully imported AI suggestion',
      currentGoal: 'Current goal',
    },
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
      success: '成功',
      update: '更新',
    },
    navigation: {
      home: '首页',
      income: '收入',
      expense: '支出',
      statistics: '统计',
      financeAI: '财务AI',
      settings: '设置',
      plan: '我的计划',
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
      personalFinanceAssistant: '个人财务助手',
      income: '收入',
      expenses: '支出',
      budgetAnalysis: '预算分析',
    },
    budget: {
      monthlyBudget: '月度预算',
      income: '收入',
      expenses: '支出',
      budgetUsed: '预算使用',
      remaining: '剩余',
      savingRate: '储蓄率',
      topExpenses: '主要支出',
      noDataAvailable: '暂无数据',
      unknown: '未知',
    },
    income: {
      title: '收入',
      addIncome: '添加收入',
      editIncome: '编辑收入',
      incomeHistory: '收入历史',
      noIncome: '暂无收入记录',
      amount: '金额',
      category: '类别',
      description: '描述',
      date: '日期',
      dateFormat: '格式：YYYY-MM-DD',
      deleteConfirm: '确定要删除这条收入记录吗？',
      deleteSuccess: '收入记录删除成功',
      deleteFailed: '删除收入记录失败',
      updateSuccess: '收入记录更新成功',
      updateFailed: '更新收入记录失败',
      invalidAmount: '请输入有效金额',
      descriptionRequired: '请输入描述',
    },
    incomeCategories: {
      salary: '工资',
      bonus: '奖金',
      freelance: '自由职业',
      investment: '投资',
      gift: '礼物',
      otherIncome: '其他',
    },
    expenses: {
      title: '支出',
      addExpense: '添加支出',
      editExpense: '编辑支出',
      expenseHistory: '支出历史',
      noExpenses: '暂无支出记录',
      amount: '金额',
      category: '类别',
      description: '描述',
      date: '日期',
      dateFormat: '格式：YYYY-MM-DD',
      deleteConfirm: '确定要删除这条支出记录吗？',
      deleteSuccess: '支出记录删除成功',
      deleteFailed: '删除支出记录失败',
      updateSuccess: '支出记录更新成功',
      updateFailed: '更新支出记录失败',
      invalidAmount: '请输入有效金额',
      descriptionRequired: '请输入描述',
      addSuccess: '支出记录添加成功',
      addFailed: '添加支出记录失败',
      fetchFailed: '获取支出记录失败',
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
      askFinanceQuestion: '询问关于您财务的问题',
      analyzingData: '正在分析您的财务数据...',
      advice: 'AI建议',
      suggestedQuestions: '推荐问题',
      ask: '提问',
      howToSave: '如何节省更多钱？',
      spendingTrends: '我的支出趋势是什么？',
      budgetRecommendations: '有什么预算建议？',
      investmentAdvice: '有什么投资建议？'
    },
    statistics: {
      title: '统计',
      income: '收入',
      expenses: '支出',
      balance: '余额',
      savingRate: '储蓄率',
      expenseByCategory: '按类别支出',
      incomeByCategory: '按类别收入',
      expenseDetails: '支出详情',
      incomeDetails: '收入详情',
      noDataAvailable: '暂无数据',
      importTransactions: '导入交易',
      percentageOfTotal: '占总额的百分比'
    },
    myPlan: {
      title: '我的财务计划',
      addGoal: '添加新目标',
      editGoal: '编辑目标',
      noGoals: '暂无财务目标',
      goalName: '目标名称',
      targetAmount: '目标金额',
      currentAmount: '当前金额',
      deadline: '截止日期',
      noDeadline: '未设置',
      description: '描述',
      progress: '进度',
      importFromAI: '从AI导入',
      saveGoal: '保存目标',
      deleteGoal: '删除目标',
      cancelEdit: '取消',
      completionDate: '完成日期',
      status: '状态',
      active: '活跃',
      completed: '已完成',
      importAIAdvice: '导入AI建议',
      aiSuggestions: 'AI建议',
      chooseSuggestion: '选择一个建议导入',
      importSuccess: '成功导入AI建议',
      currentGoal: '当前目标',
    },
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
      update: 'Actualizar',
    },
    navigation: {
      home: 'Inicio',
      income: 'Ingresos',
      expense: 'Gastos',
      statistics: 'Estadísticas',
      financeAI: 'AI',
      settings: 'Configuración',
      plan: 'Mi Plan',
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
    budget: {
      monthlyBudget: 'Presupuesto Mensual',
      income: 'Ingresos',
      expenses: 'Gastos',
      budgetUsed: 'Presupuesto Utilizado',
      remaining: 'Restante',
      savingRate: 'Tasa de Ahorro',
      topExpenses: 'Gastos Principales',
      noDataAvailable: 'Datos No Disponibles',
      unknown: 'Desconocido',
    },
    income: {
      title: 'Ingresos',
      addIncome: 'Añadir Ingreso',
      editIncome: 'Editar Ingreso',
      incomeHistory: 'Historial de Ingresos',
      noIncome: 'No hay registros de ingresos',
      amount: 'Monto',
      category: 'Categoría',
      description: 'Descripción',
      date: 'Fecha',
      dateFormat: 'Formato: YYYY-MM-DD',
      deleteConfirm: '¿Está seguro de que desea eliminar este registro de ingresos?',
      deleteSuccess: 'Registro de ingresos eliminado con éxito',
      deleteFailed: 'Error al eliminar el registro de ingresos',
      updateSuccess: 'Registro de ingresos actualizado con éxito',
      updateFailed: 'Error al actualizar el registro de ingresos',
      invalidAmount: 'Por favor ingrese un monto válido',
      descriptionRequired: 'Por favor ingrese una descripción',
    },
    incomeCategories: {
      salary: 'Salario',
      bonus: 'Bonificación',
      freelance: 'Freelance',
      investment: 'Inversión',
      gift: 'Regalo',
      otherIncome: 'Otros Ingresos',
    },
    expenses: {
      title: 'Gastos',
      addExpense: 'Añadir Gasto',
      editExpense: 'Editar Gasto',
      expenseHistory: 'Historial de Gastos',
      noExpenses: 'No hay registros de gastos',
      amount: 'Monto',
      category: 'Categoría',
      description: 'Descripción',
      date: 'Fecha',
      dateFormat: 'Formato: YYYY-MM-DD',
      deleteConfirm: '¿Está seguro de que desea eliminar este registro de gastos?',
      deleteSuccess: 'Registro de gastos eliminado con éxito',
      deleteFailed: 'Error al eliminar el registro de gastos',
      updateSuccess: 'Registro de gastos actualizado con éxito',
      updateFailed: 'Error al actualizar el registro de gastos',
      invalidAmount: 'Por favor ingrese un monto válido',
      descriptionRequired: 'Por favor ingrese una descripción',
      addSuccess: 'Registro de gastos añadido con éxito',
      addFailed: 'Error al añadir el registro de gastos',
      fetchFailed: 'Error al obtener los registros de gastos',
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
      askFinanceQuestion: 'Haga una pregunta sobre sus finanzas',
      analyzingData: 'Analizando sus datos financieros...',
      advice: 'Consejos de AI',
      suggestedQuestions: 'Preguntas Sugeridas',
      ask: 'Preguntar',
      howToSave: '¿Cómo puedo ahorrar más dinero?',
      spendingTrends: '¿Cuáles son mis tendencias de gasto?',
      budgetRecommendations: '¿Qué recomendaciones de presupuesto tienes?',
      investmentAdvice: '¿Tienes consejos de inversión?'
    },
    statistics: {
      title: 'Estadísticas',
      income: 'Ingresos',
      expenses: 'Gastos',
      balance: 'Balance',
      savingRate: 'Tasa de Ahorro',
      expenseByCategory: 'Gastos por Categoría',
      incomeByCategory: 'Ingresos por Categoría',
      expenseDetails: 'Detalles de Gastos',
      incomeDetails: 'Detalles de Ingresos',
      noDataAvailable: 'Datos No Disponibles',
      importTransactions: 'Importar Transacciones',
      percentageOfTotal: '% del total'
    },
    myPlan: {
      title: 'Mi Plan Financiero',
      addGoal: 'Agregar Nuevo Objetivo',
      editGoal: 'Editar Objetivo',
      noGoals: 'Aún no hay objetivos financieros',
      goalName: 'Nombre del Objetivo',
      targetAmount: 'Monto Objetivo',
      currentAmount: 'Monto Actual',
      deadline: 'Fecha Límite',
      noDeadline: 'No establecido',
      description: 'Descripción',
      progress: 'Progreso',
      importFromAI: 'Importar de AI',
      saveGoal: 'Guardar Objetivo',
      deleteGoal: 'Eliminar Objetivo',
      cancelEdit: 'Cancelar',
      completionDate: 'Fecha de Completación',
      status: 'Estado',
      active: 'Activo',
      completed: 'Completado',
      importAIAdvice: 'Importar Consejos de AI',
      aiSuggestions: 'Consejos de AI',
      chooseSuggestion: 'Elija una sugerencia para importar',
      importSuccess: 'Sugerencia de AI importada exitosamente',
      currentGoal: 'Objetivo actual',
    },
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