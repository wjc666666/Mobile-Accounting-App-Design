import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
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

// Import auth context
import { useAuth } from '../utils/AuthContext';

// Create tab and stack navigators
const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();
const AuthStack = createStackNavigator();

// Custom tab bar icon component
const TabIcon = ({ name, focused }: { name: string; focused: boolean }) => {
  // You can replace this with actual icons
  return (
    <View style={[styles.iconContainer, focused && styles.iconContainerFocused]}>
      <Text style={[styles.iconText, focused && styles.iconTextFocused]}>{name}</Text>
    </View>
  );
};

// 认证导航
const AuthNavigator = () => {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Register" component={RegisterScreen} />
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

// Settings stack navigator
const SettingsStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SettingsMain" component={SettingsScreen} />
    </Stack.Navigator>
  );
};

// 主应用导航（已登录）
const MainAppNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#3498db',
        tabBarInactiveTintColor: '#95a5a6',
        tabBarStyle: {
          backgroundColor: 'white',
          borderTopWidth: 1,
          borderTopColor: '#f0f0f0',
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
  const { isLoading, isLoggedIn } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3498db" />
      </View>
    );
  }

  return (
    <NavigationContainer>
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
  iconContainerFocused: {
    backgroundColor: 'rgba(52, 152, 219, 0.1)',
  },
  iconText: {
    fontSize: 12,
    color: '#95a5a6',
  },
  iconTextFocused: {
    color: '#3498db',
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  authContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#ffffff',
  },
  authTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#3498db',
  },
});

export default AppNavigator; 