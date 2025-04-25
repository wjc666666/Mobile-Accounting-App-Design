/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React from 'react';
import { SafeAreaView, StatusBar, StyleSheet } from 'react-native';
import AppNavigator from './src/navigation/AppNavigator';
import { AuthProvider } from './src/utils/AuthContext';
import { ThemeProvider, useTheme, lightTheme, darkTheme } from './src/utils/ThemeContext';
import { LocalizationProvider } from './src/utils/LocalizationContext';
import { CurrencyProvider } from './src/utils/CurrencyContext';

// 由于 App 组件不能使用 useTheme 钩子，所以要创建一个内部组件
const AppContent = () => {
  const { isDarkMode } = useTheme();
  const themeColors = isDarkMode ? darkTheme : lightTheme;
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
      <StatusBar 
        barStyle={isDarkMode ? "light-content" : "dark-content"} 
        backgroundColor={themeColors.header} 
      />
      <AppNavigator />
    </SafeAreaView>
  );
};

function App(): React.JSX.Element {
  return (
    <AuthProvider>
      <ThemeProvider>
        <LocalizationProvider>
          <CurrencyProvider>
            <AppContent />
          </CurrencyProvider>
        </LocalizationProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
