import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { expenseAPI } from '../utils/api';
import { useTheme, lightTheme, darkTheme } from '../utils/ThemeContext';
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
  const themeColors = isDarkMode ? darkTheme : lightTheme;
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Food');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [expenseHistory, setExpenseHistory] = useState<ExpenseRecord[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  const categories = ['Food', 'Transport', 'Housing', 'Entertainment', 'Shopping', 'Utilities', 'Other'];

  // 获取历史记录
  const fetchExpenseHistory = async () => {
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
      Alert.alert('Error', 'Failed to load expense history');
    } finally {
      setIsLoadingHistory(false);
    }
  };

  // 组件挂载和页面聚焦时获取历史记录
  useFocusEffect(
    React.useCallback(() => {
      fetchExpenseHistory();
      return () => {
        // 清理函数
      };
    }, [])
  );

  const handleAddExpense = async () => {
    if (!amount || isNaN(Number(amount))) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    if (!description) {
      Alert.alert('Error', 'Please enter a description');
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
      
      Alert.alert('Success', 'Expense record added');
      
      // 重新获取历史记录以刷新列表
      fetchExpenseHistory();
      
      // Reset form
      setAmount('');
      setDescription('');
      setCategory('Food');
      setDate(new Date().toISOString().split('T')[0]);
    } catch (error) {
      console.error('Failed to add expense record:', error);
      Alert.alert('Error', 'Failed to add expense record. Please try again');
    } finally {
      setIsLoading(false);
    }
  };

  // 渲染历史记录项
  const renderHistoryItem = ({ item }: { item: ExpenseRecord }) => (
    <View style={[styles.historyItem, { backgroundColor: themeColors.card, borderBottomColor: themeColors.border }]}>
      <View style={styles.historyItemHeader}>
        <Text style={[styles.historyCategory, { color: themeColors.primaryText }]}>{item.category}</Text>
        <Text style={[styles.historyAmount, { color: themeColors.danger }]}>-${item.amount.toFixed(2)}</Text>
      </View>
      <Text style={[styles.historyDescription, { color: themeColors.primaryText }]}>{item.description}</Text>
      <Text style={[styles.historyDate, { color: themeColors.secondaryText }]}>{new Date(item.date).toLocaleDateString()}</Text>
    </View>
  );

  return (
    <ScrollView style={[styles.container, { backgroundColor: themeColors.background }]}>
      <View style={[styles.header, { backgroundColor: themeColors.danger }]}>
        <Text style={styles.headerTitle}>Add Expense</Text>
      </View>

      <View style={[styles.form, { 
        backgroundColor: themeColors.card,
        shadowColor: isDarkMode ? 'rgba(0, 0, 0, 0.5)' : '#000',
      }]}>
        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: themeColors.primaryText }]}>Amount ($)</Text>
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
          <Text style={[styles.label, { color: themeColors.primaryText }]}>Description</Text>
          <TextInput
            style={[styles.input, { 
              borderColor: themeColors.border,
              backgroundColor: isDarkMode ? themeColors.card : '#fff',
              color: themeColors.primaryText
            }]}
            value={description}
            onChangeText={setDescription}
            placeholder="Expense description"
            placeholderTextColor={themeColors.secondaryText}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: themeColors.primaryText }]}>Category</Text>
          <View style={styles.categoryContainer}>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.categoryButton,
                  { backgroundColor: isDarkMode ? themeColors.border : '#f0f0f0' },
                  category === cat && [styles.categoryButtonActive, { backgroundColor: themeColors.danger }],
                ]}
                onPress={() => setCategory(cat)}
              >
                <Text
                  style={[
                    styles.categoryButtonText,
                    { color: themeColors.primaryText },
                    category === cat && styles.categoryButtonTextActive,
                  ]}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: themeColors.primaryText }]}>Date</Text>
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
            isLoading && [styles.addButtonDisabled, { backgroundColor: themeColors.secondaryText }]
          ]} 
          onPress={handleAddExpense}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <Text style={styles.addButtonText}>Add Expense</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* 历史记录部分 */}
      <View style={[styles.historyContainer, { backgroundColor: themeColors.card }]}>
        <Text style={[styles.historyTitle, { color: themeColors.primaryText }]}>Expense History</Text>
        
        {isLoadingHistory ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={themeColors.primary} />
            <Text style={[styles.loadingText, { color: themeColors.secondaryText }]}>Loading history...</Text>
          </View>
        ) : expenseHistory.length > 0 ? (
          expenseHistory.map((item) => (
            <View key={item.id}>
              {renderHistoryItem({ item })}
            </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyStateText, { color: themeColors.secondaryText }]}>No expense records found</Text>
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
  addButtonDisabled: {
    backgroundColor: '#95a5a6',
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // 历史记录样式
  historyContainer: {
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
  historyTitle: {
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
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#999',
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