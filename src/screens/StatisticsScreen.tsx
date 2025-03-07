import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import { incomeAPI, expenseAPI } from '../utils/api';
import { useFocusEffect } from '@react-navigation/native';

const StatisticsScreen = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [incomeData, setIncomeData] = useState({
    total: 0,
    categories: [] as { name: string; amount: number; percentage: number }[],
  });
  const [expenseData, setExpenseData] = useState({
    total: 0,
    categories: [] as { name: string; amount: number; percentage: number }[],
  });
  const [error, setError] = useState<string | null>(null);

  const balance = incomeData.total - expenseData.total;
  const savingsRate = incomeData.total > 0 ? ((balance / incomeData.total) * 100).toFixed(1) : '0.0';

  // Fetch data from backend
  const fetchData = async () => {
    try {
      setError(null);
      console.log('正在获取统计数据...');
      
      // Get income data
      const incomesData = await incomeAPI.getIncomes();
      console.log('收入数据:', incomesData);
      
      // 确保incomesData是数组
      const safeIncomesData = Array.isArray(incomesData) ? incomesData : [];
      
      // Calculate total income
      const totalIncome = safeIncomesData.reduce((sum: number, income: any) => sum + income.amount, 0);
      
      // Group incomes by category and calculate percentages
      const incomeCategories = {} as Record<string, number>;
      safeIncomesData.forEach((income: any) => {
        if (incomeCategories[income.category]) {
          incomeCategories[income.category] += income.amount;
        } else {
          incomeCategories[income.category] = income.amount;
        }
      });
      
      const incomeCategoriesArray = Object.keys(incomeCategories).map(category => {
        const amount = incomeCategories[category];
        const percentage = totalIncome > 0 ? (amount / totalIncome) * 100 : 0;
        return {
          name: category,
          amount,
          percentage: parseFloat(percentage.toFixed(1)),
        };
      });
      
      // Sort by amount (highest first)
      incomeCategoriesArray.sort((a, b) => b.amount - a.amount);
      
      setIncomeData({
        total: totalIncome,
        categories: incomeCategoriesArray,
      });
      
      // Get expense data
      const expensesData = await expenseAPI.getExpenses();
      console.log('支出数据:', expensesData);
      
      // 确保expensesData是数组
      const safeExpensesData = Array.isArray(expensesData) ? expensesData : [];
      
      // Calculate total expenses
      const totalExpense = safeExpensesData.reduce((sum: number, expense: any) => sum + expense.amount, 0);
      
      // Group expenses by category and calculate percentages
      const expenseCategories = {} as Record<string, number>;
      safeExpensesData.forEach((expense: any) => {
        if (expenseCategories[expense.category]) {
          expenseCategories[expense.category] += expense.amount;
        } else {
          expenseCategories[expense.category] = expense.amount;
        }
      });
      
      const expenseCategoriesArray = Object.keys(expenseCategories).map(category => {
        const amount = expenseCategories[category];
        const percentage = totalExpense > 0 ? (amount / totalExpense) * 100 : 0;
        return {
          name: category,
          amount,
          percentage: parseFloat(percentage.toFixed(1)),
        };
      });
      
      // Sort by amount (highest first)
      expenseCategoriesArray.sort((a, b) => b.amount - a.amount);
      
      setExpenseData({
        total: totalExpense,
        categories: expenseCategoriesArray,
      });
      
    } catch (error) {
      console.error('Failed to fetch statistics data:', error);
      setError('Failed to fetch statistics data. Please try again later.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // 使用useFocusEffect代替useEffect，在每次页面聚焦时刷新数据
  useFocusEffect(
    React.useCallback(() => {
      console.log('统计页面获得焦点，刷新数据...');
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

  // Format amount
  const formatAmount = (amount: number) => {
    if (amount === undefined || amount === null) {
      return '$0.00';
    }
    return `$${amount.toFixed(2)}`;
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#9b59b6" />
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
        <Text style={styles.headerTitle}>Financial Statistics</Text>
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Monthly Summary</Text>
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Income</Text>
            <Text style={[styles.summaryValue, { color: '#2ecc71' }]}>
              {formatAmount(incomeData.total)}
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Expenses</Text>
            <Text style={[styles.summaryValue, { color: '#e74c3c' }]}>
              {formatAmount(expenseData.total)}
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
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Savings Rate</Text>
            <Text style={[
              styles.summaryValue, 
              parseFloat(savingsRate) >= 0 ? styles.positiveBalance : styles.negativeBalance
            ]}>
              {savingsRate}%
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Income Breakdown</Text>
        {incomeData.categories.length > 0 ? (
          incomeData.categories.map((category, index) => (
            <View key={index} style={styles.categoryItem}>
              <View style={styles.categoryHeader}>
                <Text style={styles.categoryName}>{category.name}</Text>
                <Text style={styles.categoryAmount}>{formatAmount(category.amount)}</Text>
              </View>
              <View style={styles.progressBarContainer}>
                <View 
                  style={[
                    styles.progressBar, 
                    { width: `${category.percentage}%`, backgroundColor: '#2ecc71' }
                  ]} 
                />
              </View>
              <Text style={styles.categoryPercentage}>{category.percentage}%</Text>
            </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No income records yet</Text>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Expense Breakdown</Text>
        {expenseData.categories.length > 0 ? (
          expenseData.categories.map((category, index) => (
            <View key={index} style={styles.categoryItem}>
              <View style={styles.categoryHeader}>
                <Text style={styles.categoryName}>{category.name}</Text>
                <Text style={styles.categoryAmount}>{formatAmount(category.amount)}</Text>
              </View>
              <View style={styles.progressBarContainer}>
                <View 
                  style={[
                    styles.progressBar, 
                    { width: `${category.percentage}%`, backgroundColor: '#e74c3c' }
                  ]} 
                />
              </View>
              <Text style={styles.categoryPercentage}>{category.percentage}%</Text>
            </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No expense records yet</Text>
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
    backgroundColor: '#9b59b6',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
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
  categoryItem: {
    marginBottom: 15,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '500',
  },
  categoryAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  progressBarContainer: {
    height: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
    marginBottom: 5,
  },
  progressBar: {
    height: 10,
    borderRadius: 5,
  },
  categoryPercentage: {
    fontSize: 12,
    color: '#666',
    textAlign: 'right',
  },
  emptyState: {
    alignItems: 'center',
    padding: 20,
  },
  emptyStateText: {
    color: '#999',
    fontSize: 16,
  },
});

export default StatisticsScreen; 