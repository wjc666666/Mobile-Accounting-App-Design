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

  // Fetch data
  const fetchData = async () => {
    try {
      setError(null);
      console.log('Starting to fetch data...');
      
      // Get income data
      console.log('Fetching income data...');
      const incomesData = await incomeAPI.getIncomes();
      console.log('Income data:', incomesData);
      
      // Debug income data
      if (Array.isArray(incomesData)) {
        console.log('Income data is an array with length:', incomesData.length);
        if (incomesData.length > 0) {
          console.log('First income item:', JSON.stringify(incomesData[0]));
          console.log('First income amount:', incomesData[0].amount);
          console.log('First income amount type:', typeof incomesData[0].amount);
          
          // Convert string amounts to numbers if needed
          const processedIncomes = incomesData.map(income => ({
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
      if (Array.isArray(expensesData)) {
        const processedExpenses = expensesData.map(expense => ({
          ...expense,
          amount: typeof expense.amount === 'string' ? parseFloat(expense.amount) : expense.amount
        }));
        setExpenses(processedExpenses);
      } else {
        setExpenses([]);
      }
      
      // Get budget analysis
      console.log('Fetching budget analysis...');
      const budgetData = await budgetAPI.getBudgetAnalysis();
      console.log('Budget analysis:', budgetData);
      setBudgetAnalysis(budgetData || {});
      
      console.log('All data fetched');
    } catch (error: any) {
      console.error('Fetch data failed:', error);
      let errorMessage = 'Failed to fetch data. Please try again later.';
      if (error.response) {
        // 服务器响应了，但状态码不在2xx范围内
        errorMessage = `Server error: ${error.response.status} - ${error.response.data.error || error.response.statusText}`;
        console.error('Error response:', error.response.data);
      } else if (error.request) {
        // 请求已发送，但没有收到响应
        errorMessage = 'No response from server. Please check your connection.';
        console.error('No response:', error.request);
      } else {
        // 设置请求时发生了错误
        errorMessage = `Error: ${error.message}`;
      }
      setError(errorMessage);
    }
  };

  // Use useFocusEffect to refresh data when screen is focused
  useFocusEffect(
    React.useCallback(() => {
      console.log('Main page gained focus, refreshing data...');
      setIsLoading(true);
      fetchData().finally(() => {
        setIsLoading(false);
        setIsRefreshing(false);
        console.log('Data refresh completed');
        
        // Debug the state after data is loaded
        setTimeout(() => {
          console.log('After refresh - Income length:', incomes.length);
          console.log('After refresh - Total income:', totalIncome);
        }, 100); // Small delay to ensure state is updated
      });
      return () => {
        // Cleanup when screen loses focus
      };
    }, []) // We intentionally only want this to run when the screen is focused, not on every state change
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
  const formatAmount = (amount: number | undefined | null) => {
    // Check for undefined, null, or NaN
    if (amount === undefined || amount === null || isNaN(amount)) {
      console.log('Invalid amount detected:', amount);
      return '$0.00';
    }
    try {
      // Ensure amount is a number
      const numAmount = Number(amount);
      return `$${numAmount.toFixed(2)}`;
    } catch (error) {
      console.error('Format amount error:', error, 'Amount value:', amount);
      return '$0.00';
    }
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