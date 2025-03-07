import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, RefreshControl, TouchableOpacity } from 'react-native';
import { incomeAPI, expenseAPI, budgetAPI } from '../utils/api';
import { useAuth } from '../utils/AuthContext';
import { useFocusEffect } from '@react-navigation/native';

interface Transaction {
  id: number;
  amount: number;
  category: string;
  date: string;
  description: string;
}

const HomeScreen = () => {
  const { user, logout } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [incomes, setIncomes] = useState<Transaction[]>([]);
  const [expenses, setExpenses] = useState<Transaction[]>([]);
  const [budgetAnalysis, setBudgetAnalysis] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // 确保incomes和expenses是数组
  const safeIncomes = Array.isArray(incomes) ? incomes : [];
  const safeExpenses = Array.isArray(expenses) ? expenses : [];

  // Calculate total income
  const totalIncome = safeIncomes.reduce((sum, income) => sum + income.amount, 0);
  
  // Calculate total expenses
  const totalExpense = safeExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  
  // Calculate balance
  const balance = totalIncome - totalExpense;

  // Fetch data
  const fetchData = async () => {
    try {
      setError(null);
      console.log('开始获取数据...');
      
      // Get income data
      console.log('获取收入数据...');
      const incomesData = await incomeAPI.getIncomes();
      console.log('收入数据:', incomesData);
      setIncomes(Array.isArray(incomesData) ? incomesData : []);
      
      // Get expense data
      console.log('获取支出数据...');
      const expensesData = await expenseAPI.getExpenses();
      console.log('支出数据:', expensesData);
      setExpenses(Array.isArray(expensesData) ? expensesData : []);
      
      // Get budget analysis
      console.log('获取预算分析...');
      const budgetData = await budgetAPI.getBudgetAnalysis();
      console.log('预算分析:', budgetData);
      setBudgetAnalysis(budgetData || {});
      
      console.log('所有数据获取完成');
    } catch (error: any) {
      console.error('获取数据失败:', error);
      let errorMessage = 'Failed to fetch data. Please try again later.';
      if (error.response) {
        // 服务器响应了，但状态码不在2xx范围内
        errorMessage = `Server error: ${error.response.status} - ${error.response.data.error || error.response.statusText}`;
        console.error('错误响应:', error.response.data);
      } else if (error.request) {
        // 请求已发送，但没有收到响应
        errorMessage = 'No response from server. Please check your connection.';
        console.error('无响应:', error.request);
      } else {
        // 设置请求时发生了错误
        errorMessage = `Error: ${error.message}`;
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Fetch data on component mount and when screen is focused
  useFocusEffect(
    React.useCallback(() => {
      console.log('主页面获得焦点，刷新数据...');
      fetchData();
      return () => {
        // 页面失去焦点时的清理工作（如果需要）
      };
    }, [])
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

  // Format amount
  const formatAmount = (amount: number) => {
    if (amount === undefined || amount === null) {
      return '$0.00';
    }
    return `$${amount.toFixed(2)}`;
  };

  // Get recent transactions
  const getRecentTransactions = () => {
    const allTransactions = [
      ...safeIncomes.map(income => ({ ...income, type: 'income' })),
      ...safeExpenses.map(expense => ({ ...expense, type: 'expense' }))
    ];
    
    // Sort by date, newest first
    return allTransactions
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5); // Only show the 5 most recent
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3498db" />
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>JCEco Finance</Text>
          <Text style={styles.headerSubtitle}>
            {user ? `Welcome back, ${user.username}` : 'Your Personal Finance Assistant'}
          </Text>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
      
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton} 
            onPress={() => {
              setIsLoading(true);
              fetchData();
            }}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}
      
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Monthly Overview</Text>
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Income</Text>
            <Text style={[styles.summaryValue, { color: '#2ecc71' }]}>
              {formatAmount(totalIncome)}
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Expenses</Text>
            <Text style={[styles.summaryValue, { color: '#e74c3c' }]}>
              {formatAmount(totalExpense)}
            </Text>
          </View>
        </View>
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Balance</Text>
            <Text style={[
              styles.summaryValue, 
              balance >= 0 ? styles.positiveBalance : styles.negativeBalance
            ]}>
              {formatAmount(balance)}
            </Text>
          </View>
        </View>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Transactions</Text>
        {getRecentTransactions().length > 0 ? (
          getRecentTransactions().map((transaction: any) => (
            <View key={`${transaction.type}-${transaction.id}`} style={styles.transactionItem}>
              <View>
                <Text style={styles.transactionCategory}>{transaction.category}</Text>
                <Text style={styles.transactionDate}>
                  {new Date(transaction.date).toLocaleDateString()}
                </Text>
              </View>
              <Text style={[
                styles.transactionAmount,
                transaction.type === 'income' ? styles.incomeText : styles.expenseText
              ]}>
                {transaction.type === 'income' ? '+' : '-'}{formatAmount(transaction.amount)}
              </Text>
            </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No transactions yet</Text>
          </View>
        )}
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Budget Status</Text>
        {budgetAnalysis ? (
          <View>
            <Text>Budget analysis data will be displayed here</Text>
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No budget set</Text>
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
  summaryCard: {
    margin: 15,
    padding: 15,
    backgroundColor: 'white',
    borderRadius: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  summaryItem: {
    flex: 1,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
  },
  summaryValue: {
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
  incomeText: {
    color: '#2ecc71',
  },
  expenseText: {
    color: '#e74c3c',
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
  retryButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default HomeScreen; 