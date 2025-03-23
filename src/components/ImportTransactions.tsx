import React, { useState, useCallback, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Modal, Text, Alert, TouchableWithoutFeedback, Platform } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import paymentApis from '../utils/paymentApis';

interface ImportTransactionsProps {
  onImportSuccess?: () => void;
}

const ImportTransactions: React.FC<ImportTransactionsProps> = ({ onImportSuccess }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [logMessages, setLogMessages] = useState<string[]>([]);
  
  useEffect(() => {
    console.log('ImportTransactions component mounted/updated');
    
    // Check if the apps are installed on component mount
    const checkAppsInstalled = async () => {
      try {
        const alipayInstalled = await paymentApis.isAlipayInstalled();
        const wechatInstalled = await paymentApis.isWeChatInstalled();
        console.log('Alipay installed:', alipayInstalled);
        console.log('WeChat installed:', wechatInstalled);
        addLogMessage(`Alipay installed: ${alipayInstalled}`);
        addLogMessage(`WeChat installed: ${wechatInstalled}`);
      } catch (error) {
        console.error('Error checking apps:', error);
        addLogMessage(`Error checking apps: ${error}`);
      }
    };
    
    checkAppsInstalled();
  }, []);
  
  const addLogMessage = (message: string) => {
    setLogMessages(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };
  
  const openImportModal = useCallback(() => {
    console.log('Opening import modal');
    setModalVisible(true);
    setLogMessages([]);
  }, []);

  const closeModal = useCallback(() => {
    console.log('Closing import modal');
    setModalVisible(false);
  }, []);

  const handleImport = useCallback(async (platform: 'alipay' | 'wechat') => {
    console.log(`Attempting to import from ${platform}`);
    addLogMessage(`Attempting to import from ${platform}`);
    setIsImporting(true);
    
    try {
      // Check if the app is installed first
      const isInstalled = platform === 'alipay' 
        ? await paymentApis.isAlipayInstalled()
        : await paymentApis.isWeChatInstalled();
      
      addLogMessage(`${platform === 'alipay' ? 'Alipay' : 'WeChat'} installed: ${isInstalled}`);
      
      if (!isInstalled) {
        addLogMessage(`${platform === 'alipay' ? 'Alipay' : 'WeChat'} not installed`);
        Alert.alert(
          'App Not Installed', 
          `${platform === 'alipay' ? 'Alipay' : 'WeChat'} is not installed on your device.`,
          [{ text: 'OK' }]
        );
        setIsImporting(false);
        return;
      }
      
      // Try to open the app
      const success = platform === 'alipay'
        ? await paymentApis.openAlipayForAuth()
        : await paymentApis.openWeChatForAuth();
      
      addLogMessage(`Open ${platform} result: ${success}`);
      
      if (success) {
        addLogMessage(`Successfully opened ${platform}`);
        
        // Simulate successful import with mock data
        setTimeout(() => {
          addLogMessage(`Simulating successful import`);
          setModalVisible(false);
          if (onImportSuccess) {
            onImportSuccess();
          }
        }, 1000);
      } else {
        addLogMessage(`Failed to open ${platform}`);
        Alert.alert(
          'Error Opening App',
          `Failed to open ${platform === 'alipay' ? 'Alipay' : 'WeChat'}. Please make sure the app is installed and try again.`,
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error(`Error importing from ${platform}:`, error);
      addLogMessage(`Error: ${error}`);
      Alert.alert(
        'Import Error',
        `An error occurred while trying to import from ${platform === 'alipay' ? 'Alipay' : 'WeChat'}.`,
        [{ text: 'OK' }]
      );
    } finally {
      setIsImporting(false);
    }
  }, [onImportSuccess]);

  return (
    <View style={styles.container} pointerEvents="box-none">
      <TouchableOpacity
        style={styles.importButton}
        onPress={openImportModal}
        activeOpacity={0.7}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons name="download-outline" size={24} color="#fff" />
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeModal}
      >
        <TouchableWithoutFeedback onPress={closeModal}>
          <View style={styles.modalBackground}>
            <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
              <View style={styles.modalContainer}>
                <Text style={styles.modalTitle}>Import Transactions</Text>
                <Text style={styles.modalSubtitle}>Select Platform:</Text>
                
                <View style={styles.buttonContainer}>
                  <TouchableOpacity
                    style={[styles.platformButton, isImporting && styles.disabledButton]}
                    onPress={() => handleImport('alipay')}
                    disabled={isImporting}
                  >
                    <Text style={styles.buttonText}>Alipay</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[styles.platformButton, isImporting && styles.disabledButton]}
                    onPress={() => handleImport('wechat')}
                    disabled={isImporting}
                  >
                    <Text style={styles.buttonText}>WeChat</Text>
                  </TouchableOpacity>
                </View>
                
                {isImporting && (
                  <Text style={styles.loadingText}>Connecting to payment platform...</Text>
                )}
                
                {Platform.OS === 'android' && (
                  <View style={styles.debugContainer}>
                    <Text style={styles.debugTitle}>Debug Log:</Text>
                    <View style={styles.logContainer}>
                      {logMessages.map((msg, index) => (
                        <Text key={index} style={styles.logMessage}>{msg}</Text>
                      ))}
                    </View>
                  </View>
                )}
                
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={closeModal}
                >
                  <Text style={styles.closeButtonText}>Close</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    right: 0,
    zIndex: 100,
  },
  importButton: {
    backgroundColor: '#6200ee',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    marginTop: 5,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  modalSubtitle: {
    fontSize: 16,
    marginBottom: 20,
    color: '#666',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 20,
  },
  platformButton: {
    backgroundColor: '#6200ee',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    flex: 0.48,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#A6A6A6',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingText: {
    marginTop: 10,
    marginBottom: 15,
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  closeButton: {
    marginTop: 15,
    padding: 10,
  },
  closeButtonText: {
    color: '#6200ee',
    fontSize: 16,
  },
  debugContainer: {
    width: '100%',
    marginTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 10,
  },
  debugTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  logContainer: {
    backgroundColor: '#f5f5f5',
    padding: 8,
    borderRadius: 5,
    maxHeight: 150,
  },
  logMessage: {
    fontSize: 12,
    color: '#333',
    marginBottom: 2,
  }
});

export default ImportTransactions; 