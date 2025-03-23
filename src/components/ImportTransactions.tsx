import React, { useState, useCallback, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Modal, Text, TouchableWithoutFeedback, Platform, Linking, ActivityIndicator } from 'react-native';
import paymentApis from '../utils/paymentApis';
import AppLauncher from '../utils/AppLauncher';

interface ImportTransactionsProps {
  onImportSuccess?: () => void;
}

const ImportTransactions: React.FC<ImportTransactionsProps> = ({ onImportSuccess: _onImportSuccess }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const [debugLog, setDebugLog] = useState<string[]>([]);
  
  const addDebugLog = useCallback((message: string) => {
    console.log(`DEBUG: ${message}`);
    setDebugLog(prev => [...prev, `${new Date().toISOString().substr(11, 8)}: ${message}`]);
  }, []);
  
  useEffect(() => {
    console.log('ImportTransactions component mounted/updated');
    addDebugLog('Component ready');
  }, [addDebugLog]);
  
  const openImportModal = useCallback(() => {
    console.log('Opening import modal');
    setModalVisible(true);
    setDebugLog([]);
    addDebugLog('Modal opened');
  }, [addDebugLog]);

  const closeModal = useCallback(() => {
    console.log('Closing import modal');
    setModalVisible(false);
    setImportLoading(false);
  }, []);
  
  const handleImportAlipay = useCallback(async () => {
    try {
      addDebugLog('Starting Alipay import...');
      setImportLoading(true);
      
      // Try using our native module first
      if (Platform.OS === 'android') {
        addDebugLog('Trying direct launch via native module...');
        try {
          const opened = await AppLauncher.openAlipay();
          addDebugLog(`Native module result: ${opened ? 'SUCCESS' : 'FAILED'}`);
          if (opened) {
            return;
          }
        } catch (error) {
          addDebugLog(`Native module error: ${error instanceof Error ? error.message : String(error)}`);
        }
        
        addDebugLog('Native module failed, falling back to URI scheme...');
      }
      
      // Fall back to the original URI method
      try {
        const success = await paymentApis.openAlipayForAuth();
        addDebugLog(`URI scheme result: ${success ? 'SUCCESS' : 'FAILED'}`);
      } catch (error) {
        addDebugLog(`URI scheme error: ${error instanceof Error ? error.message : String(error)}`);
      }
    } catch (error) {
      addDebugLog(`Global error: ${error instanceof Error ? error.message : String(error)}`);
      console.error('Failed to open Alipay:', error);
    }
  }, [addDebugLog]);

  const handleImportWeChat = useCallback(async () => {
    try {
      addDebugLog('Starting WeChat import...');
      setImportLoading(true);
      
      // Try using our native module first
      if (Platform.OS === 'android') {
        addDebugLog('Trying direct launch via native module...');
        try {
          const opened = await AppLauncher.openWeChat();
          addDebugLog(`Native module result: ${opened ? 'SUCCESS' : 'FAILED'}`);
          if (opened) {
            return;
          }
        } catch (error) {
          addDebugLog(`Native module error: ${error instanceof Error ? error.message : String(error)}`);
        }
        
        addDebugLog('Native module failed, falling back to URI scheme...');
      }
      
      // Fall back to the original URI method
      try {
        const success = await paymentApis.openWeChatForAuth();
        addDebugLog(`URI scheme result: ${success ? 'SUCCESS' : 'FAILED'}`);
      } catch (error) {
        addDebugLog(`URI scheme error: ${error instanceof Error ? error.message : String(error)}`);
      }
    } catch (error) {
      addDebugLog(`Global error: ${error instanceof Error ? error.message : String(error)}`);
      console.error('Failed to open WeChat:', error);
    }
  }, [addDebugLog]);

  const tryDirectLinking = useCallback(async (uri: string, appName: string) => {
    try {
      addDebugLog(`Trying to open ${appName} with direct Linking: ${uri}`);
      await Linking.openURL(uri);
      addDebugLog(`${appName} direct linking attempt succeeded`);
      return true;
    } catch (error) {
      addDebugLog(`${appName} direct linking failed: ${error instanceof Error ? error.message : String(error)}`);
      return false;
    }
  }, [addDebugLog]);

  return (
    <View style={styles.container} pointerEvents="box-none">
      <TouchableOpacity
        style={styles.importButton}
        onPress={openImportModal}
        hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
      >
        <Text style={styles.importButtonText}>Import</Text>
      </TouchableOpacity>

      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeModal}
      >
        <TouchableWithoutFeedback onPress={closeModal}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback onPress={e => e.stopPropagation()}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Import Transactions</Text>
                <Text style={styles.modalText}>
                  Choose a service to import your transactions from:
                </Text>

                <View style={styles.buttonContainer}>
                  <TouchableOpacity
                    style={[styles.serviceButton, styles.alipayButton]}
                    onPress={handleImportAlipay}
                    disabled={importLoading}
                  >
                    <Text style={styles.serviceButtonText}>Alipay</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[styles.serviceButton, styles.wechatButton]}
                    onPress={handleImportWeChat}
                    disabled={importLoading}
                  >
                    <Text style={styles.serviceButtonText}>WeChat</Text>
                  </TouchableOpacity>
                </View>

                {importLoading && (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#0000ff" />
                    <Text style={styles.loadingText}>Attempting to launch app...</Text>
                  </View>
                )}

                {Platform.OS === 'android' && (
                  <View style={styles.debugContainer}>
                    <Text style={styles.debugTitle}>Debug Log:</Text>
                    <View style={styles.debugLogContainer}>
                      {debugLog.map((log, index) => (
                        <Text key={index} style={styles.debugLogText}>{log}</Text>
                      ))}
                    </View>
                    
                    <View style={styles.directLinkContainer}>
                      <TouchableOpacity
                        style={styles.directLinkButton}
                        onPress={() => tryDirectLinking('alipays://', 'Alipay')}
                      >
                        <Text style={styles.directLinkButtonText}>Open Alipay Directly</Text>
                      </TouchableOpacity>
                      
                      <TouchableOpacity
                        style={styles.directLinkButton}
                        onPress={() => tryDirectLinking('weixin://', 'WeChat')}
                      >
                        <Text style={styles.directLinkButtonText}>Open WeChat Directly</Text>
                      </TouchableOpacity>
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
    width: 60,
    height: 30,
    borderRadius: 15,
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
  importButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  modalText: {
    fontSize: 16,
    marginBottom: 20,
    color: '#666',
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 20,
  },
  serviceButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    flex: 0.48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  alipayButton: {
    backgroundColor: '#00a0e9',
  },
  wechatButton: {
    backgroundColor: '#4CAF50',
  },
  serviceButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingContainer: {
    alignItems: 'center',
    marginVertical: 10,
  },
  loadingText: {
    marginTop: 10,
    marginBottom: 5,
    fontSize: 14,
    color: '#666',
  },
  debugContainer: {
    width: '100%',
    marginTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 10,
    maxHeight: 200,
  },
  debugTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  debugLogContainer: {
    backgroundColor: '#f5f5f5',
    padding: 8,
    borderRadius: 5,
    maxHeight: 100,
    width: '100%',
  },
  debugLogText: {
    fontSize: 12,
    color: '#333',
    marginBottom: 2,
  },
  directLinkContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 10,
    marginBottom: 10,
  },
  directLinkButton: {
    backgroundColor: '#FF5722',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 4,
    flex: 0.48,
    alignItems: 'center',
  },
  directLinkButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  closeButton: {
    marginTop: 15,
    padding: 10,
  },
  closeButtonText: {
    color: '#6200ee',
    fontSize: 16,
  },
});

export default ImportTransactions; 