import React, { useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Alert, TextInput, ActivityIndicator } from 'react-native';
// import { TextInput, Button } from 'react-native-paper';
import { useAuth } from '../utils/AuthContext';
import { useTheme, lightTheme, darkTheme } from '../utils/ThemeContext';

interface RegisterScreenProps {
  navigation: any;
}

const RegisterScreen: React.FC<RegisterScreenProps> = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const { isDarkMode } = useTheme();
  const themeColors = isDarkMode ? darkTheme : lightTheme;

  const handleRegister = async () => {
    if (!username || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      await register(username, email, password);
      // Registration successful, AuthContext will automatically log in and update state
    } catch (error: any) {
      Alert.alert('Registration Failed', error.message || 'Please check your information and try again');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <Text style={[styles.title, { color: themeColors.primary }]}>Create Account</Text>
      <Text style={[styles.subtitle, { color: themeColors.secondaryText }]}>Start managing your finances</Text>

      <View style={styles.form}>
        <TextInput
          style={[
            styles.input, 
            { 
              backgroundColor: isDarkMode ? themeColors.card : '#f9f9f9',
              borderColor: themeColors.border,
              color: themeColors.primaryText
            }
          ]}
          placeholder="Username"
          placeholderTextColor={themeColors.secondaryText}
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
        />

        <TextInput
          style={[
            styles.input, 
            { 
              backgroundColor: isDarkMode ? themeColors.card : '#f9f9f9',
              borderColor: themeColors.border,
              color: themeColors.primaryText
            }
          ]}
          placeholder="Email"
          placeholderTextColor={themeColors.secondaryText}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <TextInput
          style={[
            styles.input, 
            { 
              backgroundColor: isDarkMode ? themeColors.card : '#f9f9f9',
              borderColor: themeColors.border,
              color: themeColors.primaryText
            }
          ]}
          placeholder="Password"
          placeholderTextColor={themeColors.secondaryText}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TextInput
          style={[
            styles.input, 
            { 
              backgroundColor: isDarkMode ? themeColors.card : '#f9f9f9',
              borderColor: themeColors.border,
              color: themeColors.primaryText
            }
          ]}
          placeholder="Confirm Password"
          placeholderTextColor={themeColors.secondaryText}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
        />

        <TouchableOpacity
          style={[styles.button, { backgroundColor: themeColors.primary }]}
          onPress={handleRegister}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <Text style={styles.buttonText}>Register</Text>
          )}
        </TouchableOpacity>

        <View style={styles.loginContainer}>
          <Text style={[styles.loginText, { color: themeColors.secondaryText }]}>Already have an account?</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={[styles.loginLink, { color: themeColors.primary }]}>Login Now</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#3498db',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#7f8c8d',
    marginBottom: 30,
  },
  form: {
    width: '100%',
  },
  input: {
    marginBottom: 15,
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
  },
  button: {
    marginTop: 10,
    paddingVertical: 12,
    backgroundColor: '#3498db',
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  loginText: {
    color: '#7f8c8d',
  },
  loginLink: {
    color: '#3498db',
    fontWeight: 'bold',
    marginLeft: 5,
  },
});

export default RegisterScreen; 