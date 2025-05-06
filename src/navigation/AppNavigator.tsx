import React from 'react';
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
import MyPlanScreen from '../screens/MyPlanScreen';

// Import auth and theme contexts
import { useAuth } from '../utils/AuthContext';
import { useTheme, lightTheme, darkTheme } from '../utils/ThemeContext';
import { useLocalization } from '../utils/LocalizationContext';

// Create tab and stack navigators
const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();
const AuthStack = createStackNavigator();

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

// My Plan stack navigator
const MyPlanStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MyPlanMain" component={MyPlanScreen} />
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
  const { t } = useLocalization();
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
          tabBarIcon: ({ focused }) => <TabIcon name={t('navigation.home')} focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Income"
        component={IncomeStack}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon name={t('navigation.income')} focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Expense"
        component={ExpenseStack}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon name={t('navigation.expense')} focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Statistics"
        component={StatisticsStack}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon name={t('navigation.statistics')} focused={focused} />,
        }}
      />
      <Tab.Screen
        name="FinanceAI"
        component={FinanceAIStack}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon name={t('navigation.financeAI')} focused={focused} />,
        }}
      />
      <Tab.Screen
        name="MyPlan"
        component={MyPlanStack}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon name={t('navigation.plan')} focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsStack}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon name={t('navigation.settings')} focused={focused} />,
        }}
      />
    </Tab.Navigator>
  );
};

const AppNavigator = () => {
  const { isLoading, isLoggedIn } = useAuth();
  const { isDarkMode } = useTheme();
  
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={isDarkMode ? darkTheme.primary : lightTheme.primary} />
      </View>
    );
  }

  return isLoggedIn ? <MainAppNavigator /> : <AuthNavigator />;
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