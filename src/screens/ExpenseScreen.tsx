import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { expenseAPI } from '../utils/api';
import { useTheme, lightTheme, darkTheme } from '../utils/ThemeContext';
import { useLocalization } from '../utils/LocalizationContext';
import { useCurrency } from '../utils/CurrencyContext';
import { useFocusEffect } from '@react-navigation/native';

interface ExpenseRecord {
  id: number;
  amount: number;
  category: string;
  date: string;
  description: string;
}

const ExpenseScreen = () => {
  const { isDarkMode } = useTheme();
  const { t } = useLocalization();
  const { currency, formatAmount, getCurrencySymbol } = useCurrency();
  const themeColors = isDarkMode ? darkTheme : lightTheme;
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('food');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [expenseHistory, setExpenseHistory] = useState<ExpenseRecord[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const categories = [
    { id: 'food', label: t('expenseCategories.food') },
    { id: 'transport', label: t('expenseCategories.transport') },
    { id: 'housing', label: t('expenseCategories.housing') },
    { id: 'entertainment', label: t('expenseCategories.entertainment') },
    { id: 'shopping', label: t('expenseCategories.shopping') },
    { id: 'utilities', label: t('expenseCategories.utilities') },
    { id: 'otherExpense', label: t('expenseCategories.otherExpense') }
  ];

  // 获取历史记录
  const fetchExpenseHistory = React.useCallback(async () => {
    setIsLoadingHistory(true);
    try {
      const data = await expenseAPI.getExpenses();
      if (Array.isArray(data)) {
        // 处理数据，确保金额是数字
        const processedData = data.map(expense => ({
          ...expense,
          amount: typeof expense.amount === 'string' ? parseFloat(expense.amount) : expense.amount
        }));
        // 按日期排序，最新的在前面
        processedData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setExpenseHistory(processedData);
      } else {
        setExpenseHistory([]);
      }
    } catch (error) {
      console.error('Failed to fetch expense history:', error);
      Alert.alert(t('common.error'), t('expenses.fetchFailed'));
    } finally {
      setIsLoadingHistory(false);
    }
  }, [t]);

  // 组件挂载和页面聚焦时获取历史记录
  useFocusEffect(
    React.useCallback(() => {
      fetchExpenseHistory();
      return () => {
        // 清理函数
      };
    }, [fetchExpenseHistory])
  );

  const handleAddExpense = async () => {
    if (!amount || isNaN(Number(amount))) {
      Alert.alert(t('common.error'), t('expenses.invalidAmount'));
      return;
    }

    if (!description) {
      Alert.alert(t('common.error'), t('expenses.descriptionRequired'));
      return;
    }

    setIsLoading(true);
    try {
      // Format date properly
      let formattedDate = date;
      if (date.includes('T')) {
        formattedDate = date.split('T')[0];
      } else if (date.length > 10) {
        try {
          const dateObj = new Date(date);
          formattedDate = dateObj.toISOString().split('T')[0];
        } catch (e) {
          console.error('Invalid date format:', date);
        }
      }
      
      // Call API to add expense record
      await expenseAPI.addExpense({
        amount: Number(amount),
        category,
        date: formattedDate,
        description
      });
      
      Alert.alert(t('common.success'), t('expenses.addSuccess'));
      
      // 重新获取历史记录以刷新列表
      fetchExpenseHistory();
      
      // Reset form
      setAmount('');
      setDescription('');
      setCategory('food');
      setDate(new Date().toISOString().split('T')[0]);
    } catch (error) {
      console.error('Failed to add expense record:', error);
      Alert.alert(t('common.error'), t('expenses.addFailed'));
    } finally {
      setIsLoading(false);
    }
  };

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
            setIsLoading(true);
            try {
              await expenseAPI.deleteExpense(id);
              Alert.alert(t('common.success'), t('expenses.deleteSuccess'));
              fetchExpenseHistory();
            } catch (error) {
              console.error('Failed to delete expense:', error);
              Alert.alert(t('common.error'), t('expenses.deleteFailed'));
            } finally {
              setIsLoading(false);
            }
          }
        }
      ]
    );
  };

  const handleEditExpense = (item: ExpenseRecord) => {
    setAmount(item.amount.toString());
    setDescription(item.description);
    
    // Normalize category to match our category IDs
    const normalizedCategory = item.category.toLowerCase();
    // Find matching category ID, or use the normalized category string if not found
    const matchingCategory = categories.find(cat => 
      cat.id.toLowerCase() === normalizedCategory || 
      cat.label.toLowerCase() === normalizedCategory
    );
    setCategory(matchingCategory ? matchingCategory.id : normalizedCategory);
    
    // Format date to ensure it's in YYYY-MM-DD format
    let formattedDate = item.date;
    if (item.date.includes('T')) {
      formattedDate = item.date.split('T')[0];
    } else if (item.date.length > 10) {
      try {
        const dateObj = new Date(item.date);
        formattedDate = dateObj.toISOString().split('T')[0];
      } catch (e) {
        console.error('Invalid date format:', item.date);
      }
    }
    setDate(formattedDate);
    
    setEditingId(item.id);
  };

  const handleUpdateExpense = async () => {
    if (!amount || isNaN(Number(amount))) {
      Alert.alert(t('common.error'), t('expenses.invalidAmount'));
      return;
    }

    if (!description) {
      Alert.alert(t('common.error'), t('expenses.descriptionRequired'));
      return;
    }

    setIsLoading(true);
    try {
      // Find the matching category object to get the correct ID or label
      const categoryData = categories.find(cat => cat.id === category);
      const categoryToSend = categoryData ? categoryData.id : category;
      
      // Format date to ensure it's in YYYY-MM-DD format
      let formattedDate = date;
      if (date.includes('T')) {
        // If the date contains 'T', it's likely an ISO string, so extract just the date part
        formattedDate = date.split('T')[0];
      } else if (date.length > 10) {
        // If it's a longer string but not ISO format, try to parse and format it
        try {
          const dateObj = new Date(date);
          formattedDate = dateObj.toISOString().split('T')[0];
        } catch (e) {
          console.error('Invalid date format:', date);
          // Keep original value if parsing fails
        }
      }
      
      console.log('Updating expense with category:', categoryToSend, 'and date:', formattedDate);
      
      await expenseAPI.updateExpense(editingId!, {
        amount: Number(amount),
        category: categoryToSend,
        date: formattedDate,
        description
      });
      
      Alert.alert(t('common.success'), t('expenses.updateSuccess'));
      setEditingId(null);
      setAmount('');
      setDescription('');
      setCategory('food');
      setDate(new Date().toISOString().split('T')[0]);
      fetchExpenseHistory();
    } catch (error) {
      console.error('Failed to update expense:', error);
      Alert.alert(t('common.error'), t('expenses.updateFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  // 渲染历史记录项
  const renderHistoryItem = (item: ExpenseRecord) => (
    <View style={[styles.historyItem, { backgroundColor: themeColors.card, borderBottomColor: themeColors.border }]}>
      <View style={styles.historyItemHeader}>
        <Text style={[styles.historyCategory, { color: themeColors.primaryText }]}>
          {t(`expenseCategories.${item.category.toLowerCase()}`) || item.category}
        </Text>
        <Text style={[styles.historyAmount, { color: themeColors.danger }]}>
          -{formatAmount(item.amount)}
        </Text>
      </View>
      <Text style={[styles.historyDescription, { color: themeColors.primaryText }]}>{item.description}</Text>
      <Text style={[styles.historyDate, { color: themeColors.secondaryText }]}>{new Date(item.date).toLocaleDateString()}</Text>
      
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: themeColors.primary }]}
          onPress={() => handleEditExpense(item)}
        >
          <Text style={styles.actionButtonText}>{t('common.edit')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: themeColors.danger }]}
          onPress={() => handleDeleteExpense(item.id)}
        >
          <Text style={styles.actionButtonText}>{t('common.delete')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <ScrollView style={[styles.container, { backgroundColor: themeColors.background }]}>
      <View style={[styles.header, { backgroundColor: themeColors.danger }]}>
        <Text style={styles.headerTitle}>
          {editingId ? t('expenses.editExpense') : t('expenses.addExpense')}
        </Text>
      </View>

      <View style={[styles.form, { 
        backgroundColor: themeColors.card,
        shadowColor: isDarkMode ? 'rgba(0, 0, 0, 0.5)' : '#000',
      }]}>
        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: themeColors.primaryText }]}>
            {t('expenses.amount')} ({getCurrencySymbol(currency)})
          </Text>
          <TextInput
            style={[styles.input, { 
              borderColor: themeColors.border,
              backgroundColor: isDarkMode ? themeColors.card : '#fff',
              color: themeColors.primaryText
            }]}
            value={amount}
            onChangeText={setAmount}
            placeholder="0.00"
            placeholderTextColor={themeColors.secondaryText}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: themeColors.primaryText }]}>{t('expenses.description')}</Text>
          <TextInput
            style={[styles.input, { 
              borderColor: themeColors.border,
              backgroundColor: isDarkMode ? themeColors.card : '#fff',
              color: themeColors.primaryText
            }]}
            value={description}
            onChangeText={setDescription}
            placeholder={t('expenses.description')}
            placeholderTextColor={themeColors.secondaryText}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: themeColors.primaryText }]}>{t('expenses.category')}</Text>
          <View style={styles.categoryContainer}>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.categoryButton,
                  { backgroundColor: isDarkMode ? themeColors.border : '#f0f0f0' },
                  category === cat.id && [styles.categoryButtonActive, { backgroundColor: themeColors.danger }],
                ]}
                onPress={() => setCategory(cat.id)}
              >
                <Text
                  style={[
                    styles.categoryButtonText,
                    { color: themeColors.primaryText },
                    category === cat.id && styles.categoryButtonTextActive,
                  ]}
                >
                  {cat.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: themeColors.primaryText }]}>{t('expenses.date')}</Text>
          <TextInput
            style={[styles.input, { 
              borderColor: themeColors.border,
              backgroundColor: isDarkMode ? themeColors.card : '#fff',
              color: themeColors.primaryText
            }]}
            value={date}
            onChangeText={(text) => {
              // If user enters a date in a different format, try to standardize it
              if (text.includes('/') || text.includes('.')) {
                // Try to convert other date formats (MM/DD/YYYY or DD.MM.YYYY) to YYYY-MM-DD
                try {
                  const dateObj = new Date(text);
                  if (!isNaN(dateObj.getTime())) {
                    setDate(dateObj.toISOString().split('T')[0]);
                    return;
                  }
                } catch (e) {
                  // If parsing fails, just set the text as is
                }
              }
              // Otherwise just set the text as entered
              setDate(text);
            }}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={themeColors.secondaryText}
          />
          <Text style={[styles.dateFormatHint, { color: themeColors.secondaryText }]}>
            {t('expenses.dateFormat')}
          </Text>
        </View>

        <View style={styles.formGroup}>
          <TouchableOpacity 
            style={[
              styles.addButton, 
              { backgroundColor: themeColors.danger },
              isLoading && styles.disabledButton,
            ]}
            onPress={editingId ? handleUpdateExpense : handleAddExpense}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <Text style={styles.addButtonText}>
                {editingId ? t('common.update') : t('common.add')}
              </Text>
            )}
          </TouchableOpacity>

          {editingId && (
            <TouchableOpacity 
              style={[styles.cancelButton, { backgroundColor: '#95a5a6' }]}
              onPress={() => {
                setEditingId(null);
                setAmount('');
                setDescription('');
                setCategory('food');
                setDate(new Date().toISOString().split('T')[0]);
              }}
            >
              <Text style={styles.addButtonText}>
                {t('common.cancel')}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={[styles.historySection, { backgroundColor: themeColors.card }]}>
        <Text style={[styles.historySectionTitle, { color: themeColors.primaryText }]}>
          {t('expenses.expenseHistory')}
        </Text>
        
        {isLoadingHistory ? (
          <ActivityIndicator 
            color={themeColors.primary} 
            size="large" 
            style={styles.loadingIndicator} 
          />
        ) : expenseHistory.length > 0 ? (
          expenseHistory.map(item => (
            <View key={item.id}>
              {renderHistoryItem(item)}
            </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyStateText, { color: themeColors.secondaryText }]}>
              {t('expenses.noExpenses')}
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
  header: {
    padding: 20,
    backgroundColor: '#e74c3c',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  form: {
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
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 5,
  },
  categoryButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    marginRight: 10,
    marginBottom: 10,
  },
  categoryButtonActive: {
    backgroundColor: '#e74c3c',
  },
  categoryButtonText: {
    color: '#333',
  },
  categoryButtonTextActive: {
    color: 'white',
  },
  addButton: {
    backgroundColor: '#e74c3c',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  disabledButton: {
    backgroundColor: '#95a5a6',
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  historySection: {
    margin: 15,
    padding: 15,
    borderRadius: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  historySectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  historyItem: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    marginBottom: 8,
    width: '100%',
  },
  historyItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  historyCategory: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
  },
  historyAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#e74c3c',
    marginLeft: 8,
  },
  historyDescription: {
    fontSize: 14,
    marginTop: 4,
    width: '100%',
  },
  historyDate: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
    width: '100%',
  },
  loadingIndicator: {
    padding: 20,
    alignItems: 'center',
  },
  emptyState: {
    padding: 20,
    alignItems: 'center',
  },
  emptyStateText: {
    color: '#999',
    fontSize: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
    width: '100%',
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    marginLeft: 8,
    minWidth: 60,
    alignItems: 'center',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  cancelButton: {
    backgroundColor: '#95a5a6',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  dateFormatHint: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
});

export default ExpenseScreen; 