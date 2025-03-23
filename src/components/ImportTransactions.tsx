import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Modal, ActivityIndicator, Platform, TouchableWithoutFeedback, Button } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import paymentApis, { ImportedTransaction } from '../utils/paymentApis';

interface ImportTransactionsProps {
  onImportSuccess: (summary: {
    income: number;
    incomeTotal: number;
    expense: number;
    expenseTotal: number;
  }) => void;
}

const ImportTransactions: React.FC<ImportTransactionsProps> = ({ onImportSuccess }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [showImportInstructions, setShowImportInstructions] = useState(false);

  // 确保组件每次重新渲染时都能响应触摸事件
  useEffect(() => {
    console.log('ImportTransactions component mounted or updated');
    
    // 清理函数
    return () => {
      console.log('ImportTransactions component will unmount');
    };
  }, []);

  console.log('ImportTransactions component rendering, modal visible:', isModalVisible);

  // Get the current month's start and end dates
  const getCurrentMonthDates = () => {
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0]
    };
  };

  const checkAppInstallation = async (app: 'alipay' | 'wechat') => {
    console.log(`Checking if ${app} is installed`);
    try {
      let isInstalled = false;
      
      if (app === 'alipay') {
        isInstalled = await paymentApis.isAlipayInstalled();
      } else if (app === 'wechat') {
        isInstalled = await paymentApis.isWeChatInstalled();
      }
      
      console.log(`${app} installed:`, isInstalled);
      
      if (!isInstalled) {
        Alert.alert(
          `${app === 'alipay' ? 'Alipay' : 'WeChat'} Not Found`,
          `Please install ${app === 'alipay' ? 'Alipay' : 'WeChat'} to continue.`,
          [{ text: 'OK' }]
        );
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error checking app installation:', error);
      return false;
    }
  };

  const importFromAlipay = async () => {
    console.log('importFromAlipay button pressed');
    try {
      setIsLoading(true);
      setLoadingMessage('Checking Alipay installation...');
      
      const isInstalled = await checkAppInstallation('alipay');
      if (!isInstalled) {
        setIsLoading(false);
        return;
      }
      
      setLoadingMessage('Opening Alipay bills page...');
      
      // 打开支付宝账单页面
      console.log('Attempting to open Alipay with URL scheme');
      const authResult = await paymentApis.openAlipayForAuth();
      console.log('openAlipayForAuth result:', authResult);
      
      if (!authResult) {
        Alert.alert('Failed to Open', 'Could not open Alipay app', [{ text: 'OK' }]);
        setIsLoading(false);
        return;
      }
      
      // 显示导入说明
      console.log('Setting isLoading to false and showing import instructions');
      setIsLoading(false);
      setShowImportInstructions(true);
      
    } catch (error) {
      console.error('Error importing from Alipay:', error);
      Alert.alert('Import Failed', 'Failed to import transactions from Alipay', [{ text: 'OK' }]);
      setIsLoading(false);
    }
  };

  const importFromWeChat = async () => {
    console.log('importFromWeChat button pressed');
    try {
      setIsLoading(true);
      setLoadingMessage('Checking WeChat installation...');
      
      const isInstalled = await checkAppInstallation('wechat');
      if (!isInstalled) {
        setIsLoading(false);
        return;
      }
      
      setLoadingMessage('Opening WeChat bills page...');
      
      // 打开微信账单页面
      console.log('Attempting to open WeChat with URL scheme');
      const authResult = await paymentApis.openWeChatForAuth();
      console.log('openWeChatForAuth result:', authResult);
      
      if (!authResult) {
        Alert.alert('Failed to Open', 'Could not open WeChat app', [{ text: 'OK' }]);
        setIsLoading(false);
        return;
      }
      
      // 显示导入说明
      console.log('Setting isLoading to false and showing import instructions');
      setIsLoading(false);
      setShowImportInstructions(true);
      
    } catch (error) {
      console.error('Error importing from WeChat:', error);
      Alert.alert('Import Failed', 'Failed to import transactions from WeChat', [{ text: 'OK' }]);
      setIsLoading(false);
    }
  };

  // 模拟导入数据（实际应用中会与真实支付平台连接）
  const mockImportData = async () => {
    console.log('mockImportData button pressed');
    try {
      setIsLoading(true);
      setLoadingMessage('Importing transaction data...');
      
      // 获取当前月份的开始和结束日期
      const { startDate, endDate } = getCurrentMonthDates();
      console.log('Date range:', startDate, 'to', endDate);
      
      // 模拟从支付宝和微信导入交易记录
      console.log('Importing mock Alipay bills');
      const alipayTransactions = await paymentApis.importAlipayBills(startDate, endDate);
      console.log('Alipay transactions:', alipayTransactions.length);
      
      console.log('Importing mock WeChat bills');
      const wechatTransactions = await paymentApis.importWeChatBills(startDate, endDate);
      console.log('WeChat transactions:', wechatTransactions.length);
      
      // 合并交易记录
      const transactions = [...alipayTransactions, ...wechatTransactions];
      console.log('Total transactions to save:', transactions.length);
      
      if (transactions.length === 0) {
        Alert.alert('No Transactions', 'No transactions found for the current month', [{ text: 'OK' }]);
        setIsLoading(false);
        return;
      }
      
      // 保存导入的交易记录
      await saveImportedTransactions(transactions);
      
    } catch (error) {
      console.error('Error importing data:', error);
      Alert.alert('Import Failed', 'Failed to import transactions', [{ text: 'OK' }]);
      setIsLoading(false);
    }
  };

  const saveImportedTransactions = async (transactions: ImportedTransaction[]) => {
    console.log('Saving imported transactions:', transactions.length);
    try {
      setLoadingMessage('Saving imported transactions...');
      
      console.log('Calling API to save transactions');
      const result = await paymentApis.saveImportedTransactions(transactions);
      console.log('Save result:', result);
      
      if (result.success) {
        setIsLoading(false);
        setIsModalVisible(false);
        setShowImportInstructions(false);
        
        // 显示成功消息
        Alert.alert(
          'Import Successful',
          `Successfully imported ${transactions.length} transactions`,
          [{ text: 'OK' }]
        );
        
        // 调用成功回调函数
        if (onImportSuccess && result.summary) {
          console.log('Calling onImportSuccess with summary:', result.summary);
          onImportSuccess(result.summary);
        }
      } else {
        throw new Error('Failed to save transactions');
      }
    } catch (error) {
      console.error('Error saving imported transactions:', error);
      Alert.alert('Save Failed', 'Failed to save imported transactions', [{ text: 'OK' }]);
      setIsLoading(false);
    }
  };

  // 导入说明界面
  const renderImportInstructions = () => {
    return (
      <View style={styles.instructionsContainer}>
        <Text style={styles.modalTitle}>Import Instructions</Text>
        <Text style={styles.instructionText}>
          1. Select the transactions you want to import in Alipay/WeChat
        </Text>
        <Text style={styles.instructionText}>
          2. Download or export the bills to your device
        </Text>
        <Text style={styles.instructionText}>
          3. Return to this app and tap the "Import Selected Bills" button below
        </Text>
        
        <TouchableOpacity
          style={[styles.optionButton, styles.importButton]}
          onPress={mockImportData}
          activeOpacity={0.7}
        >
          <Ionicons name="cloud-download-outline" size={24} color="white" />
          <Text style={styles.optionButtonText}>Import Selected Bills</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => setShowImportInstructions(false)}
          activeOpacity={0.7}
        >
          <Text style={styles.closeButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    );
  };

  // Debug import touches
  const handleImportPress = () => {
    console.log('DIRECT BUTTON PRESS - IMPORT BUTTON PRESSED');
    Alert.alert('Button Pressed', 'Import button was pressed!');
    setIsModalVisible(true);
  };

  // 关闭模态框
  const closeModal = useCallback(() => {
    console.log('Close button pressed');
    setIsModalVisible(false);
  }, []);

  return (
    <View style={styles.outerContainer}>
      {/* Basic button without any fancy styling to test touch responsiveness */}
      <Button 
        title="Import" 
        onPress={handleImportPress} 
        color="#9b59b6"
      />
      
      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          console.log('Modal closed via back button/gesture');
          setIsModalVisible(false);
        }}
      >
        <TouchableWithoutFeedback onPress={() => {
          console.log('Background pressed, closing modal');
          setIsModalVisible(false);
        }}>
          <View style={styles.modalContainer}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                {isLoading ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#9b59b6" />
                    <Text style={styles.loadingText}>{loadingMessage}</Text>
                  </View>
                ) : showImportInstructions ? (
                  renderImportInstructions()
                ) : (
                  <>
                    <Text style={styles.modalTitle}>Import Transactions</Text>
                    <Text style={styles.modalSubtitle}>Import transactions from other payment platforms</Text>
                    
                    <View style={styles.optionsContainer}>
                      <TouchableOpacity
                        style={[styles.optionButton, styles.alipayButton]}
                        onPress={importFromAlipay}
                        activeOpacity={0.7}
                      >
                        <Ionicons name="logo-alipay" size={24} color="white" />
                        <Text style={styles.optionButtonText}>Import from Alipay</Text>
                      </TouchableOpacity>
                      
                      <TouchableOpacity
                        style={[styles.optionButton, styles.wechatButton]}
                        onPress={importFromWeChat}
                        activeOpacity={0.7}
                      >
                        <Ionicons name="logo-wechat" size={24} color="white" />
                        <Text style={styles.optionButtonText}>Import from WeChat</Text>
                      </TouchableOpacity>
                    </View>
                    
                    <TouchableOpacity
                      style={styles.closeButton}
                      onPress={closeModal}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.closeButtonText}>Close</Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    // Simplified container with no fancy styling that could block touches
    minWidth: 100,
  },
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
    minWidth: 100,
    minHeight: 40,
  },
  importButton: {
    flexDirection: 'row',
    backgroundColor: '#9b59b6',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: Platform.OS === 'android' ? 5 : 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  optionsContainer: {
    width: '100%',
    marginBottom: 20,
  },
  optionButton: {
    flexDirection: 'row',
    width: '100%',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  alipayButton: {
    backgroundColor: '#1677FF',
  },
  wechatButton: {
    backgroundColor: '#07C160',
  },
  optionButtonText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 10,
  },
  closeButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  closeButtonText: {
    color: '#666',
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
  },
  instructionsContainer: {
    width: '100%',
    alignItems: 'center',
  },
  instructionText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 10,
    textAlign: 'left',
    alignSelf: 'stretch',
  },
});

export default ImportTransactions; 