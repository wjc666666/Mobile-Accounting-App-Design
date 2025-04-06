import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { incomeAPI, expenseAPI, financialAIAPI } from '../utils/api';
import { useTheme, lightTheme, darkTheme } from '../utils/ThemeContext';

interface Transaction {
  amount: number;
  category: string;
  date: string;
  description: string;
}

const FinanceAIScreen = () => {
  const { isDarkMode } = useTheme();
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
Financial Summary:
- Total Income: $${totalIncome.toFixed(2)}
- Total Expenses: $${totalExpense.toFixed(2)}
- Balance: $${balance.toFixed(2)}
- Saving Rate: ${savingRate.toFixed(1)}%
${maxCategory ? `- Highest expense category: ${maxCategory} ($${maxAmount.toFixed(2)})` : ''}
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
    }, [])
  );

  // Default questions list
  const defaultQuestions = [
    "Analyze my income and expenses and provide improvement suggestions",
    "How is my current saving rate? How can I improve it?",
    "Analyze my spending patterns. Where can I cut expenses?",
    "Are my income sources diversified? How can I increase my income?"
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
        <Text style={styles.headerTitle}>AI Financial Advisor</Text>
      </View>

      {isDataLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={themeColors.primary} />
          <Text style={[styles.loadingText, { color: themeColors.secondaryText }]}>Loading your financial data...</Text>
        </View>
      ) : (
        <>
          <View style={[styles.summaryContainer, { backgroundColor: themeColors.card }]}>
            <Text style={[styles.summaryTitle, { color: themeColors.primaryText }]}>Financial Summary</Text>
            <Text style={[styles.summaryText, { color: themeColors.primaryText }]}>
              {financialSummary}
            </Text>
          </View>

          <View style={[styles.aiContainer, { backgroundColor: themeColors.card }]}>
            <Text style={[styles.aiTitle, { color: themeColors.primaryText }]}>Smart Financial Advisor</Text>
            <Text style={[styles.aiSubtitle, { color: themeColors.secondaryText }]}>
              Ask the AI about your financial situation for personalized advice
            </Text>

            <View style={styles.questionContainer}>
              <TextInput
                style={[styles.questionInput, { 
                  backgroundColor: isDarkMode ? themeColors.border : '#f5f5f5',
                  color: themeColors.primaryText,
                  borderColor: themeColors.border
                }]}
                placeholder="Enter your financial question..."
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
                  <Text style={styles.askButtonText}>Ask</Text>
                )}
              </TouchableOpacity>
            </View>

            <Text style={[styles.suggestionsTitle, { color: themeColors.primaryText }]}>
              Suggested Questions:
            </Text>
            <View style={styles.suggestionsContainer}>
              {defaultQuestions.map((q, index) => (
                <TouchableOpacity
                  key={index}
                  style={[styles.suggestionButton, { backgroundColor: isDarkMode ? themeColors.border : '#f5f5f5' }]}
                  onPress={() => {
                    setQuestion(q);
                    askAI(q);
                  }}
                >
                  <Text style={[styles.suggestionText, { color: themeColors.primaryText }]}>{q}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {aiResponse ? (
              <View style={[styles.responseContainer, { 
                backgroundColor: isDarkMode ? themeColors.border : '#f5f5f5',
                borderColor: themeColors.border 
              }]}>
                <Text style={[styles.responseTitle, { color: themeColors.primaryText }]}>
                  AI Analysis
                </Text>
                <Text style={[styles.responseText, { color: themeColors.primaryText }]}>
                  {aiResponse}
                </Text>
              </View>
            ) : null}
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
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ddd',
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
  suggestionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  suggestionsContainer: {
    marginBottom: 20,
  },
  suggestionButton: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  suggestionText: {
    fontSize: 14,
  },
  responseContainer: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 15,
    borderWidth: 1,
    borderColor: '#ddd',
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
});

export default FinanceAIScreen; 