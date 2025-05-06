import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { incomeAPI } from '../utils/api';
import { useTheme, lightTheme, darkTheme } from '../utils/ThemeContext';
import { useLocalization } from '../utils/LocalizationContext';
import { useCurrency } from '../utils/CurrencyContext';
import { useFocusEffect } from '@react-navigation/native';

interface IncomeRecord {
  id: number;
  amount: number;
  category: string;
  date: string;
  description: string;
}

const IncomeScreen = () => {
  const { isDarkMode } = useTheme();
  const { t } = useLocalization();
  const { currency, formatAmount, getCurrencySymbol } = useCurrency();
  const themeColors = isDarkMode ? darkTheme : lightTheme;
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('salary');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [incomeHistory, setIncomeHistory] = useState<IncomeRecord[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const categories = [
    { id: 'salary', label: t('incomeCategories.salary') },
    { id: 'bonus', label: t('incomeCategories.bonus') },
    { id: 'investment', label: t('incomeCategories.investment') },
    { id: 'freelance', label: t('incomeCategories.freelance') },
    { id: 'other', label: t('incomeCategories.otherIncome') }
  ];

  // 获取历史记录
  const fetchIncomeHistory = async () => {
    setIsLoadingHistory(true);
    try {
      const data = await incomeAPI.getIncomes();
      if (Array.isArray(data)) {
        // 处理数据，确保金额是数字
        const processedData = data.map(income => ({
          ...income,
          amount: typeof income.amount === 'string' ? parseFloat(income.amount) : income.amount
        }));
        // 按日期排序，最新的在前面
        processedData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setIncomeHistory(processedData);
      } else {
        setIncomeHistory([]);
      }
    } catch (error) {
      console.error('Failed to fetch income history:', error);
      Alert.alert('Error', 'Failed to load income history');
    } finally {
      setIsLoadingHistory(false);
    }
  };

  // 组件挂载和页面聚焦时获取历史记录
  useFocusEffect(
    React.useCallback(() => {
      fetchIncomeHistory();
      return () => {
        // 清理函数
      };
    }, [])
  );

  const handleAddIncome = async () => {
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
      // Format date to ensure it's in YYYY-MM-DD format
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
      
      // Call API to add income record
      await incomeAPI.addIncome({
        amount: Number(amount),
        category,
        date: formattedDate,
        description
      });
      
      Alert.alert('Success', 'Income record added');
      
      // 重新获取历史记录以刷新列表
      fetchIncomeHistory();
      
      // Reset form
      setAmount('');
      setDescription('');
      setCategory('salary');
      setDate(new Date().toISOString().split('T')[0]);
    } catch (error) {
      console.error('Failed to add income record:', error);
      Alert.alert('Error', 'Failed to add income record. Please try again');
    } finally {
      setIsLoading(false);
    }
  };

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
            setIsLoading(true);
            try {
              await incomeAPI.deleteIncome(id);
              Alert.alert(t('common.success'), t('income.deleteSuccess'));
              fetchIncomeHistory();
            } catch (error) {
              console.error('Failed to delete income:', error);
              Alert.alert(t('common.error'), t('income.deleteFailed'));
            } finally {
              setIsLoading(false);
            }
          }
        }
      ]
    );
  };

  const handleEditIncome = (item: IncomeRecord) => {
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

  const handleUpdateIncome = async () => {
    if (!amount || isNaN(Number(amount))) {
      Alert.alert(t('common.error'), t('income.invalidAmount'));
      return;
    }

    if (!description) {
      Alert.alert(t('common.error'), t('income.descriptionRequired'));
      return;
    }

    setIsLoading(true);
    try {
      // Find the matching category object to get the correct ID or label
      const categoryData = categories.find(cat => cat.id === category);
      const categoryToSend = categoryData ? categoryData.id : category;
      
      // Format date to ensure it's in YYYY-MM-DD format
      // This handles both ISO strings and date objects
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
      
      console.log('Updating income with category:', categoryToSend, 'and date:', formattedDate);
      
      await incomeAPI.updateIncome(editingId!, {
        amount: Number(amount),
        category: categoryToSend,
        date: formattedDate,
        description
      });
      
      Alert.alert(t('common.success'), t('income.updateSuccess'));
      setEditingId(null);
      setAmount('');
      setDescription('');
      setCategory('salary');
      setDate(new Date().toISOString().split('T')[0]);
      fetchIncomeHistory();
    } catch (error) {
      console.error('Failed to update income:', error);
      Alert.alert(t('common.error'), t('income.updateFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  // 渲染历史记录项
  const renderHistoryItem = (item: IncomeRecord) => (
    <View style={[styles.historyItem, { backgroundColor: themeColors.card, borderBottomColor: themeColors.border }]}>
      <View style={styles.historyItemHeader}>
        <Text style={[styles.historyCategory, { color: themeColors.primaryText }]}>
          {t(`incomeCategories.${item.category.toLowerCase()}`) || item.category}
        </Text>
        <Text style={[styles.historyAmount, { color: themeColors.success }]}>
          +{formatAmount(item.amount)}
        </Text>
      </View>
      <Text style={[styles.historyDescription, { color: themeColors.primaryText }]}>{item.description}</Text>
      <Text style={[styles.historyDate, { color: themeColors.secondaryText }]}>{new Date(item.date).toLocaleDateString()}</Text>
      
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: themeColors.primary }]}
          onPress={() => handleEditIncome(item)}
        >
          <Text style={styles.actionButtonText}>{t('common.edit')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: themeColors.danger }]}
          onPress={() => handleDeleteIncome(item.id)}
        >
          <Text style={styles.actionButtonText}>{t('common.delete')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <ScrollView style={[styles.container, { backgroundColor: themeColors.background }]}>
      <View style={[styles.header, { backgroundColor: themeColors.success }]}>
        <Text style={styles.headerTitle}>
          {editingId ? t('income.editIncome') : t('income.addIncome')}
        </Text>
      </View>

      <View style={[styles.form, { 
        backgroundColor: themeColors.card,
        shadowColor: isDarkMode ? 'rgba(0, 0, 0, 0.5)' : '#000',
      }]}>
        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: themeColors.primaryText }]}>
            {t('income.amount')} ({getCurrencySymbol(currency)})
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
          <Text style={[styles.label, { color: themeColors.primaryText }]}>{t('income.description')}</Text>
          <TextInput
            style={[styles.input, { 
              borderColor: themeColors.border,
              backgroundColor: isDarkMode ? themeColors.card : '#fff',
              color: themeColors.primaryText
            }]}
            value={description}
            onChangeText={setDescription}
            placeholder={t('income.description')}
            placeholderTextColor={themeColors.secondaryText}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: themeColors.primaryText }]}>{t('income.category')}</Text>
          <View style={styles.categoryContainer}>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.categoryButton,
                  { backgroundColor: isDarkMode ? themeColors.border : '#f0f0f0' },
                  category === cat.id && [styles.categoryButtonActive, { backgroundColor: themeColors.success }],
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
          <Text style={[styles.label, { color: themeColors.primaryText }]}>{t('income.date')}</Text>
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
            {t('income.dateFormat')}
          </Text>
        </View>

        <TouchableOpacity 
          style={[
            styles.addButton, 
            { backgroundColor: themeColors.success },
            isLoading && styles.disabledButton,
          ]}
          onPress={editingId ? handleUpdateIncome : handleAddIncome}
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
            style={[styles.cancelButton, { backgroundColor: themeColors.border }]}
            onPress={() => {
              setEditingId(null);
              setAmount('');
              setDescription('');
              setCategory('salary');
              setDate(new Date().toISOString().split('T')[0]);
            }}
          >
            <Text style={[styles.cancelButtonText, { color: themeColors.primaryText }]}>
              {t('common.cancel')}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={[styles.historyContainer, { backgroundColor: themeColors.card }]}>
        <Text style={[styles.historyTitle, { color: themeColors.primaryText }]}>
          {t('income.incomeHistory')}
        </Text>
        
        {isLoadingHistory ? (
          <ActivityIndicator 
            color={themeColors.primary} 
            size="large" 
            style={styles.loadingContainer} 
          />
        ) : incomeHistory.length > 0 ? (
          incomeHistory.map(item => (
            <View key={item.id}>
              {renderHistoryItem(item)}
            </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyStateText, { color: themeColors.secondaryText }]}>
              {t('income.noIncome')}
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
    backgroundColor: '#2ecc71',
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
    backgroundColor: '#2ecc71',
  },
  categoryButtonText: {
    color: '#333',
  },
  categoryButtonTextActive: {
    color: 'white',
  },
  addButton: {
    backgroundColor: '#2ecc71',
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
    color: '#2ecc71',
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
  loadingContainer: {
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
    marginTop: 10,
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
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

export default IncomeScreen; 