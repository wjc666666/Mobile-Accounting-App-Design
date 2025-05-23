import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, RefreshControl, TouchableOpacity, Image, Alert } from 'react-native';
import { incomeAPI, expenseAPI, budgetAPI } from '../utils/api';
import { useAuth } from '../utils/AuthContext';
import { useTheme, lightTheme, darkTheme } from '../utils/ThemeContext';
import { useLocalization } from '../utils/LocalizationContext';
import { useCurrency } from '../utils/CurrencyContext';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ProgressBar } from 'react-native-paper';
import { APP_ICON } from '../assets/girl';

interface Transaction {
  id: number;
  amount: number;
  category: string;
  date: string;
  description: string;
}

// Add this new component for budget analysis
const BudgetAnalysisCard = ({ budgetData }: { budgetData: any }) => {
  const { isDarkMode } = useTheme();
  const { t } = useLocalization();
  const { formatAmount } = useCurrency();
  const themeColors = isDarkMode ? darkTheme : lightTheme;
  
  if (!budgetData || !budgetData.summary) {
    return (
      <View style={styles.emptyState}>
        <Text style={[styles.emptyStateText, { color: themeColors.secondaryText }]}>{t('budget.noDataAvailable')}</Text>
      </View>
    );
  }

  const { summary, categories, period } = budgetData;
  const { totalIncome, totalExpense, balance, savingRate } = summary;

  // Calculate budget utilization
  const budgetUtilization = totalIncome > 0 ? (totalExpense / totalIncome) : 0;
  const progressColor = 
    budgetUtilization > 0.9 ? '#FF6B6B' :  // Over 90% - red
    budgetUtilization > 0.7 ? '#FFD166' :  // Over 70% - yellow
    '#06D6A0';  // Under 70% - green

  return (
    <View style={[styles.budgetCard, { backgroundColor: themeColors.card }]}>
      <View style={styles.budgetHeader}>
        <Text style={[styles.budgetTitle, { color: themeColors.primaryText }]}>{t('budget.monthlyBudget')}</Text>
        <Text style={[styles.budgetPeriod, { color: themeColors.secondaryText }]}>
          {new Date(period.start).toLocaleDateString()} - {new Date(period.end).toLocaleDateString()}
        </Text>
      </View>

      <View style={styles.budgetRow}>
        <Text style={[styles.budgetLabel, { color: themeColors.primaryText }]}>{t('budget.income')}:</Text>
        <Text style={styles.budgetIncomeValue}>{formatAmount(totalIncome)}</Text>
      </View>

      <View style={styles.budgetRow}>
        <Text style={[styles.budgetLabel, { color: themeColors.primaryText }]}>{t('budget.expenses')}:</Text>
        <Text style={styles.budgetExpenseValue}>{formatAmount(totalExpense)}</Text>
      </View>

      <View style={styles.budgetProgressContainer}>
        <Text style={[styles.budgetProgressLabel, { color: themeColors.primaryText }]}>
          {t('budget.budgetUsed')}: {(budgetUtilization * 100).toFixed(0)}%
        </Text>
        <ProgressBar
          progress={budgetUtilization}
          color={progressColor}
          style={styles.budgetProgressBar}
        />
      </View>

      <View style={[styles.budgetSummaryContainer, { 
        borderTopColor: themeColors.border,
        borderBottomColor: themeColors.border 
      }]}>
        <View style={styles.budgetSummaryItem}>
          <Text style={[styles.budgetSummaryValue, { color: themeColors.primaryText }]}>{formatAmount(balance)}</Text>
          <Text style={[styles.budgetSummaryLabel, { color: themeColors.secondaryText }]}>{t('budget.remaining')}</Text>
        </View>
        <View style={styles.budgetSummaryItem}>
          <Text style={[styles.budgetSummaryValue, { color: themeColors.primaryText }]}>{savingRate.toFixed(1)}%</Text>
          <Text style={[styles.budgetSummaryLabel, { color: themeColors.secondaryText }]}>{t('budget.savingRate')}</Text>
        </View>
      </View>

      {categories && categories.length > 0 && (
        <View style={styles.topExpenseContainer}>
          <Text style={[styles.topExpenseTitle, { color: themeColors.primaryText }]}>{t('budget.topExpenses')}</Text>
          {categories.slice(0, 3).map((category: any, index: number) => {
            // 安全处理金额，确保它是一个有效的数字
            let amountValue = 0;
            if (category && category.amount !== undefined && category.amount !== null) {
              // 如果是字符串，尝试转换为数字
              if (typeof category.amount === 'string') {
                amountValue = parseFloat(category.amount) || 0;
              } else if (typeof category.amount === 'number') {
                amountValue = category.amount;
              }
            }
            
            return (
              <View key={index} style={styles.topExpenseItem}>
                <Text style={[styles.topExpenseCategory, { color: themeColors.primaryText }]}>
                  {(() => {
                    // 确保类别名称标准化并有效
                    if (!category?.category) return t('budget.unknown');
                    const lowerCaseCategory = category.category.toLowerCase();
                    // 尝试使用翻译，如果不存在则显示原始类别
                    const translationKey = `expenseCategories.${lowerCaseCategory}`;
                    const translatedCategory = t(translationKey);
                    // 如果翻译键不存在（返回了原始翻译键），则使用原始类别名称
                    return translationKey !== translatedCategory ? translatedCategory : category.category;
                  })()}
                </Text>
                <Text style={styles.topExpenseAmount}>
                  {formatAmount(amountValue)}
                </Text>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
};

// 定义导航类型
type RootStackParamList = {
  Income: { editItem?: Transaction } | undefined;
  Expense: { editItem?: Transaction } | undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const HomeScreen = () => {
  const { user, logout } = useAuth();
  const { isDarkMode } = useTheme();
  const { t } = useLocalization();
  const { formatAmount } = useCurrency();
  const themeColors = isDarkMode ? darkTheme : lightTheme;
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [incomes, setIncomes] = useState<Transaction[]>([]);
  const [expenses, setExpenses] = useState<Transaction[]>([]);
  const [budgetAnalysis, setBudgetAnalysis] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const navigation = useNavigation<NavigationProp>();

  // Ensure incomes and expenses are arrays
  const safeIncomes = Array.isArray(incomes) ? incomes : [];
  const safeExpenses = Array.isArray(expenses) ? expenses : [];

  // Debug logging for income data
  console.log('Safe incomes length:', safeIncomes.length);
  if (safeIncomes.length > 0) {
    console.log('Sample income items:');
    safeIncomes.slice(0, 3).forEach((income, index) => {
      console.log(`Income ${index}:`, income);
      console.log(`Income ${index} amount:`, income.amount, 'type:', typeof income.amount);
    });
  }

  // Calculate total income - ensure we have valid numbers
  const totalIncome = safeIncomes.reduce((sum, income) => {
    const amount = income && typeof income.amount === 'number' ? income.amount : 0;
    console.log('Processing income amount:', income?.amount, '→', amount);
    return sum + amount;
  }, 0);
  
  console.log('Calculated totalIncome:', totalIncome);
  
  // Calculate total expenses - ensure we have valid numbers
  const totalExpense = safeExpenses.reduce((sum, expense) => {
    const amount = expense && typeof expense.amount === 'number' ? expense.amount : 0;
    return sum + amount;
  }, 0);
  
  // Calculate balance - ensure it's a valid number
  const balance = isNaN(totalIncome - totalExpense) ? 0 : (totalIncome - totalExpense);

  // 将 fetchData 包装在 useCallback 中
  const fetchData = useCallback(async () => {
    try {
      setError(null);
      console.log('Starting to fetch data...');
      
      // Get income data
      console.log('Fetching income data...');
      const incomesData = await incomeAPI.getIncomes();
      console.log('Income data:', incomesData);
      
      // Debug income data
      let processedIncomes: Transaction[] = [];
      if (Array.isArray(incomesData)) {
        console.log('Income data is an array with length:', incomesData.length);
        if (incomesData.length > 0) {
          console.log('First income item:', JSON.stringify(incomesData[0]));
          console.log('First income amount:', incomesData[0].amount);
          console.log('First income amount type:', typeof incomesData[0].amount);
          
          // Convert string amounts to numbers if needed
          processedIncomes = incomesData.map(income => ({
            ...income,
            amount: typeof income.amount === 'string' ? parseFloat(income.amount) : income.amount
          }));
          console.log('Processed incomes:', processedIncomes);
          setIncomes(processedIncomes);
        } else {
          setIncomes([]);
        }
      } else {
        console.log('Income data is not an array:', typeof incomesData);
        setIncomes([]);
      }
      
      // Get expense data
      console.log('Fetching expense data...');
      const expensesData = await expenseAPI.getExpenses();
      console.log('Expense data:', expensesData);
      
      // Process expense data similarly
      let processedExpenses: Transaction[] = [];
      if (Array.isArray(expensesData)) {
        processedExpenses = expensesData.map(expense => ({
          ...expense,
          amount: typeof expense.amount === 'string' ? parseFloat(expense.amount) : expense.amount
        }));
        setExpenses(processedExpenses);
      } else {
        setExpenses([]);
      }
      
      // 在这里直接计算总额，而不是使用 safeIncomes 和 safeExpenses
      const currentTotalIncome = processedIncomes.reduce((sum, income) => {
        const amount = income && typeof income.amount === 'number' ? income.amount : 0;
        return sum + amount;
      }, 0);
      
      const currentTotalExpense = processedExpenses.reduce((sum, expense) => {
        const amount = expense && typeof expense.amount === 'number' ? expense.amount : 0;
        return sum + amount;
      }, 0);
      
      const currentBalance = currentTotalIncome - currentTotalExpense;
      
      // Get budget analysis
      console.log('Fetching budget analysis...');
      const budgetData = await budgetAPI.getBudgetAnalysis();
      console.log('Budget analysis:', budgetData);
      
      // 如果预算分析数据为空或总金额为零，但有交易数据，则使用前端的交易数据计算
      if ((!budgetData || 
           (budgetData.summary && budgetData.summary.totalIncome === 0 && budgetData.summary.totalExpense === 0)) &&
          (processedIncomes.length > 0 || processedExpenses.length > 0)) {
        
        console.log('使用前端交易数据生成预算分析...');
        
        // 获取当前月份的第一天和最后一天
        const now = new Date();
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
        const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
        
        // 使用计算好的当前值
        const savingRate = currentTotalIncome > 0 ? (currentBalance / currentTotalIncome) * 100 : 0;
        
        // 按类别分组支出
        const expenseCategories = {} as Record<string, number>;
        processedExpenses.forEach((expense: Transaction) => {
          const amount = typeof expense.amount === 'number' ? expense.amount : 0;
          if (expenseCategories[expense.category]) {
            expenseCategories[expense.category] += amount;
          } else {
            expenseCategories[expense.category] = amount;
          }
        });
        
        // 转换为类别数组
        const categoryData = Object.keys(expenseCategories).map(category => ({
          category,
          amount: expenseCategories[category]
        }));
        
        // 排序（金额最大的在前）
        categoryData.sort((a, b) => b.amount - a.amount);
        
        // 构建分析结果
        const generatedBudgetData = {
          period: {
            start: firstDay,
            end: lastDay
          },
          summary: {
            totalIncome: currentTotalIncome,
            totalExpense: currentTotalExpense,
            balance: currentBalance,
            savingRate: parseFloat(savingRate.toFixed(2))
          },
          categories: categoryData
        };
        
        console.log('生成的预算分析:', generatedBudgetData);
        setBudgetAnalysis(generatedBudgetData);
      } else {
        setBudgetAnalysis(budgetData || {});
      }
      
      console.log('All data fetched');
    } catch (error: any) {
      console.error('Fetch data failed:', error);
      let errorMessage = t('fetchDataFailed');
      if (error.response) {
        // 服务器响应了，但状态码不在2xx范围内
        errorMessage = `${t('serverError')}: ${error.response.status} - ${error.response.data.error || error.response.statusText}`;
        console.error('Error response:', error.response.data);
      } else if (error.request) {
        // 请求已发送，但没有收到响应
        errorMessage = t('noServerResponse');
        console.error('No response:', error.request);
      } else {
        // 设置请求时发生了错误
        errorMessage = `${t('error')}: ${error.message}`;
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [t]);  // 空依赖数组，因为所有依赖都是稳定的

  // Use useFocusEffect to refresh data when screen is focused
  useFocusEffect(
    React.useCallback(() => {
      fetchData();
      return () => {
        // Cleanup function
      };
    }, [fetchData]) // 添加 fetchData 作为依赖项
  );

  // Pull to refresh
  const onRefresh = () => {
    setIsRefreshing(true);
    fetchData();
  };

  // Handle logout
  const handleLogout = () => {
    logout();
  };

  // Get recent transactions
  const getRecentTransactions = () => {
    // Debug transactions data
    console.log('Safe incomes length:', safeIncomes.length);
    console.log('Safe expenses length:', safeExpenses.length);
    
    if (safeIncomes.length > 0) {
      console.log('Sample income amount:', safeIncomes[0].amount, 'type:', typeof safeIncomes[0].amount);
    }
    
    const allTransactions = [
      ...safeIncomes.map(income => ({ 
        ...income, 
        type: 'income',
        // Ensure amount is a number
        amount: typeof income.amount === 'string' ? parseFloat(income.amount) : income.amount
      })),
      ...safeExpenses.map(expense => ({ 
        ...expense, 
        type: 'expense',
        // Ensure amount is a number
        amount: typeof expense.amount === 'string' ? parseFloat(expense.amount) : expense.amount
      }))
    ];
    
    console.log('All transactions length:', allTransactions.length);
    if (allTransactions.length > 0) {
      console.log('First transaction:', allTransactions[0]);
    }
    
    // Sort by date, newest first
    return allTransactions
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5); // Only show the 5 most recent
  };

  // 处理删除收入
  const handleDeleteIncome = async (id: number) => {
    Alert.alert(
      t('common.confirm'),
      t('income.deleteConfirm'),
      [
        {
          text: t('common.cancel'),
          style: 'cancel'
        },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              await incomeAPI.deleteIncome(id);
              Alert.alert(t('common.success'), t('income.deleteSuccess'));
              fetchData(); // 重新加载数据
            } catch (error) {
              console.error('Failed to delete income:', error);
              Alert.alert(t('common.error'), t('income.deleteFailed'));
            }
          }
        }
      ]
    );
  };

  // 处理删除支出
  const handleDeleteExpense = async (id: number) => {
    Alert.alert(
      t('common.confirm'),
      t('expenses.deleteConfirm'),
      [
        {
          text: t('common.cancel'),
          style: 'cancel'
        },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              await expenseAPI.deleteExpense(id);
              Alert.alert(t('common.success'), t('expenses.deleteSuccess'));
              fetchData(); // 重新加载数据
            } catch (error) {
              console.error('Failed to delete expense:', error);
              Alert.alert(t('common.error'), t('expenses.deleteFailed'));
            }
          }
        }
      ]
    );
  };

  // 处理编辑收入
  const handleEditIncome = (item: Transaction) => {
    navigation.navigate('Income', { editItem: item });
  };

  // 处理编辑支出
  const handleEditExpense = (item: Transaction) => {
    navigation.navigate('Expense', { editItem: item });
  };

  // 修改渲染交易项的函数
  const renderTransactionItem = (item: Transaction, type: 'income' | 'expense') => {
    const isIncome = type === 'income';
    const amount = isIncome ? item.amount : -item.amount;
    
    return (
      <View style={[styles.transactionItem, { backgroundColor: themeColors.card }]} key={`${type}-${item.id}`}>
        <View style={styles.transactionHeader}>
          <Text style={[styles.transactionCategory, { color: themeColors.primaryText }]}>
            {(() => {
              // 确保类别名称标准化并有效
              const lowerCaseCategory = item.category.toLowerCase();
              const translationKey = `${type}Categories.${lowerCaseCategory}`;
              // 尝试使用翻译，如果不存在则显示原始类别
              const translatedCategory = t(translationKey);
              // 如果翻译键不存在（返回了原始翻译键），则使用原始类别名称
              return translationKey !== translatedCategory ? translatedCategory : item.category;
            })()}
          </Text>
          <Text style={[
            styles.transactionAmount,
            { color: isIncome ? themeColors.success : themeColors.danger }
          ]}>
            {isIncome ? '+' : '-'}{formatAmount(Math.abs(amount))}
          </Text>
        </View>
        
        <Text style={[styles.transactionDescription, { color: themeColors.primaryText }]}>
          {item.description}
        </Text>
        
        <View style={styles.transactionFooter}>
          <Text style={[styles.transactionDate, { color: themeColors.secondaryText }]}>
            {new Date(item.date).toLocaleDateString()}
          </Text>
          
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: themeColors.primary }]}
              onPress={() => isIncome ? handleEditIncome(item) : handleEditExpense(item)}
            >
              <Text style={styles.actionButtonText}>{t('common.edit')}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: themeColors.danger }]}
              onPress={() => isIncome ? handleDeleteIncome(item.id) : handleDeleteExpense(item.id)}
            >
              <Text style={styles.actionButtonText}>{t('common.delete')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: themeColors.background }]}>
        <ActivityIndicator size="large" color={themeColors.primary} />
      </View>
    );
  }

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: themeColors.background }]}
      refreshControl={
        <RefreshControl 
          refreshing={isRefreshing} 
          onRefresh={onRefresh} 
          colors={[themeColors.primary]} 
          tintColor={themeColors.primary}
        />
      }
    >
      <View style={[styles.header, { backgroundColor: themeColors.header }]}>
        <View style={styles.headerContent}>
          <Image 
            source={APP_ICON} 
            style={styles.appIcon} 
            resizeMode="contain"
          />
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>JCEco Finance</Text>
            <Text style={styles.headerSubtitle}>
              {user ? `${t('home.welcome')}, ${user.username}` : t('home.personalFinanceAssistant')}
            </Text>
          </View>
        </View>
        <TouchableOpacity 
          onPress={handleLogout} 
          style={[styles.logoutButton, { backgroundColor: 'rgba(255, 255, 255, 0.2)' }]}
        >
          <Text style={styles.logoutText}>{t('settings.logout')}</Text>
        </TouchableOpacity>
      </View>
      
      {error && (
        <View style={[styles.errorContainer, { borderLeftColor: themeColors.danger }]}>
          <Text style={[styles.errorText, { color: themeColors.danger }]}>{error}</Text>
          <TouchableOpacity 
            style={[styles.retryButton, { backgroundColor: themeColors.primary }]} 
            onPress={() => {
              setIsLoading(true);
              fetchData().finally(() => setIsLoading(false));
            }}
          >
            <Text style={styles.retryText}>{t('common.retry')}</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.summaryContainer}>
        <View style={[styles.summaryCard, { backgroundColor: themeColors.card }]}>
          <Text style={[styles.summaryLabel, { color: themeColors.secondaryText }]}>{t('home.income')}</Text>
          <Text style={styles.incomeValue}>{formatAmount(totalIncome)}</Text>
        </View>
        <View style={[styles.summaryCard, { backgroundColor: themeColors.card }]}>
          <Text style={[styles.summaryLabel, { color: themeColors.secondaryText }]}>{t('home.expenses')}</Text>
          <Text style={styles.expenseValue}>{formatAmount(totalExpense)}</Text>
        </View>
        <View style={[styles.summaryCard, { backgroundColor: themeColors.card }]}>
          <Text style={[styles.summaryLabel, { color: themeColors.secondaryText }]}>{t('home.balance')}</Text>
          <Text style={[
            styles.balanceValue, 
            balance >= 0 ? styles.positiveBalance : styles.negativeBalance
          ]}>
            {formatAmount(balance)}
          </Text>
        </View>
      </View>
      
      <View style={[styles.section, { backgroundColor: themeColors.card }]}>
        <Text style={[styles.sectionTitle, { color: themeColors.primaryText }]}>{t('home.budgetAnalysis')}</Text>
        <BudgetAnalysisCard budgetData={budgetAnalysis} />
      </View>

      <View style={[styles.section, { backgroundColor: themeColors.card }]}>
        <Text style={[styles.sectionTitle, { color: themeColors.primaryText }]}>{t('home.recentTransactions')}</Text>
        {getRecentTransactions().length > 0 ? (
          getRecentTransactions().map((transaction: any) => (
            renderTransactionItem(transaction, transaction.type as 'income' | 'expense'))
          )
        ) : (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyStateText, { color: themeColors.secondaryText }]}>
              {t('home.noTransactions')}
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: '#3498db',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  appIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  headerTextContainer: {
    flexDirection: 'column',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 5,
  },
  logoutButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  logoutText: {
    color: 'white',
    fontWeight: 'bold',
  },
  errorContainer: {
    margin: 15,
    padding: 10,
    backgroundColor: '#ffdddd',
    borderRadius: 5,
    borderLeftWidth: 5,
    borderLeftColor: '#e74c3c',
  },
  errorText: {
    color: '#c0392b',
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    margin: 15,
  },
  summaryCard: {
    flex: 1,
    padding: 15,
    backgroundColor: 'white',
    borderRadius: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
  },
  incomeValue: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 5,
    color: '#2ecc71',
  },
  expenseValue: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 5,
    color: '#e74c3c',
  },
  balanceValue: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 5,
  },
  positiveBalance: {
    color: '#2ecc71',
  },
  negativeBalance: {
    color: '#e74c3c',
  },
  section: {
    margin: 15,
    marginTop: 5,
    padding: 15,
    backgroundColor: 'white',
    borderRadius: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  transactionCategory: {
    fontSize: 16,
    fontWeight: '500',
  },
  transactionDate: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  transactionDescription: {
    fontSize: 14,
    marginTop: 4,
  },
  transactionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    marginLeft: 8,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    padding: 20,
  },
  emptyStateText: {
    color: '#999',
    fontSize: 16,
  },
  retryButton: {
    backgroundColor: '#3498db',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginTop: 10,
  },
  retryText: {
    color: 'white',
    fontWeight: 'bold',
  },
  budgetCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  budgetHeader: {
    marginBottom: 15,
  },
  budgetTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  budgetPeriod: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  budgetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  budgetLabel: {
    fontSize: 15,
    color: '#555',
  },
  budgetIncomeValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2ecc71',
  },
  budgetExpenseValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#e74c3c',
  },
  budgetProgressContainer: {
    marginVertical: 10,
  },
  budgetProgressLabel: {
    fontSize: 14,
    color: '#555',
    marginBottom: 5,
  },
  budgetProgressBar: {
    height: 10,
    borderRadius: 5,
    backgroundColor: '#e0e0e0',
  },
  budgetSummaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 15,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  budgetSummaryItem: {
    alignItems: 'center',
  },
  budgetSummaryValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  budgetSummaryLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  topExpenseContainer: {
    marginTop: 5,
  },
  topExpenseTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  topExpenseItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  topExpenseCategory: {
    fontSize: 14,
    color: '#555',
  },
  topExpenseAmount: {
    fontSize: 14,
    fontWeight: '500',
    color: '#e74c3c',
  },
});

export default HomeScreen; 