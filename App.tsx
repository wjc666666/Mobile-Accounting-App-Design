/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React from 'react';
import { SafeAreaView, StatusBar, StyleSheet } from 'react-native';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import AppNavigator from './src/navigation/AppNavigator';
import { AuthProvider } from './src/utils/AuthContext';
import { ThemeProvider, useTheme, lightTheme, darkTheme } from './src/utils/ThemeContext';
import { LocalizationProvider } from './src/utils/LocalizationContext';
import { CurrencyProvider } from './src/utils/CurrencyContext';

// 自定义导航主题
const customLightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: lightTheme.primary,
    background: lightTheme.background,
    card: lightTheme.card,
    text: lightTheme.primaryText,
    border: lightTheme.border,
  }
};

const customDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: darkTheme.primary,
    background: darkTheme.background,
    card: darkTheme.card,
    text: darkTheme.primaryText,
    border: darkTheme.border,
  }
};

// 由于 App 组件不能使用 useTheme 钩子，所以要创建一个内部组件
const AppContent = () => {
  const { isDarkMode } = useTheme();
  const themeColors = isDarkMode ? darkTheme : lightTheme;
  const navigationTheme = isDarkMode ? customDarkTheme : customLightTheme;
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
      <StatusBar 
        barStyle={isDarkMode ? "light-content" : "dark-content"} 
        backgroundColor={themeColors.header} 
      />
      <NavigationContainer theme={navigationTheme}>
        <AppNavigator />
      </NavigationContainer>
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
