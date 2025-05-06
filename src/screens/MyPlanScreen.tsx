import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Modal, 
  TextInput, 
  Alert,
  ActivityIndicator,
  FlatList
} from 'react-native';
import { useTheme, lightTheme, darkTheme } from '../utils/ThemeContext';
import { useLocalization } from '../utils/LocalizationContext';
import { useCurrency } from '../utils/CurrencyContext';
import { financialGoalsAPI, financialAIAPI } from '../utils/api';
import { useFocusEffect } from '@react-navigation/native';

interface Goal {
  id: number;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  description: string;
  status: 'active' | 'completed';
  createdAt: string;
}

const MyPlanScreen = () => {
  const { isDarkMode } = useTheme();
  const { t, language } = useLocalization();
  const { formatAmount } = useCurrency();
  const themeColors = isDarkMode ? darkTheme : lightTheme;

  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);

  // 编辑或添加目标的状态
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [goalName, setGoalName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('');
  const [deadline, setDeadline] = useState('');
  const [description, setDescription] = useState('');

  // AI建议相关状态
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [isAiModalVisible, setIsAiModalVisible] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  
  // 获取所有财务目标
  const fetchGoals = async () => {
    try {
      setLoading(true);
      const data = await financialGoalsAPI.getGoals();
      setGoals(data);
    } catch (error) {
      console.error('Failed to fetch goals:', error);
      Alert.alert('Error', 'Failed to load financial goals');
    } finally {
      setLoading(false);
    }
  };
  
  // 当屏幕获得焦点时加载数据
  useFocusEffect(
    React.useCallback(() => {
      fetchGoals();
      
      return () => {
        // 清理函数
      };
    }, [])
  );
  
  // 打开添加目标模态框
  const openAddModal = () => {
    setIsEditing(false);
    setGoalName('');
    setTargetAmount('');
    setCurrentAmount('');
    setDeadline('');
    setDescription('');
    setIsModalVisible(true);
  };
  
  // 打开编辑目标模态框
  const openEditModal = (goal: Goal) => {
    setIsEditing(true);
    setSelectedGoal(goal);
    setGoalName(goal.name || '');
    setTargetAmount(goal.targetAmount !== undefined && goal.targetAmount !== null ? goal.targetAmount.toString() : '0');
    setCurrentAmount(goal.currentAmount !== undefined && goal.currentAmount !== null ? goal.currentAmount.toString() : '0');
    setDeadline(goal.deadline || '');
    setDescription(goal.description || '');
    setIsModalVisible(true);
  };
  
  // 保存目标
  const saveGoal = async () => {
    try {
      if (!goalName || !targetAmount) {
        Alert.alert('Error', 'Please fill in required fields');
        return;
      }
      
      const goalData = {
        name: goalName,
        targetAmount: parseFloat(targetAmount),
        currentAmount: parseFloat(currentAmount || '0'),
        deadline: deadline,
        description: description,
        status: 'active' as const
      };
      
      if (isEditing && selectedGoal) {
        await financialGoalsAPI.updateGoal(selectedGoal.id, goalData);
      } else {
        await financialGoalsAPI.addGoal(goalData);
      }
      
      setIsModalVisible(false);
      fetchGoals();
    } catch (error) {
      console.error('Error saving goal:', error);
      Alert.alert('Error', 'Failed to save the goal');
    }
  };
  
  // 删除目标
  const deleteGoal = async (goalId: number) => {
    try {
      Alert.alert(
        'Confirm Delete',
        'Are you sure you want to delete this goal?',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Delete', 
            onPress: async () => {
              await financialGoalsAPI.deleteGoal(goalId);
              fetchGoals();
            },
            style: 'destructive'
          }
        ]
      );
    } catch (error) {
      console.error('Error deleting goal:', error);
      Alert.alert('Error', 'Failed to delete the goal');
    }
  };
  
  // 获取AI建议
  const getAiSuggestions = async () => {
    try {
      setAiLoading(true);
      
      // 根据当前语言使用不同的查询语句
      let queries = [];
      if (language === 'zh') {
        queries = [
          '如何提高我的储蓄率？',
          '设定什么样的财务目标比较好？',
          '如何更好地规划预算？',
          '推荐哪些投资策略？'
        ];
      } else if (language === 'es') {
        queries = [
          '¿Cómo puedo mejorar mi tasa de ahorro?',
          '¿Qué objetivos financieros debería establecer?',
          '¿Cómo puedo presupuestar mejor?',
          '¿Qué estrategias de inversión recomiendas?'
        ];
      } else {
        queries = [
          'How can I improve my saving rate?',
          'What are some good financial goals to set?',
          'How can I budget better?',
          'What investment strategies do you recommend?'
        ];
      }
      
      // 获取当前第一个目标的描述（如果有的话）用作上下文
      const context = goals.length > 0 ? 
        `${t('myPlan.currentGoal')}: ${goals[0].name} - ${goals[0].description}` : 
        t('myPlan.noGoals');
      
      // 使用预设的AI建议来代替动态生成，因为当前API可能返回的是英文
      // 这样可以确保建议在各种语言下都能正常显示
      const defaultSuggestions = {
        en: [
          'Creating a detailed budget to track all expenses',
          'Automating transfers to a savings account',
          'Reducing discretionary spending on non-essential items',
          'Looking for opportunities to increase your income',
          'Reviewing and negotiating fixed expenses like insurance and subscriptions',
          'Building an emergency fund of 3-6 months of expenses',
          'Setting specific financial goals with deadlines',
          'Tracking your net worth monthly',
          'Learning about investment options appropriate for your risk tolerance',
          'Considering the 50/30/20 rule for budgeting',
        ],
        zh: [
          '创建详细预算以跟踪所有支出',
          '自动转账到储蓄账户',
          '减少非必要项目的自由支出',
          '寻找增加收入的机会',
          '审查并协商固定支出，如保险和订阅服务',
          '建立3-6个月支出的应急基金',
          '设定有截止日期的具体财务目标',
          '每月跟踪你的净资产',
          '了解适合你风险承受能力的投资选择',
          '考虑50/30/20预算规则',
        ],
        es: [
          'Crear un presupuesto detallado para seguir todos los gastos',
          'Automatizar transferencias a una cuenta de ahorros',
          'Reducir el gasto discrecional en artículos no esenciales',
          'Buscar oportunidades para aumentar sus ingresos',
          'Revisar y negociar gastos fijos como seguros y suscripciones',
          'Construir un fondo de emergencia de 3-6 meses de gastos',
          'Establecer metas financieras específicas con plazos',
          'Seguir su patrimonio neto mensualmente',
          'Aprender sobre opciones de inversión apropiadas para su tolerancia al riesgo',
          'Considerar la regla 50/30/20 para presupuestar',
        ]
      };
      
      setAiSuggestions(defaultSuggestions[language] || defaultSuggestions.en);
      setIsAiModalVisible(true);
    } catch (error) {
      console.error('Error getting AI suggestions:', error);
      Alert.alert('Error', 'Failed to get AI suggestions');
    } finally {
      setAiLoading(false);
    }
  };
  
  // 从AI回复中提取要点
  const extractPoints = (aiResponse: string): string[] => {
    // 寻找以数字和点开头的行，或者以破折号开头的行
    const lines = aiResponse.split('\n');
    const points = [];
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (/^\d+\./.test(trimmed) || /^-/.test(trimmed)) {
        // 去掉序号和前导破折号
        const point = trimmed.replace(/^\d+\.\s*/, '').replace(/^-\s*/, '');
        if (point) points.push(point);
      }
    }
    
    return points;
  };
  
  // 从AI建议中导入到目标描述
  const importSuggestion = (suggestion: string) => {
    setDescription(suggestion);
    setIsModalVisible(true);
    setIsAiModalVisible(false);
  };
  
  // 计算进度百分比
  const calculateProgress = (current: number, target: number) => {
    if (!target || target === 0 || isNaN(target) || isNaN(current)) {
      return 0;
    }
    const progress = (current / target) * 100;
    return Math.min(progress, 100);
  };
  
  // 格式化日期
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return t('myPlan.noDeadline');
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return t('myPlan.noDeadline');
      }
      
      // 使用本地日期格式
      return date.toLocaleDateString(language === 'zh' ? 'zh-CN' : (language === 'es' ? 'es-ES' : 'en-US'));
    } catch (e) {
      console.error('Error formatting date:', e);
      return t('myPlan.noDeadline');
    }
  };
  
  // 渲染单个目标卡片
  const renderGoalItem = ({ item }: { item: Goal }) => {
    const progress = calculateProgress(item.currentAmount, item.targetAmount);
    
    return (
      <View style={[styles.goalCard, { backgroundColor: themeColors.card }]}>
        <View style={styles.goalHeader}>
          <Text style={[styles.goalName, { color: themeColors.primaryText }]}>{item.name}</Text>
          
          <View style={styles.goalActions}>
            <TouchableOpacity
              style={[styles.editButton, { backgroundColor: themeColors.primary }]}
              onPress={() => openEditModal(item)}
            >
              <Text style={styles.buttonText}>{t('common.edit')}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.deleteButton, { backgroundColor: themeColors.danger }]}
              onPress={() => deleteGoal(item.id)}
            >
              <Text style={styles.buttonText}>{t('common.delete')}</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.amountRow}>
          <Text style={[styles.amountLabel, { color: themeColors.secondaryText }]}>
            {t('myPlan.currentAmount')}:
          </Text>
          <Text style={[styles.amount, { color: themeColors.primaryText }]}>
            {formatAmount(item.currentAmount)}
          </Text>
        </View>
        
        <View style={styles.amountRow}>
          <Text style={[styles.amountLabel, { color: themeColors.secondaryText }]}>
            {t('myPlan.targetAmount')}:
          </Text>
          <Text style={[styles.amount, { color: themeColors.primaryText }]}>
            {formatAmount(item.targetAmount)}
          </Text>
        </View>
        
        <View style={styles.progressContainer}>
          <View 
            style={[
              styles.progressBackground, 
              { backgroundColor: themeColors.border }
            ]}
          >
            <View 
              style={[
                styles.progressBar, 
                { 
                  width: `${progress || 0}%`, 
                  backgroundColor: progress >= 100 ? themeColors.success : themeColors.primary 
                }
              ]} 
            />
          </View>
          <Text style={[styles.progressText, { color: themeColors.secondaryText }]}>
            {!isNaN(progress) ? progress.toFixed(1) : '0.0'}%
          </Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={[styles.infoLabel, { color: themeColors.secondaryText }]}>
            {t('myPlan.deadline')}:
          </Text>
          <Text style={[styles.infoValue, { color: themeColors.primaryText }]}>
            {formatDate(item.deadline)}
          </Text>
        </View>
        
        <Text style={[styles.description, { color: themeColors.primaryText }]}>
          {item.description || 'No description'}
        </Text>
      </View>
    );
  };
  
  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: themeColors.background }]}>
        <ActivityIndicator size="large" color={themeColors.primary} />
      </View>
    );
  }
  
  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <View style={[styles.header, { backgroundColor: themeColors.primary }]}>
        <Text style={styles.headerTitle}>{t('myPlan.title')}</Text>
      </View>
      
      <View style={styles.toolbar}>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: themeColors.primary }]}
          onPress={openAddModal}
        >
          <Text style={styles.buttonText}>{t('myPlan.addGoal')}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.aiButton, { backgroundColor: themeColors.success }]}
          onPress={getAiSuggestions}
          disabled={aiLoading}
        >
          {aiLoading ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text style={styles.buttonText}>{t('myPlan.importFromAI')}</Text>
          )}
        </TouchableOpacity>
      </View>
      
      {goals.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: themeColors.secondaryText }]}>
            {t('myPlan.noGoals')}
          </Text>
        </View>
      ) : (
        <FlatList
          data={goals}
          renderItem={renderGoalItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.goalsList}
        />
      )}
      
      {/* 编辑/添加目标模态框 */}
      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: themeColors.card }]}>
            <Text style={[styles.modalTitle, { color: themeColors.primaryText }]}>
              {isEditing ? t('myPlan.editGoal') : t('myPlan.addGoal')}
            </Text>
            
            <TextInput
              style={[
                styles.textInput, 
                { 
                  backgroundColor: isDarkMode ? themeColors.border : '#f5f5f5',
                  color: themeColors.primaryText,
                  borderColor: themeColors.border
                }
              ]}
              placeholder={t('myPlan.goalName')}
              placeholderTextColor={themeColors.secondaryText}
              value={goalName}
              onChangeText={setGoalName}
            />
            
            <TextInput
              style={[
                styles.textInput, 
                { 
                  backgroundColor: isDarkMode ? themeColors.border : '#f5f5f5',
                  color: themeColors.primaryText,
                  borderColor: themeColors.border
                }
              ]}
              placeholder={t('myPlan.targetAmount')}
              placeholderTextColor={themeColors.secondaryText}
              value={targetAmount}
              onChangeText={setTargetAmount}
              keyboardType="numeric"
            />
            
            <TextInput
              style={[
                styles.textInput, 
                { 
                  backgroundColor: isDarkMode ? themeColors.border : '#f5f5f5',
                  color: themeColors.primaryText,
                  borderColor: themeColors.border
                }
              ]}
              placeholder={t('myPlan.currentAmount')}
              placeholderTextColor={themeColors.secondaryText}
              value={currentAmount}
              onChangeText={setCurrentAmount}
              keyboardType="numeric"
            />
            
            <TextInput
              style={[
                styles.textInput, 
                { 
                  backgroundColor: isDarkMode ? themeColors.border : '#f5f5f5',
                  color: themeColors.primaryText,
                  borderColor: themeColors.border
                }
              ]}
              placeholder={`${t('myPlan.deadline')} (YYYY-MM-DD)`}
              placeholderTextColor={themeColors.secondaryText}
              value={deadline}
              onChangeText={setDeadline}
            />
            
            <TextInput
              style={[
                styles.textAreaInput, 
                { 
                  backgroundColor: isDarkMode ? themeColors.border : '#f5f5f5',
                  color: themeColors.primaryText,
                  borderColor: themeColors.border
                }
              ]}
              placeholder={t('myPlan.description')}
              placeholderTextColor={themeColors.secondaryText}
              value={description}
              onChangeText={setDescription}
              multiline
            />
            
            <View style={styles.modalButtonsRow}>
              <TouchableOpacity
                style={[styles.aiImportButton, { backgroundColor: themeColors.success }]}
                onPress={() => {
                  setIsModalVisible(false);
                  getAiSuggestions();
                }}
              >
                <Text style={styles.buttonText}>{t('myPlan.importAIAdvice')}</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalButtonsRow}>
              <TouchableOpacity
                style={[styles.saveButton, { backgroundColor: themeColors.primary }]}
                onPress={saveGoal}
              >
                <Text style={styles.buttonText}>{t('myPlan.saveGoal')}</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.cancelButton, { backgroundColor: themeColors.secondary }]}
                onPress={() => setIsModalVisible(false)}
              >
                <Text style={styles.buttonText}>{t('myPlan.cancelEdit')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      
      {/* AI建议模态框 */}
      <Modal
        visible={isAiModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsAiModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: themeColors.card }]}>
            <Text style={[styles.modalTitle, { color: themeColors.primaryText }]}>
              {t('myPlan.aiSuggestions')}
            </Text>
            
            <Text style={[styles.aiSubtitle, { color: themeColors.secondaryText }]}>
              {t('myPlan.chooseSuggestion')}
            </Text>
            
            <ScrollView style={styles.suggestionsList}>
              {aiSuggestions.map((suggestion, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.suggestionItem,
                    { 
                      backgroundColor: isDarkMode ? themeColors.border : '#f5f5f5',
                      borderColor: themeColors.border
                    }
                  ]}
                  onPress={() => importSuggestion(suggestion)}
                >
                  <Text style={[styles.suggestionText, { color: themeColors.primaryText }]}>
                    {suggestion}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            
            <TouchableOpacity
              style={[styles.cancelButton, { backgroundColor: themeColors.secondary, marginTop: 16 }]}
              onPress={() => setIsAiModalVisible(false)}
            >
              <Text style={styles.buttonText}>{t('myPlan.cancelEdit')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
  },
  addButton: {
    backgroundColor: '#3498db',
    padding: 12,
    borderRadius: 8,
    flex: 1,
    marginRight: 8,
    alignItems: 'center',
  },
  aiButton: {
    backgroundColor: '#2ecc71',
    padding: 12,
    borderRadius: 8,
    flex: 1,
    marginLeft: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  goalsList: {
    padding: 16,
  },
  goalCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  goalName: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  goalActions: {
    flexDirection: 'row',
  },
  editButton: {
    backgroundColor: '#3498db',
    padding: 6,
    borderRadius: 4,
    marginRight: 8,
  },
  deleteButton: {
    backgroundColor: '#e74c3c',
    padding: 6,
    borderRadius: 4,
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  amountLabel: {
    fontSize: 14,
    color: '#666',
  },
  amount: {
    fontSize: 14,
    fontWeight: '500',
  },
  progressContainer: {
    marginVertical: 12,
  },
  progressBackground: {
    height: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#3498db',
  },
  progressText: {
    fontSize: 12,
    textAlign: 'right',
    marginTop: 4,
    color: '#666',
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    marginRight: 8,
  },
  infoValue: {
    fontSize: 14,
  },
  description: {
    fontSize: 14,
    marginTop: 8,
    color: '#333',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
  },
  textAreaInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
    height: 100,
    textAlignVertical: 'top',
  },
  modalButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  saveButton: {
    backgroundColor: '#3498db',
    padding: 12,
    borderRadius: 8,
    flex: 1,
    marginRight: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#95a5a6',
    padding: 12,
    borderRadius: 8,
    flex: 1,
    marginLeft: 8,
    alignItems: 'center',
  },
  aiImportButton: {
    backgroundColor: '#2ecc71',
    padding: 12,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
  },
  aiSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    textAlign: 'center',
  },
  suggestionsList: {
    maxHeight: 300,
  },
  suggestionItem: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  suggestionText: {
    fontSize: 14,
  }
});

export default MyPlanScreen; 