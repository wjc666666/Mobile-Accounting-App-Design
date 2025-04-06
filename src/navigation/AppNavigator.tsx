import React from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Text, View, StyleSheet, ActivityIndicator } from 'react-native';

// Import screens
import HomeScreen from '../screens/HomeScreen';
import IncomeScreen from '../screens/IncomeScreen';
import ExpenseScreen from '../screens/ExpenseScreen';
import StatisticsScreen from '../screens/StatisticsScreen';
import SettingsScreen from '../screens/SettingsScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import TestScreen from '../screens/TestScreen';
import FinanceAIScreen from '../screens/FinanceAIScreen';

// Import auth and theme contexts
import { useAuth } from '../utils/AuthContext';
import { useTheme, lightTheme, darkTheme } from '../utils/ThemeContext';

// Create tab and stack navigators
const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();
const AuthStack = createStackNavigator();

// 自定义导航主题
const customLightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: lightTheme.primary,
    background: lightTheme.background,
    card: lightTheme.card,
    text: lightTheme.text,
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
    text: darkTheme.text,
    border: darkTheme.border,
  }
};

// Custom tab bar icon component
const TabIcon = ({ name, focused }: { name: string; focused: boolean }) => {
  const { isDarkMode } = useTheme();
  const themeColors = isDarkMode ? darkTheme : lightTheme;
  
  return (
    <View style={[
      styles.iconContainer, 
      focused && { backgroundColor: `${themeColors.primary}20` } // 20 is opacity in hex (12.5%)
    ]}>
      <Text style={[
        styles.iconText, 
        { color: focused ? themeColors.primary : themeColors.inactive },
        focused && { fontWeight: 'bold' }
      ]}>
        {name}
      </Text>
    </View>
  );
};

// 认证导航
const AuthNavigator = () => {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Register" component={RegisterScreen} />
      <AuthStack.Screen name="Test" component={TestScreen} />
    </AuthStack.Navigator>
  );
};

// Home stack navigator
const HomeStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeMain" component={HomeScreen} />
    </Stack.Navigator>
  );
};

// Income stack navigator
const IncomeStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="IncomeMain" component={IncomeScreen} />
    </Stack.Navigator>
  );
};

// Expense stack navigator
const ExpenseStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ExpenseMain" component={ExpenseScreen} />
    </Stack.Navigator>
  );
};

// Statistics stack navigator
const StatisticsStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="StatisticsMain" component={StatisticsScreen} />
    </Stack.Navigator>
  );
};

// Finance AI stack navigator
const FinanceAIStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="FinanceAIMain" component={FinanceAIScreen} />
    </Stack.Navigator>
  );
};

// Settings stack navigator
const SettingsStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SettingsMain" component={SettingsScreen} />
      <Stack.Screen name="Test" component={TestScreen} />
    </Stack.Navigator>
  );
};

// 主应用导航（已登录）
const MainAppNavigator = () => {
  const { isDarkMode } = useTheme();
  const themeColors = isDarkMode ? darkTheme : lightTheme;
  
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: themeColors.primary,
        tabBarInactiveTintColor: themeColors.inactive,
        tabBarStyle: {
          backgroundColor: themeColors.tabBar,
          borderTopWidth: 1,
          borderTopColor: themeColors.border,
          paddingTop: 5,
          height: 60,
        },
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeStack}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon name="Home" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Income"
        component={IncomeStack}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon name="Income" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Expense"
        component={ExpenseStack}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon name="Expense" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Statistics"
        component={StatisticsStack}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon name="Stats" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="FinanceAI"
        component={FinanceAIStack}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon name="AI" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsStack}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon name="Settings" focused={focused} />,
        }}
      />
    </Tab.Navigator>
  );
};

// Main app navigator
const AppNavigator = () => {
  const { isLoading, isLoggedIn, user } = useAuth();
  const { isDarkMode } = useTheme();

  console.log('AppNavigator渲染:', { isLoading, isLoggedIn, user, isDarkMode });
  
  const themeColors = isDarkMode ? darkTheme : lightTheme;
  const navigationTheme = isDarkMode ? customDarkTheme : customLightTheme;

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: themeColors.background }]}>
        <ActivityIndicator size="large" color={themeColors.primary} />
        <Text style={[styles.loadingText, { color: themeColors.primary }]}>Loading...</Text>
      </View>
    );
  }

  // 在渲染前记录状态
  if (isLoggedIn) {
    console.log('渲染主应用导航');
  } else {
    console.log('渲染认证导航');
  }

  return (
    <NavigationContainer
      theme={navigationTheme}
      onStateChange={(state) => console.log('导航状态变化:', state)}
      onReady={() => console.log('导航容器已准备好')}
    >
      {isLoggedIn ? <MainAppNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  iconContainer: {
    width: 50,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 15,
  },
  iconText: {
    fontSize: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  authContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  authTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AppNavigator; 