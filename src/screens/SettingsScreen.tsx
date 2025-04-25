import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, ScrollView, Alert, ActivityIndicator, Image } from 'react-native';
import { useAuth } from '../utils/AuthContext';
import { useTheme, lightTheme, darkTheme } from '../utils/ThemeContext';
import { useLocalization, Language } from '../utils/LocalizationContext';
import { useCurrency, CurrencyCode } from '../utils/CurrencyContext';
import { APP_ICON } from '../assets/girl';

const SettingsScreen = () => {
  const { user, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useLocalization();
  const { currency, setCurrency } = useCurrency();
  const [notifications, setNotifications] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  
  // 获取当前主题颜色
  const themeColors = isDarkMode ? darkTheme : lightTheme;

  const handleCurrencyChange = async (newCurrency: CurrencyCode) => {
    await setCurrency(newCurrency);
    Alert.alert(t('success'), `${t('currency')} ${t('change')} ${newCurrency}`);
  };

  const handleLanguageChange = async (newLanguage: Language) => {
    await setLanguage(newLanguage);
  };

  const handleClearData = () => {
    Alert.alert(
      t('clearAllData'),
      t('clearDataConfirm'),
      [
        {
          text: t('cancel'),
          style: 'cancel',
        },
        {
          text: t('delete'),
          style: 'destructive',
          onPress: () => Alert.alert(t('success'), t('clearDataDone')),
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
      Alert.alert(t('error'), 'Logout failed. Please try again');
    } finally {
      setIsLoading(false);
    }
  };

  // 处理主题切换
  const handleThemeToggle = () => {
    console.log('切换主题模式，当前模式:', isDarkMode ? 'dark' : 'light');
    toggleTheme();
  };

  // 获取语言名称
  const getLanguageName = (code: Language): string => {
    switch (code) {
      case 'en': return 'English';
      case 'zh': return '中文';
      case 'es': return 'Español';
      default: return code;
    }
  };

  return (
    <ScrollView 
      style={[
        styles.container, 
        { backgroundColor: themeColors.background }
      ]}
    >
      <View style={[styles.header, { backgroundColor: themeColors.header }]}>
        <View style={styles.headerContent}>
          <Image 
            source={APP_ICON} 
            style={styles.appIcon} 
            resizeMode="contain"
          />
          <Text style={styles.headerTitle}>{t('settings')}</Text>
        </View>
      </View>

      {user && (
        <View style={[styles.section, { backgroundColor: themeColors.card }]}>
          <Text style={[styles.sectionTitle, { color: themeColors.primaryText }]}>{t('userInformation')}</Text>
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
              <Text style={styles.logoutButtonText}>{t('logout')}</Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      <View style={[styles.section, { backgroundColor: themeColors.card }]}>
        <Text style={[styles.sectionTitle, { color: themeColors.primaryText }]}>{t('appearance')}</Text>
        
        <View style={styles.settingItem}>
          <Text style={[styles.settingLabel, { color: themeColors.primaryText }]}>{t('darkMode')}</Text>
          <Switch
            value={isDarkMode}
            onValueChange={handleThemeToggle}
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor={isDarkMode ? '#f5dd4b' : '#f4f3f4'}
          />
        </View>
      </View>

      <View style={[styles.section, { backgroundColor: themeColors.card }]}>
        <Text style={[styles.sectionTitle, { color: themeColors.primaryText }]}>{t('preferences')}</Text>
        
        <View style={styles.settingItem}>
          <Text style={[styles.settingLabel, { color: themeColors.primaryText }]}>{t('notifications')}</Text>
          <Switch
            value={notifications}
            onValueChange={setNotifications}
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor={notifications ? '#f5dd4b' : '#f4f3f4'}
          />
        </View>

        <Text style={[styles.settingLabel, { color: themeColors.primaryText }]}>{t('currency')}</Text>
        <View style={styles.currencyContainer}>
          {['USD', 'EUR', 'GBP', 'JPY', 'CNY'].map((curr) => (
            <TouchableOpacity
              key={curr}
              style={[
                styles.currencyButton,
                { backgroundColor: themeColors.border },
                currency === curr && { backgroundColor: themeColors.primary },
              ]}
              onPress={() => handleCurrencyChange(curr as CurrencyCode)}
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
        
        <Text style={[styles.settingLabel, { color: themeColors.primaryText }]}>{t('language')}</Text>
        <View style={styles.currencyContainer}>
          {['en', 'zh', 'es'].map((lang) => (
            <TouchableOpacity
              key={lang}
              style={[
                styles.currencyButton,
                { backgroundColor: themeColors.border },
                language === lang && { backgroundColor: themeColors.primary },
              ]}
              onPress={() => handleLanguageChange(lang as Language)}
            >
              <Text
                style={[
                  styles.currencyButtonText,
                  { color: themeColors.secondaryText },
                  language === lang && { color: 'white' },
                ]}
              >
                {getLanguageName(lang as Language)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={[styles.section, { backgroundColor: themeColors.card }]}>
        <Text style={[styles.sectionTitle, { color: themeColors.primaryText }]}>{t('dataManagement')}</Text>
        
        <TouchableOpacity 
          style={[styles.dangerButton, { backgroundColor: themeColors.danger }]} 
          onPress={handleClearData}
        >
          <Text style={styles.dangerButtonText}>{t('clearAllData')}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.resetButton, { backgroundColor: themeColors.warning, marginTop: 10 }]} 
          onPress={() => {
            Alert.alert(
              t('resetSettings'),
              t('resetSettingsConfirm'),
              [
                {
                  text: t('cancel'),
                  style: 'cancel',
                },
                {
                  text: t('resetSettings'),
                  onPress: async () => {
                    await setLanguage('en');
                    await setCurrency('USD');
                    Alert.alert(t('success'), t('resetSettingsDone'));
                  },
                },
              ]
            );
          }}
        >
          <Text style={styles.dangerButtonText}>{t('resetSettings')}</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.section, { backgroundColor: themeColors.card }]}>
        <Text style={[styles.sectionTitle, { color: themeColors.primaryText }]}>{t('about')}</Text>
        <Text style={[styles.aboutText, { color: themeColors.primaryText }]}>JCEco Finance App</Text>
        <Text style={[styles.versionText, { color: themeColors.secondaryText }]}>{t('version')} 1.0.0</Text>
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
    backgroundColor: '#3498db',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  appIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
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
    marginBottom: 5,
  },
  versionText: {
    fontSize: 14,
  },
  resetButton: {
    backgroundColor: '#f39c12',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
});

export default SettingsScreen; 