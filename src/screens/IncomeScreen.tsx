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
  const [category, setCategory] = useState('Salary');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [incomeHistory, setIncomeHistory] = useState<IncomeRecord[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

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
      // Call API to add income record
      await incomeAPI.addIncome({
        amount: Number(amount),
        category,
        date,
        description
      });
      
      Alert.alert('Success', 'Income record added');
      
      // 重新获取历史记录以刷新列表
      fetchIncomeHistory();
      
      // Reset form
      setAmount('');
      setDescription('');
      setCategory('Salary');
      setDate(new Date().toISOString().split('T')[0]);
    } catch (error) {
      console.error('Failed to add income record:', error);
      Alert.alert('Error', 'Failed to add income record. Please try again');
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
    </View>
  );

  return (
    <ScrollView style={[styles.container, { backgroundColor: themeColors.background }]}>
      <View style={[styles.header, { backgroundColor: themeColors.success }]}>
        <Text style={styles.headerTitle}>{t('income.addIncome')}</Text>
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
            onChangeText={setDate}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={themeColors.secondaryText}
          />
        </View>

        <TouchableOpacity 
          style={[
            styles.addButton, 
            { backgroundColor: themeColors.success },
            isLoading && styles.disabledButton,
          ]}
          onPress={handleAddIncome}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <Text style={styles.addButtonText}>{t('common.add')}</Text>
          )}
        </TouchableOpacity>
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
    color: '#2ecc71',
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
  emptyState: {
    padding: 20,
    alignItems: 'center',
  },
  emptyStateText: {
    color: '#999',
    fontSize: 16,
  }
});

export default IncomeScreen; 