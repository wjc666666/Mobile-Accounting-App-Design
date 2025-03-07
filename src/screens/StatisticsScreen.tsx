import React from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';

const StatisticsScreen = () => {
  // Mock data for demonstration
  const incomeData = {
    total: 2500,
    categories: [
      { name: 'Salary', amount: 2000, percentage: 80 },
      { name: 'Freelance', amount: 300, percentage: 12 },
      { name: 'Investment', amount: 200, percentage: 8 },
    ],
  };

  const expenseData = {
    total: 1800,
    categories: [
      { name: 'Housing', amount: 800, percentage: 44.4 },
      { name: 'Food', amount: 400, percentage: 22.2 },
      { name: 'Transport', amount: 200, percentage: 11.1 },
      { name: 'Entertainment', amount: 150, percentage: 8.3 },
      { name: 'Utilities', amount: 150, percentage: 8.3 },
      { name: 'Other', amount: 100, percentage: 5.7 },
    ],
  };

  const balance = incomeData.total - expenseData.total;
  const savingsRate = ((balance / incomeData.total) * 100).toFixed(1);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Financial Statistics</Text>
      </View>

      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Monthly Summary</Text>
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Income</Text>
            <Text style={styles.summaryValue}>${incomeData.total}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Expenses</Text>
            <Text style={styles.summaryValue}>${expenseData.total}</Text>
          </View>
        </View>
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Balance</Text>
            <Text style={[styles.summaryValue, styles.balanceValue]}>${balance}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Savings Rate</Text>
            <Text style={[styles.summaryValue, styles.balanceValue]}>{savingsRate}%</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Income Breakdown</Text>
        {incomeData.categories.map((category, index) => (
          <View key={index} style={styles.categoryItem}>
            <View style={styles.categoryHeader}>
              <Text style={styles.categoryName}>{category.name}</Text>
              <Text style={styles.categoryAmount}>${category.amount}</Text>
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
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Expense Breakdown</Text>
        {expenseData.categories.map((category, index) => (
          <View key={index} style={styles.categoryItem}>
            <View style={styles.categoryHeader}>
              <Text style={styles.categoryName}>{category.name}</Text>
              <Text style={styles.categoryAmount}>${category.amount}</Text>
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
        ))}
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
    backgroundColor: '#9b59b6',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
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
  balanceValue: {
    color: '#2ecc71',
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
});

export default StatisticsScreen; 