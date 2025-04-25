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
  const [category, setCategory] = useState(t('food'));
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [expenseHistory, setExpenseHistory] = useState<ExpenseRecord[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  const categories = [
    { id: 'food', label: t('food') },
    { id: 'transport', label: t('transport') },
    { id: 'housing', label: t('housing') },
    { id: 'entertainment', label: t('entertainment') },
    { id: 'shopping', label: t('shopping') },
    { id: 'utilities', label: t('utilities') },
    { id: 'other', label: t('otherExpense') }
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
      Alert.alert(t('error'), t('failedToAddExpense'));
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
      Alert.alert(t('error'), t('enterValidAmount'));
      return;
    }

    if (!description) {
      Alert.alert(t('error'), t('enterDescription'));
      return;
    }

    setIsLoading(true);
    try {
      // Call API to add expense record
      await expenseAPI.addExpense({
        amount: Number(amount),
        category,
        date,
        description
      });
      
      Alert.alert(t('success'), t('expenseAdded'));
      
      // 重新获取历史记录以刷新列表
      fetchExpenseHistory();
      
      // Reset form
      setAmount('');
      setDescription('');
      setCategory(t('food'));
      setDate(new Date().toISOString().split('T')[0]);
    } catch (error) {
      console.error('Failed to add expense record:', error);
      Alert.alert(t('error'), t('failedToAddExpense'));
    } finally {
      setIsLoading(false);
    }
  };

  // 渲染历史记录项
  const renderHistoryItem = (item: ExpenseRecord) => (
    <View 
      key={item.id}
      style={[styles.historyItem, { backgroundColor: themeColors.card, borderBottomColor: themeColors.border }]}
    >
      <View style={styles.historyItemHeader}>
        <Text style={[styles.historyCategory, { color: themeColors.primaryText }]}>
          {t(item.category.toLowerCase()) || item.category}
        </Text>
        <Text style={[styles.historyAmount, { color: themeColors.danger }]}>
          -{formatAmount(item.amount)}
        </Text>
      </View>
      <Text style={[styles.historyDescription, { color: themeColors.primaryText }]}>{item.description}</Text>
      <Text style={[styles.historyDate, { color: themeColors.secondaryText }]}>{new Date(item.date).toLocaleDateString()}</Text>
    </View>
  );

  return (
    <ScrollView style={[styles.container, { backgroundColor: themeColors.background }]}>
      <View style={[styles.header, { backgroundColor: themeColors.danger }]}>
        <Text style={styles.headerTitle}>{t('addExpense')}</Text>
      </View>

      <View style={[styles.form, { 
        backgroundColor: themeColors.card,
        shadowColor: isDarkMode ? 'rgba(0, 0, 0, 0.5)' : '#000',
      }]}>
        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: themeColors.primaryText }]}>
            {t('amount')} ({getCurrencySymbol(currency)})
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
          <Text style={[styles.label, { color: themeColors.primaryText }]}>{t('description')}</Text>
          <TextInput
            style={[styles.input, { 
              borderColor: themeColors.border,
              backgroundColor: isDarkMode ? themeColors.card : '#fff',
              color: themeColors.primaryText
            }]}
            value={description}
            onChangeText={setDescription}
            placeholder={t('expenseDescription')}
            placeholderTextColor={themeColors.secondaryText}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: themeColors.primaryText }]}>{t('category')}</Text>
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
          <Text style={[styles.label, { color: themeColors.primaryText }]}>{t('date')}</Text>
          <TextInput
            style={[styles.input, { 
              borderColor: themeColors.border,
              backgroundColor: isDarkMode ? themeColors.card : '#fff',
              color: themeColors.primaryText
            }]}
            value={date}
            onChangeText={setDate}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={themeColors.secondaryText}
          />
        </View>

        <TouchableOpacity 
          style={[
            styles.addButton, 
            { backgroundColor: themeColors.danger },
            isLoading && styles.disabledButton,
          ]}
          onPress={handleAddExpense}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <Text style={styles.addButtonText}>{t('add')}</Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={[styles.historySection, { backgroundColor: themeColors.card }]}>
        <Text style={[styles.historySectionTitle, { color: themeColors.primaryText }]}>
          {t('expenseHistory')}
        </Text>
        
        {isLoadingHistory ? (
          <ActivityIndicator 
            color={themeColors.primary} 
            size="large" 
            style={styles.loadingIndicator} 
          />
        ) : expenseHistory.length > 0 ? (
          expenseHistory.map(item => renderHistoryItem(item))
        ) : (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyStateText, { color: themeColors.secondaryText }]}>
              {t('noExpenseRecords')}
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
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    marginBottom: 8,
  },
  historyItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  historyCategory: {
    fontSize: 16,
    fontWeight: '500',
  },
  historyAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#e74c3c',
  },
  historyDescription: {
    fontSize: 14,
    marginTop: 4,
  },
  historyDate: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
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
  }
});

export default ExpenseScreen; 