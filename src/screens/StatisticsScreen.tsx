import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import { incomeAPI, expenseAPI } from '../utils/api';
import { useFocusEffect } from '@react-navigation/native';
import ImportTransactions from '../components/ImportTransactions';

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
      console.log('Fetching statistics data...');
      
      // Get income data
      console.log('Calling incomeAPI.getIncomes()...');
      const incomesData = await incomeAPI.getIncomes();
      console.log('Raw income data received:', incomesData);
      console.log('Income data type:', typeof incomesData);
      console.log('Is income data array?', Array.isArray(incomesData));
      
      // Ensure incomesData is an array
      const safeIncomesData = Array.isArray(incomesData) ? incomesData : [];
      console.log('Safe income data length:', safeIncomesData.length);
      
      // Debug first income item if available
      if (safeIncomesData.length > 0) {
        console.log('First income item:', JSON.stringify(safeIncomesData[0]));
        console.log('First income amount:', safeIncomesData[0].amount);
        console.log('First income amount type:', typeof safeIncomesData[0].amount);
        
        // Convert string amounts to numbers if needed
        const processedIncomes = safeIncomesData.map((income: any) => {
          let numAmount = 0;
          if (typeof income.amount === 'string') {
            numAmount = parseFloat(income.amount);
            console.log(`Converted string amount "${income.amount}" to number: ${numAmount}`);
          } else if (typeof income.amount === 'number') {
            numAmount = income.amount;
          } else {
            console.log(`Unknown amount type: ${typeof income.amount}, value:`, income.amount);
          }
          
          return {
            ...income,
            amount: numAmount
          };
        });
        
        console.log('Processed incomes:', processedIncomes);
        
        // Calculate total income with processed data
        const totalIncome = processedIncomes.reduce((sum: number, income: any) => {
          return sum + (isNaN(income.amount) ? 0 : income.amount);
        }, 0);
        console.log('Calculated total income:', totalIncome);
        
        // Group incomes by category with processed data
        const incomeCategories = {} as Record<string, number>;
        processedIncomes.forEach((income: any) => {
          const amount = isNaN(income.amount) ? 0 : income.amount;
          if (incomeCategories[income.category]) {
            incomeCategories[income.category] += amount;
          } else {
            incomeCategories[income.category] = amount;
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
        
        console.log('Income categories:', incomeCategoriesArray);
        console.log('Setting income data with total:', totalIncome);
        
        setIncomeData({
          total: totalIncome,
          categories: incomeCategoriesArray,
        });
      } else {
        console.log('No income data available');
        setIncomeData({
          total: 0,
          categories: [],
        });
      }
      
      // Get expense data
      console.log('Calling expenseAPI.getExpenses()...');
      const expensesData = await expenseAPI.getExpenses();
      console.log('Fresh expense data from API:', expensesData);
      
      if (Array.isArray(expensesData) && expensesData.length > 0) {
        // Process expense data
        const processedExpenses = expensesData.map((expense: any) => ({
          ...expense,
          amount: typeof expense.amount === 'string' ? parseFloat(expense.amount) : Number(expense.amount)
        }));
        
        // Calculate total
        const totalExpense = processedExpenses.reduce((sum: number, expense: any) => {
          return sum + (isNaN(expense.amount) ? 0 : expense.amount);
        }, 0);
        
        console.log('Processed total expense:', totalExpense);
        
        // Group by category
        const expenseCategories = {} as Record<string, number>;
        processedExpenses.forEach((expense: any) => {
          const amount = isNaN(expense.amount) ? 0 : expense.amount;
          if (expenseCategories[expense.category]) {
            expenseCategories[expense.category] += amount;
          } else {
            expenseCategories[expense.category] = amount;
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
        
        // Sort by amount
        expenseCategoriesArray.sort((a, b) => b.amount - a.amount);
        
        // Update state
        setExpenseData({
          total: totalExpense,
          categories: expenseCategoriesArray,
        });
        
        console.log('Expense data updated with total:', totalExpense);
      } else {
        console.log('No expense data available from API');
        setExpenseData({
          total: 0,
          categories: [],
        });
      }
      
    } catch (error) {
      console.error('Failed to fetch statistics data:', error);
      setError('Failed to fetch statistics data. Please try again later.');
    }
  };

  // Use useFocusEffect instead of useEffect to refresh data each time the page is focused
  useFocusEffect(
    React.useCallback(() => {
      console.log('Statistics page gained focus, refreshing data...');
      console.log('Current income data before refresh:', incomeData);
      
      const refreshData = async () => {
        try {
          setIsLoading(true);
          
          // Force a fresh data fetch directly from API
          console.log('Forcing fresh data fetch from API...');
          
          // Get income data directly
          const incomesData = await incomeAPI.getIncomes();
          console.log('Fresh income data from API:', incomesData);
          
          if (Array.isArray(incomesData) && incomesData.length > 0) {
            // Process income data
            const processedIncomes = incomesData.map((income: any) => ({
              ...income,
              amount: typeof income.amount === 'string' ? parseFloat(income.amount) : Number(income.amount)
            }));
            
            // Calculate total
            const totalIncome = processedIncomes.reduce((sum: number, income: any) => {
              return sum + (isNaN(income.amount) ? 0 : income.amount);
            }, 0);
            
            console.log('Processed total income:', totalIncome);
            
            // Group by category
            const incomeCategories = {} as Record<string, number>;
            processedIncomes.forEach((income: any) => {
              const amount = isNaN(income.amount) ? 0 : income.amount;
              if (incomeCategories[income.category]) {
                incomeCategories[income.category] += amount;
              } else {
                incomeCategories[income.category] = amount;
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
            
            // Sort by amount
            incomeCategoriesArray.sort((a, b) => b.amount - a.amount);
            
            // Update state
            setIncomeData({
              total: totalIncome,
              categories: incomeCategoriesArray,
            });
            
            console.log('Income data updated with total:', totalIncome);
          } else {
            console.log('No income data available from API');
            setIncomeData({
              total: 0,
              categories: [],
            });
          }
          
          // Similar process for expenses
          const expensesData = await expenseAPI.getExpenses();
          console.log('Fresh expense data from API:', expensesData);
          
          if (Array.isArray(expensesData) && expensesData.length > 0) {
            // Process expense data
            const processedExpenses = expensesData.map((expense: any) => ({
              ...expense,
              amount: typeof expense.amount === 'string' ? parseFloat(expense.amount) : Number(expense.amount)
            }));
            
            // Calculate total
            const totalExpense = processedExpenses.reduce((sum: number, expense: any) => {
              return sum + (isNaN(expense.amount) ? 0 : expense.amount);
            }, 0);
            
            console.log('Processed total expense:', totalExpense);
            
            // Group by category
            const expenseCategories = {} as Record<string, number>;
            processedExpenses.forEach((expense: any) => {
              const amount = isNaN(expense.amount) ? 0 : expense.amount;
              if (expenseCategories[expense.category]) {
                expenseCategories[expense.category] += amount;
              } else {
                expenseCategories[expense.category] = amount;
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
            
            // Sort by amount
            expenseCategoriesArray.sort((a, b) => b.amount - a.amount);
            
            // Update state
            setExpenseData({
              total: totalExpense,
              categories: expenseCategoriesArray,
            });
            
            console.log('Expense data updated with total:', totalExpense);
          } else {
            console.log('No expense data available from API');
            setExpenseData({
              total: 0,
              categories: [],
            });
          }
          
          // Skip calling fetchData again since we've already processed the data
          // await fetchData();
        } finally {
          setIsLoading(false);
          setIsRefreshing(false);
          console.log('Statistics data refresh completed');
          
          // Debug the state after data is loaded
          setTimeout(() => {
            console.log('After refresh - Income data:', incomeData);
            console.log('After refresh - Total income:', incomeData.total);
          }, 100); // Small delay to ensure state is updated
        }
      };
      
      refreshData();
      
      return () => {
        // Cleanup when screen loses focus
      };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []) // Intentionally empty dependency array - we want this to run only on focus
  );

  // Pull to refresh
  const onRefresh = () => {
    setIsRefreshing(true);
    fetchData();
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
        <ImportTransactions onImportSuccess={fetchData} />
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 10,
    position: 'relative',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    flex: 1,
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