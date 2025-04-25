import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { incomeAPI, expenseAPI, financialAIAPI } from '../utils/api';
import { useTheme, lightTheme, darkTheme } from '../utils/ThemeContext';
import { useLocalization } from '../utils/LocalizationContext';
import { useCurrency } from '../utils/CurrencyContext';

interface Transaction {
  amount: number;
  category: string;
  date: string;
  description: string;
}

const FinanceAIScreen = () => {
  const { isDarkMode } = useTheme();
  const { t } = useLocalization();
  const { formatAmount } = useCurrency();
  const themeColors = isDarkMode ? darkTheme : lightTheme;
  
  const [_incomes, setIncomes] = useState<Transaction[]>([]);
  const [_expenses, setExpenses] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [aiResponse, setAiResponse] = useState('');
  const [question, setQuestion] = useState('');
  const [financialSummary, setFinancialSummary] = useState('');

  // Generate financial summary
  const generateFinancialSummary = (incomesData: any[], expensesData: any[]) => {
    const totalIncome = incomesData.reduce((sum, income) => {
      const amount = typeof income.amount === 'string' ? parseFloat(income.amount) : income.amount;
      return sum + (isNaN(amount) ? 0 : amount);
    }, 0);

    const totalExpense = expensesData.reduce((sum, expense) => {
      const amount = typeof expense.amount === 'string' ? parseFloat(expense.amount) : expense.amount;
      return sum + (isNaN(amount) ? 0 : amount);
    }, 0);

    const balance = totalIncome - totalExpense;
    const savingRate = totalIncome > 0 ? (balance / totalIncome) * 100 : 0;

    // Group expenses by category
    const expensesByCategory: Record<string, number> = {};
    expensesData.forEach(expense => {
      const amount = typeof expense.amount === 'string' ? parseFloat(expense.amount) : expense.amount;
      if (expensesByCategory[expense.category]) {
        expensesByCategory[expense.category] += amount;
      } else {
        expensesByCategory[expense.category] = amount;
      }
    });

    // Find maximum expense category
    let maxCategory = '';
    let maxAmount = 0;
    Object.entries(expensesByCategory).forEach(([category, amount]) => {
      if (amount > maxAmount) {
        maxAmount = amount;
        maxCategory = category;
      }
    });

    const summary = `
${t('financeAI')} ${t('summary')}:
- ${t('income')}: ${formatAmount(totalIncome)}
- ${t('expenses')}: ${formatAmount(totalExpense)}
- ${t('balance')}: ${formatAmount(balance)}
- ${t('savingRate')}: ${savingRate.toFixed(1)}%
${maxCategory ? `- ${t('topExpenses')}: ${t(maxCategory.toLowerCase()) || maxCategory} (${formatAmount(maxAmount)})` : ''}
    `;

    setFinancialSummary(summary);
  };

  // Auto fetch data when screen is focused
  useFocusEffect(
    React.useCallback(() => {
      // Fetch user's income and expense data
      const fetchFinancialData = async () => {
        setIsDataLoading(true);
        try {
          const [incomesData, expensesData] = await Promise.all([
            incomeAPI.getIncomes(),
            expenseAPI.getExpenses()
          ]);
  
          // Process income data
          if (Array.isArray(incomesData)) {
            const processedIncomes = incomesData.map(income => ({
              ...income,
              amount: typeof income.amount === 'string' ? parseFloat(income.amount) : income.amount
            }));
            setIncomes(processedIncomes);
          } else {
            setIncomes([]);
          }
  
          // Process expense data
          if (Array.isArray(expensesData)) {
            const processedExpenses = expensesData.map(expense => ({
              ...expense,
              amount: typeof expense.amount === 'string' ? parseFloat(expense.amount) : expense.amount
            }));
            setExpenses(processedExpenses);
          } else {
            setExpenses([]);
          }
  
          // Generate financial summary
          generateFinancialSummary(incomesData, expensesData);
        } catch (error) {
          console.error('Failed to fetch financial data:', error);
          Alert.alert('Error', 'Failed to fetch your financial data');
        } finally {
          setIsDataLoading(false);
        }
      };

      fetchFinancialData();
      return () => {
        // Cleanup function
      };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
  );

  // Default questions list
  const defaultQuestions = [
    t('howToSave'),
    t('spendingTrends'),
    t('budgetRecommendations'),
    t('investmentAdvice')
  ];

  // Ask the AI for financial advice
  const askAI = async (customQuestion?: string) => {
    const userQuestion = customQuestion || question;
    if (!userQuestion && !financialSummary) return;

    setIsLoading(true);
    setAiResponse('');

    try {
      // Call the financialAIAPI to analyze data
      const aiText = await financialAIAPI.analyzeFinances(financialSummary, userQuestion);
      setAiResponse(aiText);
    } catch (error) {
      console.error("Error calling AI API:", error);
      setAiResponse("Sorry, the AI service is temporarily unavailable. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: themeColors.background }]}>
      <View style={[styles.header, { backgroundColor: themeColors.primary }]}>
        <Text style={styles.headerTitle}>{t('financeAI')}</Text>
      </View>

      {isDataLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={themeColors.primary} />
          <Text style={[styles.loadingText, { color: themeColors.secondaryText }]}>{t('analyzingData')}</Text>
        </View>
      ) : (
        <>
          <View style={[styles.summaryContainer, { backgroundColor: themeColors.card }]}>
            <Text style={[styles.summaryTitle, { color: themeColors.primaryText }]}>{t('summary')}</Text>
            <Text style={[styles.summaryText, { color: themeColors.primaryText }]}>
              {financialSummary}
            </Text>
          </View>

          <View style={[styles.aiContainer, { backgroundColor: themeColors.card }]}>
            <Text style={[styles.aiTitle, { color: themeColors.primaryText }]}>{t('financeAI')}</Text>
            <Text style={[styles.aiSubtitle, { color: themeColors.secondaryText }]}>
              {t('askFinanceQuestion')}
            </Text>

            <View style={styles.questionContainer}>
              <TextInput
                style={[styles.questionInput, { 
                  backgroundColor: isDarkMode ? themeColors.border : '#f5f5f5',
                  color: themeColors.primaryText,
                  borderColor: themeColors.border
                }]}
                placeholder={t('askFinanceQuestion')}
                placeholderTextColor={themeColors.secondaryText}
                value={question}
                onChangeText={setQuestion}
                multiline
              />
              <TouchableOpacity 
                style={[styles.askButton, { backgroundColor: themeColors.primary }]}
                onPress={() => askAI()}
                disabled={isLoading || !question}
              >
                {isLoading ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <Text style={styles.askButtonText}>{t('ask')}</Text>
                )}
              </TouchableOpacity>
            </View>

            {aiResponse ? (
              <View style={[
                styles.responseContainer, 
                { 
                  borderColor: themeColors.border,
                  backgroundColor: isDarkMode ? themeColors.card : '#f5f5f5' 
                }
              ]}>
                <Text style={[styles.responseTitle, { color: themeColors.primaryText }]}>{t('advice')}</Text>
                <Text style={[styles.responseText, { color: themeColors.primaryText }]}>{aiResponse}</Text>
              </View>
            ) : null}

            <View style={styles.suggestedContainer}>
              <Text style={[styles.suggestedTitle, { color: themeColors.primaryText }]}>{t('suggestedQuestions')}</Text>
              {defaultQuestions.map((q, index) => (
                <TouchableOpacity 
                  key={index}
                  style={[
                    styles.suggestedQuestion, 
                    { 
                      borderColor: themeColors.border,
                      backgroundColor: isDarkMode ? themeColors.card : '#f5f5f5' 
                    }
                  ]}
                  onPress={() => {
                    setQuestion(q);
                    askAI(q);
                  }}
                >
                  <Text style={[styles.suggestedQuestionText, { color: themeColors.primaryText }]}>{q}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </>
      )}
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
    backgroundColor: '#3498db',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  loadingContainer: {
    padding: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  summaryContainer: {
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
    marginBottom: 10,
  },
  summaryText: {
    fontSize: 14,
    lineHeight: 22,
  },
  aiContainer: {
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
  aiTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  aiSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
  },
  questionContainer: {
    marginBottom: 15,
  },
  questionInput: {
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    minHeight: 80,
    fontSize: 16,
  },
  askButton: {
    backgroundColor: '#3498db',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  askButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  responseContainer: {
    borderRadius: 8,
    padding: 15,
    borderWidth: 1,
    marginBottom: 15,
  },
  responseTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  responseText: {
    fontSize: 14,
    lineHeight: 22,
  },
  suggestedContainer: {
    marginBottom: 20,
  },
  suggestedTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  suggestedQuestion: {
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
  },
  suggestedQuestionText: {
    fontSize: 14,
  },
});

export default FinanceAIScreen; 