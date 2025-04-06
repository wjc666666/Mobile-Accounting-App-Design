import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useAuth } from '../utils/AuthContext';
import { useTheme, lightTheme, darkTheme } from '../utils/ThemeContext';

const SettingsScreen = () => {
  const { user, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const [notifications, setNotifications] = useState(true);
  const [currency, setCurrency] = useState('USD');
  const [isLoading, setIsLoading] = useState(false);
  
  // 获取当前主题颜色
  const themeColors = isDarkMode ? darkTheme : lightTheme;

  const handleCurrencyChange = (newCurrency: string) => {
    setCurrency(newCurrency);
    Alert.alert('Currency Changed', `Currency set to ${newCurrency}`);
  };

  const handleClearData = () => {
    Alert.alert(
      'Clear All Data',
      'Are you sure you want to clear all your financial data? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => Alert.alert('Data Cleared', 'All financial data has been cleared'),
        },
      ]
    );
  };

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await logout();
      // Logout successful, AuthContext will automatically update state and navigate to login screen
    } catch (error) {
      console.error('Logout failed:', error);
      Alert.alert('Error', 'Logout failed. Please try again');
    } finally {
      setIsLoading(false);
    }
  };

  // 处理主题切换
  const handleThemeToggle = () => {
    console.log('切换主题模式，当前模式:', isDarkMode ? 'dark' : 'light');
    toggleTheme();
  };

  return (
    <ScrollView 
      style={[
        styles.container, 
        { backgroundColor: themeColors.background }
      ]}
    >
      <View style={[styles.header, { backgroundColor: themeColors.header }]}>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      {user && (
        <View style={[styles.section, { backgroundColor: themeColors.card }]}>
          <Text style={[styles.sectionTitle, { color: themeColors.primaryText }]}>User Information</Text>
          <View style={styles.userInfo}>
            <Text style={[styles.userName, { color: themeColors.primaryText }]}>{user.username}</Text>
            <Text style={[styles.userEmail, { color: themeColors.secondaryText }]}>{user.email}</Text>
          </View>
          <TouchableOpacity 
            style={[styles.logoutButton, { backgroundColor: themeColors.primary }]} 
            onPress={handleLogout}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <Text style={styles.logoutButtonText}>Logout</Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      <View style={[styles.section, { backgroundColor: themeColors.card }]}>
        <Text style={[styles.sectionTitle, { color: themeColors.primaryText }]}>Appearance</Text>
        
        <View style={styles.settingItem}>
          <Text style={[styles.settingLabel, { color: themeColors.primaryText }]}>Dark Mode</Text>
          <Switch
            value={isDarkMode}
            onValueChange={handleThemeToggle}
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor={isDarkMode ? '#f5dd4b' : '#f4f3f4'}
          />
        </View>
      </View>

      <View style={[styles.section, { backgroundColor: themeColors.card }]}>
        <Text style={[styles.sectionTitle, { color: themeColors.primaryText }]}>Preferences</Text>
        
        <View style={styles.settingItem}>
          <Text style={[styles.settingLabel, { color: themeColors.primaryText }]}>Notifications</Text>
          <Switch
            value={notifications}
            onValueChange={setNotifications}
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor={notifications ? '#f5dd4b' : '#f4f3f4'}
          />
        </View>

        <Text style={[styles.settingLabel, { color: themeColors.primaryText }]}>Currency</Text>
        <View style={styles.currencyContainer}>
          {['USD', 'EUR', 'GBP', 'JPY', 'CNY'].map((curr) => (
            <TouchableOpacity
              key={curr}
              style={[
                styles.currencyButton,
                { backgroundColor: themeColors.border },
                currency === curr && { backgroundColor: themeColors.primary },
              ]}
              onPress={() => handleCurrencyChange(curr)}
            >
              <Text
                style={[
                  styles.currencyButtonText,
                  { color: themeColors.secondaryText },
                  currency === curr && { color: 'white' },
                ]}
              >
                {curr}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={[styles.section, { backgroundColor: themeColors.card }]}>
        <Text style={[styles.sectionTitle, { color: themeColors.primaryText }]}>Data Management</Text>
        
        <TouchableOpacity 
          style={[styles.dangerButton, { backgroundColor: themeColors.danger }]} 
          onPress={handleClearData}
        >
          <Text style={styles.dangerButtonText}>Clear All Data</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.section, { backgroundColor: themeColors.card }]}>
        <Text style={[styles.sectionTitle, { color: themeColors.primaryText }]}>About</Text>
        <Text style={[styles.aboutText, { color: themeColors.primaryText }]}>JCEco Finance App</Text>
        <Text style={[styles.versionText, { color: themeColors.secondaryText }]}>Version 1.0.0</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  section: {
    margin: 15,
    marginTop: 5,
    padding: 15,
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
  userInfo: {
    alignItems: 'center',
    marginBottom: 15,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 16,
  },
  logoutButton: {
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingLabel: {
    fontSize: 16,
    marginBottom: 10,
  },
  currencyContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 5,
    marginBottom: 10,
  },
  currencyButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 10,
    marginBottom: 10,
  },
  currencyButtonText: {
    fontWeight: '500',
  },
  dangerButton: {
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  dangerButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  aboutText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 5,
  },
  versionText: {
    fontSize: 14,
    textAlign: 'center',
  },
});

export default SettingsScreen; 