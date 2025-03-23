import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Modal, ActivityIndicator } from 'react-native';
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
          `${app === 'alipay' ? '支付宝' : '微信'}未安装`,
          `请安装${app === 'alipay' ? '支付宝' : '微信'}后继续。`,
          [{ text: '确定' }]
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
      setLoadingMessage('检查支付宝安装状态...');
      
      const isInstalled = await checkAppInstallation('alipay');
      if (!isInstalled) {
        setIsLoading(false);
        return;
      }
      
      setLoadingMessage('正在打开支付宝账单页面...');
      
      // 打开支付宝账单页面
      const authResult = await paymentApis.openAlipayForAuth();
      
      if (!authResult) {
        Alert.alert('打开失败', '无法打开支付宝应用', [{ text: '确定' }]);
        setIsLoading(false);
        return;
      }
      
      // 显示导入说明
      setIsLoading(false);
      setShowImportInstructions(true);
      
    } catch (error) {
      console.error('Error importing from Alipay:', error);
      Alert.alert('导入失败', '从支付宝导入交易记录失败', [{ text: '确定' }]);
      setIsLoading(false);
    }
  };

  const importFromWeChat = async () => {
    try {
      setIsLoading(true);
      setLoadingMessage('检查微信安装状态...');
      
      const isInstalled = await checkAppInstallation('wechat');
      if (!isInstalled) {
        setIsLoading(false);
        return;
      }
      
      setLoadingMessage('正在打开微信账单页面...');
      
      // 打开微信账单页面
      const authResult = await paymentApis.openWeChatForAuth();
      
      if (!authResult) {
        Alert.alert('打开失败', '无法打开微信应用', [{ text: '确定' }]);
        setIsLoading(false);
        return;
      }
      
      // 显示导入说明
      setIsLoading(false);
      setShowImportInstructions(true);
      
    } catch (error) {
      console.error('Error importing from WeChat:', error);
      Alert.alert('导入失败', '从微信导入交易记录失败', [{ text: '确定' }]);
      setIsLoading(false);
    }
  };

  // 模拟导入数据（实际应用中会与真实支付平台连接）
  const mockImportData = async () => {
    try {
      setIsLoading(true);
      setLoadingMessage('正在导入交易数据...');
      
      // 获取当前月份的开始和结束日期
      const { startDate, endDate } = getCurrentMonthDates();
      
      // 模拟从支付宝和微信导入交易记录
      const alipayTransactions = await paymentApis.importAlipayBills(startDate, endDate);
      const wechatTransactions = await paymentApis.importWeChatBills(startDate, endDate);
      
      // 合并交易记录
      const transactions = [...alipayTransactions, ...wechatTransactions];
      
      if (transactions.length === 0) {
        Alert.alert('没有交易记录', '当前月份没有找到交易记录', [{ text: '确定' }]);
        setIsLoading(false);
        return;
      }
      
      // 保存导入的交易记录
      await saveImportedTransactions(transactions);
      
    } catch (error) {
      console.error('Error importing data:', error);
      Alert.alert('导入失败', '导入交易记录失败', [{ text: '确定' }]);
      setIsLoading(false);
    }
  };

  const saveImportedTransactions = async (transactions: ImportedTransaction[]) => {
    try {
      setLoadingMessage('保存导入的交易记录...');
      
      const result = await paymentApis.saveImportedTransactions(transactions);
      
      if (result.success) {
        setIsLoading(false);
        setIsModalVisible(false);
        setShowImportInstructions(false);
        
        // 显示成功消息
        Alert.alert(
          '导入成功',
          `成功导入 ${transactions.length} 条交易记录`,
          [{ text: '确定' }]
        );
        
        // 调用成功回调函数
        if (onImportSuccess && result.summary) {
          onImportSuccess(result.summary);
        }
      } else {
        throw new Error('保存交易记录失败');
      }
    } catch (error) {
      console.error('Error saving imported transactions:', error);
      Alert.alert('保存失败', '保存导入的交易记录失败', [{ text: '确定' }]);
      setIsLoading(false);
    }
  };

  // 导入说明界面
  const renderImportInstructions = () => {
    return (
      <View style={styles.instructionsContainer}>
        <Text style={styles.modalTitle}>导入说明</Text>
        <Text style={styles.instructionText}>
          1. 在支付宝/微信账单页面中，选择您需要导入的账单
        </Text>
        <Text style={styles.instructionText}>
          2. 下载或导出账单到手机上
        </Text>
        <Text style={styles.instructionText}>
          3. 返回本应用，点击下方"导入已选择的账单"按钮
        </Text>
        
        <TouchableOpacity
          style={[styles.optionButton, styles.importButton]}
          onPress={mockImportData}
        >
          <Ionicons name="cloud-download-outline" size={24} color="white" />
          <Text style={styles.optionButtonText}>导入已选择的账单</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => setShowImportInstructions(false)}
        >
          <Text style={styles.closeButtonText}>取消</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.importButton}
        onPress={() => setIsModalVisible(true)}
      >
        <Ionicons name="cloud-download-outline" size={20} color="white" />
        <Text style={styles.importButtonText}>导入</Text>
      </TouchableOpacity>
      
      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalContainer}>
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
                <Text style={styles.modalTitle}>导入交易记录</Text>
                <Text style={styles.modalSubtitle}>从其他支付平台导入交易记录</Text>
                
                <View style={styles.optionsContainer}>
                  <TouchableOpacity
                    style={[styles.optionButton, styles.alipayButton]}
                    onPress={importFromAlipay}
                  >
                    <Ionicons name="logo-alipay" size={24} color="white" />
                    <Text style={styles.optionButtonText}>从支付宝导入</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[styles.optionButton, styles.wechatButton]}
                    onPress={importFromWeChat}
                  >
                    <Ionicons name="logo-wechat" size={24} color="white" />
                    <Text style={styles.optionButtonText}>从微信导入</Text>
                  </TouchableOpacity>
                </View>
                
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setIsModalVisible(false)}
                >
                  <Text style={styles.closeButtonText}>关闭</Text>
                </TouchableOpacity>
              </>
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