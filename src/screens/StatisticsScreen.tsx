import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, RefreshControl, TouchableOpacity, Dimensions } from 'react-native';
import { incomeAPI, expenseAPI } from '../utils/api';
import { useTheme, lightTheme, darkTheme } from '../utils/ThemeContext';
import { useLocalization } from '../utils/LocalizationContext';
import { useCurrency } from '../utils/CurrencyContext';
import { useFocusEffect } from '@react-navigation/native';
import ImportTransactions from '../components/ImportTransactions';
import { BarChart } from 'react-native-chart-kit';

// Get screen dimensions
const screenWidth = Dimensions.get('window').width - 30; // Account for margins

const StatisticsScreen = () => {
  const { isDarkMode } = useTheme();
  const { t } = useLocalization();
  const { formatAmount } = useCurrency();
  const themeColors = isDarkMode ? darkTheme : lightTheme;
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
  const [activeTab, setActiveTab] = useState<'income' | 'expense'>('expense');
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

  // Get chart data for current tab
  const getChartData = () => {
    const data = activeTab === 'income' ? incomeData.categories : expenseData.categories;
    
    // Take top 5 categories for better readability
    const topCategories = data
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
    
    const chartData = {
      labels: topCategories.map(cat => {
        // Try to find translation for the category
        const categoryKey = activeTab === 'income' 
          ? `incomeCategories.${cat.name.toLowerCase()}` 
          : `expenseCategories.${cat.name.toLowerCase()}`;
        return t(categoryKey) || cat.name.substring(0, 6);
      }),
      datasets: [
        {
          data: topCategories.map(cat => cat.amount),
        },
      ],
    };

    // Chart configuration
    const chartConfig = {
      backgroundGradientFrom: themeColors.card,
      backgroundGradientTo: themeColors.card,
      color: (opacity = 1) => activeTab === 'income' 
        ? `rgba(46, 204, 113, ${opacity})` // Green for income
        : `rgba(231, 76, 60, ${opacity})`, // Red for expenses
      strokeWidth: 2,
      barPercentage: 0.7,
      decimalPlaces: 0,
      labelColor: () => themeColors.primaryText,
    };

    if (topCategories.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Text style={[styles.emptyStateText, { color: themeColors.secondaryText }]}>
            {t('statistics.noDataAvailable')}
          </Text>
        </View>
      );
    }

    return (
      <BarChart
        data={chartData}
        width={screenWidth}
        height={220}
        chartConfig={chartConfig}
        verticalLabelRotation={30}
        showValuesOnTopOfBars
        fromZero
        yAxisLabel=""
        yAxisSuffix=""
        style={{ marginVertical: 8, borderRadius: 8 }}
      />
    );
  };

  // Render category list with percentage bars
  const renderCategoryList = () => {
    const categories = activeTab === 'income' ? incomeData.categories : expenseData.categories;
    
    if (categories.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Text style={[styles.emptyStateText, { color: themeColors.secondaryText }]}>
            {t('statistics.noDataAvailable')}
          </Text>
        </View>
      );
    }
    
    return (
      <View style={styles.categoryList}>
        {categories.map((category, index) => {
          // Get the appropriate translation key based on category type
          const categoryKey = activeTab === 'income' 
            ? `incomeCategories.${category.name.toLowerCase()}` 
            : `expenseCategories.${category.name.toLowerCase()}`;
          
          return (
            <View key={index} style={styles.categoryItem}>
              <View style={styles.categoryHeader}>
                <Text style={[styles.categoryName, { color: themeColors.primaryText }]}>
                  {t(categoryKey) || category.name}
                </Text>
                <Text style={[styles.categoryAmount, { color: themeColors.primaryText }]}>
                  {formatAmount(category.amount)}
                </Text>
              </View>
              <View style={[styles.percentageBarContainer, { backgroundColor: themeColors.border }]}>
                <View 
                  style={[
                    styles.percentageBar, 
                    { 
                      width: `${category.percentage}%`,
                      backgroundColor: activeTab === 'income' ? '#2ecc71' : '#e74c3c' 
                    }
                  ]} 
                />
              </View>
              <Text style={[styles.percentageText, { color: themeColors.secondaryText }]}>
                {category.percentage}% {t('statistics.percentageOfTotal')}
              </Text>
            </View>
          );
        })}
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
          onRefresh={() => {
            setIsRefreshing(true);
            fetchData().finally(() => setIsRefreshing(false));
          }}
          colors={[themeColors.primary]}
          tintColor={themeColors.primary}
        />
      }
    >
      <View style={[styles.header, { backgroundColor: themeColors.primary }]}>
        <Text style={styles.headerTitle}>{t('statistics.title')}</Text>
        <View style={styles.tabContainer}>
          <TouchableOpacity 
            style={[
              styles.tab, 
              activeTab === 'expense' && [styles.activeTab, { backgroundColor: themeColors.danger }]
            ]}
            onPress={() => setActiveTab('expense')}
          >
            <Text style={[styles.tabText, activeTab === 'expense' && styles.activeTabText]}>
              {t('statistics.expenses')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[
              styles.tab, 
              activeTab === 'income' && [styles.activeTab, { backgroundColor: themeColors.success }]
            ]}
            onPress={() => setActiveTab('income')}
          >
            <Text style={[styles.tabText, activeTab === 'income' && styles.activeTabText]}>
              {t('statistics.income')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      
      {error && (
        <View style={[styles.errorCard, { backgroundColor: themeColors.card }]}>
          <Text style={[styles.errorText, { color: themeColors.danger }]}>{error}</Text>
          <TouchableOpacity 
            style={[styles.retryButton, { backgroundColor: themeColors.primary }]} 
            onPress={() => {
              setIsLoading(true);
              fetchData().finally(() => setIsLoading(false));
            }}
          >
            <Text style={styles.retryButtonText}>{t('common.retry')}</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={[styles.summaryCard, { backgroundColor: themeColors.card }]}>
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryLabel, { color: themeColors.secondaryText }]}>
              {t('statistics.income')}
            </Text>
            <Text style={[styles.incomeValue, { color: themeColors.success }]}>
              {formatAmount(incomeData.total)}
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryLabel, { color: themeColors.secondaryText }]}>
              {t('statistics.expenses')}
            </Text>
            <Text style={[styles.expenseValue, { color: themeColors.danger }]}>
              {formatAmount(expenseData.total)}
            </Text>
          </View>
        </View>
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryLabel, { color: themeColors.secondaryText }]}>
              {t('statistics.balance')}
            </Text>
            <Text style={[
              styles.balanceValue, 
              { color: balance >= 0 ? themeColors.success : themeColors.danger }
            ]}>
              {formatAmount(balance)}
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryLabel, { color: themeColors.secondaryText }]}>
              {t('statistics.savingRate')}
            </Text>
            <Text style={[
              styles.rateValue, 
              { color: parseFloat(savingsRate) >= 0 ? themeColors.success : themeColors.danger }
            ]}>
              {savingsRate}%
            </Text>
          </View>
        </View>
      </View>

      <View style={[styles.chartsCard, { backgroundColor: themeColors.card }]}>
        <Text style={[styles.sectionTitle, { color: themeColors.primaryText }]}>
          {activeTab === 'expense' ? t('statistics.expenseByCategory') : t('statistics.incomeByCategory')}
        </Text>
        {getChartData()}
      </View>

      <View style={[styles.categoriesCard, { backgroundColor: themeColors.card }]}>
        <Text style={[styles.sectionTitle, { color: themeColors.primaryText }]}>
          {activeTab === 'expense' ? t('statistics.expenseDetails') : t('statistics.incomeDetails')}
        </Text>
        {renderCategoryList()}
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: themeColors.primaryText }]}>
          {t('statistics.importTransactions')}
        </Text>
        <ImportTransactions onImportSuccess={() => {
          setIsLoading(true);
          fetchData().finally(() => setIsLoading(false));
        }} />
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
    backgroundColor: '#3498db',
    padding: 15,
    paddingTop: 25,
    paddingBottom: 25,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  summaryCard: {
    flex: 1,
    backgroundColor: 'white',
    padding: 15,
    margin: 5,
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  incomeValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2ecc71',
  },
  expenseValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#e74c3c',
  },
  balanceValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  rateValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    margin: 15,
    marginBottom: 5,
    borderRadius: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  tab: {
    flex: 1,
    padding: 15,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#3498db',
  },
  tabText: {
    fontSize: 16,
    color: '#333',
  },
  activeTabText: {
    color: 'white',
    fontWeight: 'bold',
  },
  chartsCard: {
    backgroundColor: 'white',
    padding: 15,
    margin: 15,
    marginTop: 5,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  categoriesCard: {
    backgroundColor: 'white',
    padding: 15,
    margin: 15,
    marginTop: 5,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  categoryList: {
    marginTop: 5,
  },
  categoryItem: {
    marginBottom: 15,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  categoryAmount: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  percentageBarContainer: {
    height: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
    marginTop: 5,
    overflow: 'hidden',
  },
  percentageBar: {
    height: '100%',
  },
  percentageText: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
    textAlign: 'right',
  },
  errorCard: {
    margin: 15,
    padding: 15,
    backgroundColor: '#ffecec',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#e74c3c',
  },
  errorText: {
    color: '#c0392b',
  },
  retryButton: {
    backgroundColor: '#e74c3c',
    padding: 8,
    borderRadius: 4,
    alignSelf: 'flex-end',
    marginTop: 10,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  section: {
    margin: 15,
    marginTop: 5,
  },
  emptyState: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateText: {
    color: '#999',
    fontSize: 16,
  },
});

export default StatisticsScreen; 