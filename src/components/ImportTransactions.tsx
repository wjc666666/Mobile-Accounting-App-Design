import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Modal, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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
    try {
      let isInstalled = false;
      
      if (app === 'alipay') {
        isInstalled = await paymentApis.isAlipayInstalled();
      } else if (app === 'wechat') {
        isInstalled = await paymentApis.isWeChatInstalled();
      }
      
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
    try {
      setIsLoading(true);
      setLoadingMessage('Checking Alipay installation...');
      
      const isInstalled = await checkAppInstallation('alipay');
      if (!isInstalled) {
        setIsLoading(false);
        return;
      }
      
      setLoadingMessage('Opening Alipay for authorization...');
      const authResult = await paymentApis.openAlipayForAuth();
      
      if (!authResult) {
        Alert.alert('Authorization Failed', 'Failed to authorize with Alipay', [{ text: 'OK' }]);
        setIsLoading(false);
        return;
      }
      
      // In a real app, you'd wait for a callback from Alipay here
      // For demo purposes, we'll just proceed with importing bills
      
      setLoadingMessage('Importing bills from Alipay...');
      const { startDate, endDate } = getCurrentMonthDates();
      const transactions = await paymentApis.importAlipayBills(startDate, endDate);
      
      if (transactions.length === 0) {
        Alert.alert('No Transactions', 'No transactions found for the current month', [{ text: 'OK' }]);
        setIsLoading(false);
        return;
      }
      
      await saveImportedTransactions(transactions);
      
    } catch (error) {
      console.error('Error importing from Alipay:', error);
      Alert.alert('Import Failed', 'Failed to import transactions from Alipay', [{ text: 'OK' }]);
      setIsLoading(false);
    }
  };

  const importFromWeChat = async () => {
    try {
      setIsLoading(true);
      setLoadingMessage('Checking WeChat installation...');
      
      const isInstalled = await checkAppInstallation('wechat');
      if (!isInstalled) {
        setIsLoading(false);
        return;
      }
      
      setLoadingMessage('Opening WeChat for authorization...');
      const authResult = await paymentApis.openWeChatForAuth();
      
      if (!authResult) {
        Alert.alert('Authorization Failed', 'Failed to authorize with WeChat', [{ text: 'OK' }]);
        setIsLoading(false);
        return;
      }
      
      // In a real app, you'd wait for a callback from WeChat here
      
      setLoadingMessage('Importing bills from WeChat...');
      const { startDate, endDate } = getCurrentMonthDates();
      const transactions = await paymentApis.importWeChatBills(startDate, endDate);
      
      if (transactions.length === 0) {
        Alert.alert('No Transactions', 'No transactions found for the current month', [{ text: 'OK' }]);
        setIsLoading(false);
        return;
      }
      
      await saveImportedTransactions(transactions);
      
    } catch (error) {
      console.error('Error importing from WeChat:', error);
      Alert.alert('Import Failed', 'Failed to import transactions from WeChat', [{ text: 'OK' }]);
      setIsLoading(false);
    }
  };

  const saveImportedTransactions = async (transactions: ImportedTransaction[]) => {
    try {
      setLoadingMessage('Saving imported transactions...');
      
      const result = await paymentApis.saveImportedTransactions(transactions);
      
      if (result.success) {
        setIsLoading(false);
        setIsModalVisible(false);
        
        // Show success message
        Alert.alert(
          'Import Successful',
          `Successfully imported ${transactions.length} transactions`,
          [{ text: 'OK' }]
        );
        
        // Call the onSuccess callback
        if (onImportSuccess && result.summary) {
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

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.importButton}
        onPress={() => setIsModalVisible(true)}
      >
        <Ionicons name="cloud-download-outline" size={20} color="white" />
        <Text style={styles.importButtonText}>Import</Text>
      </TouchableOpacity>
      
      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Import Transactions</Text>
            <Text style={styles.modalSubtitle}>Import transactions from other payment platforms</Text>
            
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#9b59b6" />
                <Text style={styles.loadingText}>{loadingMessage}</Text>
              </View>
            ) : (
              <View style={styles.optionsContainer}>
                <TouchableOpacity
                  style={[styles.optionButton, styles.alipayButton]}
                  onPress={importFromAlipay}
                >
                  <Ionicons name="logo-alipay" size={24} color="white" />
                  <Text style={styles.optionButtonText}>Import from Alipay</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.optionButton, styles.wechatButton]}
                  onPress={importFromWeChat}
                >
                  <Ionicons name="logo-wechat" size={24} color="white" />
                  <Text style={styles.optionButtonText}>Import from WeChat</Text>
                </TouchableOpacity>
              </View>
            )}
            
            {!isLoading && (
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setIsModalVisible(false)}
              >
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  importButton: {
    flexDirection: 'row',
    backgroundColor: '#9b59b6',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  importButtonText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 5,
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
});

export default ImportTransactions; 