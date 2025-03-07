import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, TextInput } from 'react-native';
import axios from 'axios';

const TestScreen = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState('test@example.com');
  const [password, setPassword] = useState('password123');
  const [username, setUsername] = useState('testuser');
  const [selectedEndpoint, setSelectedEndpoint] = useState('');

  // 测试根路径
  const testLocalhost = async () => {
    setIsLoading(true);
    setResult(null);
    setError(null);
    setSelectedEndpoint('localhost');
    try {
      const response = await axios.get('http://localhost:5000');
      setResult(JSON.stringify(response.data, null, 2));
    } catch (error: any) {
      console.error('测试localhost失败:', error);
      setError(`测试localhost失败: ${error.message}`);
      
      // 添加更详细的错误信息
      if (error.response) {
        // 服务器响应了，但状态码不是2xx
        setError(`测试localhost失败: ${error.message}\n状态码: ${error.response.status}\n响应数据: ${JSON.stringify(error.response.data)}`);
      } else if (error.request) {
        // 请求已发送，但没有收到响应
        setError(`测试localhost失败: ${error.message}\n请求已发送，但没有收到响应`);
      } else {
        // 请求设置时出错
        setError(`测试localhost失败: ${error.message}\n请求设置时出错`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const test127001 = async () => {
    setIsLoading(true);
    setResult(null);
    setError(null);
    setSelectedEndpoint('127.0.0.1');
    try {
      const response = await axios.get('http://127.0.0.1:5000');
      setResult(JSON.stringify(response.data, null, 2));
    } catch (error: any) {
      console.error('测试127.0.0.1失败:', error);
      
      // 添加更详细的错误信息
      if (error.response) {
        // 服务器响应了，但状态码不是2xx
        setError(`测试127.0.0.1失败: ${error.message}\n状态码: ${error.response.status}\n响应数据: ${JSON.stringify(error.response.data)}`);
      } else if (error.request) {
        // 请求已发送，但没有收到响应
        setError(`测试127.0.0.1失败: ${error.message}\n请求已发送，但没有收到响应`);
      } else {
        // 请求设置时出错
        setError(`测试127.0.0.1失败: ${error.message}\n请求设置时出错`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const test10022 = async () => {
    setIsLoading(true);
    setResult(null);
    setError(null);
    setSelectedEndpoint('10.0.2.2');
    try {
      const response = await axios.get('http://10.0.2.2:5000');
      setResult(JSON.stringify(response.data, null, 2));
    } catch (error: any) {
      console.error('测试10.0.2.2失败:', error);
      
      // 添加更详细的错误信息
      if (error.response) {
        // 服务器响应了，但状态码不是2xx
        setError(`测试10.0.2.2失败: ${error.message}\n状态码: ${error.response.status}\n响应数据: ${JSON.stringify(error.response.data)}`);
      } else if (error.request) {
        // 请求已发送，但没有收到响应
        setError(`测试10.0.2.2失败: ${error.message}\n请求已发送，但没有收到响应`);
      } else {
        // 请求设置时出错
        setError(`测试10.0.2.2失败: ${error.message}\n请求设置时出错`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const testRealIP = async () => {
    setIsLoading(true);
    setResult(null);
    setError(null);
    setSelectedEndpoint('10.126.1.121');
    try {
      const response = await axios.get('http://10.126.1.121:5000');
      setResult(JSON.stringify(response.data, null, 2));
    } catch (error: any) {
      console.error('测试真实IP失败:', error);
      
      // 添加更详细的错误信息
      if (error.response) {
        // 服务器响应了，但状态码不是2xx
        setError(`测试真实IP失败: ${error.message}\n状态码: ${error.response.status}\n响应数据: ${JSON.stringify(error.response.data)}`);
      } else if (error.request) {
        // 请求已发送，但没有收到响应
        setError(`测试真实IP失败: ${error.message}\n请求已发送，但没有收到响应`);
      } else {
        // 请求设置时出错
        setError(`测试真实IP失败: ${error.message}\n请求设置时出错`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 测试登录
  const testLogin = async () => {
    setIsLoading(true);
    setResult(null);
    setError(null);
    
    const baseUrl = getBaseUrl();
    if (!baseUrl) return;
    
    try {
      const response = await axios.post(`${baseUrl}/users/login`, {
        email,
        password
      });
      setResult(JSON.stringify(response.data, null, 2));
    } catch (error: any) {
      console.error('测试登录失败:', error);
      
      // 添加更详细的错误信息
      if (error.response) {
        // 服务器响应了，但状态码不是2xx
        setError(`测试登录失败: ${error.message}\n状态码: ${error.response.status}\n响应数据: ${JSON.stringify(error.response.data)}`);
      } else if (error.request) {
        // 请求已发送，但没有收到响应
        setError(`测试登录失败: ${error.message}\n请求已发送，但没有收到响应`);
      } else {
        // 请求设置时出错
        setError(`测试登录失败: ${error.message}\n请求设置时出错`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 测试注册
  const testRegister = async () => {
    setIsLoading(true);
    setResult(null);
    setError(null);
    
    const baseUrl = getBaseUrl();
    if (!baseUrl) return;
    
    try {
      const response = await axios.post(`${baseUrl}/users/register`, {
        username,
        email,
        password
      });
      setResult(JSON.stringify(response.data, null, 2));
    } catch (error: any) {
      console.error('测试注册失败:', error);
      
      // 添加更详细的错误信息
      if (error.response) {
        // 服务器响应了，但状态码不是2xx
        setError(`测试注册失败: ${error.message}\n状态码: ${error.response.status}\n响应数据: ${JSON.stringify(error.response.data)}`);
      } else if (error.request) {
        // 请求已发送，但没有收到响应
        setError(`测试注册失败: ${error.message}\n请求已发送，但没有收到响应`);
      } else {
        // 请求设置时出错
        setError(`测试注册失败: ${error.message}\n请求设置时出错`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 获取当前选择的基础URL
  const getBaseUrl = () => {
    switch (selectedEndpoint) {
      case 'localhost':
        return 'http://localhost:5000';
      case '127.0.0.1':
        return 'http://127.0.0.1:5000';
      case '10.0.2.2':
        return 'http://10.0.2.2:5000';
      case '10.126.1.121':
        return 'http://10.126.1.121:5000';
      default:
        setError('请先选择一个服务器地址进行测试');
        setIsLoading(false);
        return null;
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>API连接测试</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>1. 测试服务器连接</Text>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={testLocalhost}>
            <Text style={styles.buttonText}>测试 localhost:5000</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={test127001}>
            <Text style={styles.buttonText}>测试 127.0.0.1:5000</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={test10022}>
            <Text style={styles.buttonText}>测试 10.0.2.2:5000</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={testRealIP}>
            <Text style={styles.buttonText}>测试 10.126.1.121:5000</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>2. 测试用户认证</Text>
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>用户名:</Text>
          <TextInput
            style={styles.input}
            value={username}
            onChangeText={setUsername}
            placeholder="输入用户名"
          />
          
          <Text style={styles.inputLabel}>邮箱:</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="输入邮箱"
            keyboardType="email-address"
          />
          
          <Text style={styles.inputLabel}>密码:</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="输入密码"
            secureTextEntry
          />
        </View>
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[styles.button, !selectedEndpoint ? styles.buttonDisabled : null]} 
            onPress={testLogin}
            disabled={!selectedEndpoint}
          >
            <Text style={styles.buttonText}>测试登录</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.button, !selectedEndpoint ? styles.buttonDisabled : null]} 
            onPress={testRegister}
            disabled={!selectedEndpoint}
          >
            <Text style={styles.buttonText}>测试注册</Text>
          </TouchableOpacity>
        </View>
      </View>

      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3498db" />
          <Text style={styles.loadingText}>测试中...</Text>
        </View>
      )}

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>错误</Text>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {result && (
        <View style={styles.resultContainer}>
          <Text style={styles.resultTitle}>结果</Text>
          <Text style={styles.resultText}>{result}</Text>
        </View>
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
  section: {
    marginVertical: 10,
    padding: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#2c3e50',
  },
  buttonContainer: {
    gap: 10,
  },
  button: {
    backgroundColor: '#3498db',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#95a5a6',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  inputContainer: {
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 16,
    marginBottom: 5,
    color: '#2c3e50',
  },
  input: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#3498db',
  },
  errorContainer: {
    margin: 20,
    padding: 15,
    backgroundColor: '#ffdddd',
    borderRadius: 5,
    borderLeftWidth: 5,
    borderLeftColor: '#e74c3c',
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#c0392b',
    marginBottom: 10,
  },
  errorText: {
    color: '#c0392b',
  },
  resultContainer: {
    margin: 20,
    padding: 15,
    backgroundColor: '#eafaf1',
    borderRadius: 5,
    borderLeftWidth: 5,
    borderLeftColor: '#2ecc71',
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#27ae60',
    marginBottom: 10,
  },
  resultText: {
    color: '#333',
  },
});

export default TestScreen; 