import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, Pressable, Modal, Alert } from 'react-native';
import { ScreenContainer } from '../components/ScreenContainer';
import { SectionTitle } from '../components/SectionTitle';
import { StatCard } from '../components/StatCard';
import { ArabicInput } from '../components/ArabicInput';
import { PrimaryButton } from '../components/PrimaryButton';
import { SimpleDatePicker } from '../components/SimpleDatePicker';
import { useAppContext } from '../context/AppContext';
import { getCustomerBalance, getTopDebtor, getTotalDebts, getLowStockItems, getOutOfStockItems } from '../utils/balance';
import { formatCurrency } from '../utils/formatters';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { InventoryInput, InventoryItem } from '../utils/types';

const DashboardScreen: React.FC = () => {
  const { 
    customers, 
    inventory, 
    addInventoryItem, 
    updateInventoryItem, 
    deleteInventoryItem,
    sendBulkWhatsAppMessages,
  } = useAppContext();
  const navigation = useNavigation();
  const rootNavigation = navigation.getParent?.();
  const topDebtor = getTopDebtor(customers);
  const topDebtorBalance = topDebtor ? getCustomerBalance(topDebtor) : 0;
  const customersWithReminder = customers.filter((customer) => customer.debtReminderSettings.enabled);
  const lowStockItems = getLowStockItems(inventory);
  const outOfStockItems = getOutOfStockItems(inventory);

  // Inventory CRUD state
  const [inventoryModalVisible, setInventoryModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [itemName, setItemName] = useState('');
  const [itemCurrentStock, setItemCurrentStock] = useState('');
  const [itemMinStock, setItemMinStock] = useState('');
  const [itemUnit, setItemUnit] = useState('');
  const [itemCategory, setItemCategory] = useState('');

  // Bulk messaging state
  const [bulkMessageModalVisible, setBulkMessageModalVisible] = useState(false);
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);
  const [bulkMessageType, setBulkMessageType] = useState<'reminder' | 'followup' | 'payment_confirmation' | 'custom'>('reminder');
  const [bulkCustomMessage, setBulkCustomMessage] = useState('');
  const [bulkDueDate, setBulkDueDate] = useState<Date>(new Date());
  const [includeBulkDueDate, setIncludeBulkDueDate] = useState(false);

  // Inventory CRUD functions
  const openAddItemModal = () => {
    setEditingItem(null);
    setItemName('');
    setItemCurrentStock('');
    setItemMinStock('');
    setItemUnit('');
    setItemCategory('');
    setInventoryModalVisible(true);
  };

  const openEditItemModal = (item: InventoryItem) => {
    setEditingItem(item);
    setItemName(item.name);
    setItemCurrentStock(item.currentStock.toString());
    setItemMinStock(item.minStock.toString());
    setItemUnit(item.unit);
    setItemCategory(item.category);
    setInventoryModalVisible(true);
  };

  const handleSaveItem = () => {
    if (!itemName.trim() || !itemUnit.trim() || !itemCategory.trim()) {
      Alert.alert('تنبيه', 'يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    const currentStock = parseFloat(itemCurrentStock) || 0;
    const minStock = parseFloat(itemMinStock) || 0;

    if (currentStock < 0 || minStock < 0) {
      Alert.alert('تنبيه', 'الكميات يجب أن تكون أرقاماً موجبة');
      return;
    }

    const input: InventoryInput = {
      name: itemName.trim(),
      currentStock,
      minStock,
      unit: itemUnit.trim(),
      category: itemCategory.trim(),
    };

    if (editingItem) {
      updateInventoryItem(editingItem.id, input);
    } else {
      addInventoryItem(input);
    }

    setInventoryModalVisible(false);
  };

  const handleDeleteItem = (item: InventoryItem) => {
    Alert.alert(
      'تأكيد الحذف',
      `هل أنت متأكد من حذف "${item.name}"؟`,
      [
        { text: 'إلغاء', style: 'cancel' },
        { 
          text: 'حذف', 
          style: 'destructive',
          onPress: () => deleteInventoryItem(item.id)
        },
      ]
    );
  };

  // Bulk messaging functions
  const openBulkMessageModal = () => {
    setSelectedCustomers([]);
    setBulkMessageType('reminder');
    setBulkCustomMessage('');
    setBulkDueDate(new Date());
    setIncludeBulkDueDate(false);
    setBulkMessageModalVisible(true);
  };

  const toggleCustomerSelection = (customerId: string) => {
    setSelectedCustomers(prev => 
      prev.includes(customerId) 
        ? prev.filter(id => id !== customerId)
        : [...prev, customerId]
    );
  };

  const selectAllDebtors = () => {
    const debtorIds = customers
      .filter(customer => getCustomerBalance(customer) > 0 && customer.phone)
      .map(customer => customer.id);
    setSelectedCustomers(debtorIds);
  };

  const handleSendBulkMessages = async () => {
    if (selectedCustomers.length === 0) {
      Alert.alert('تنبيه', 'يرجى اختيار زبائن للإرسال.');
      return;
    }

    const dueDate = includeBulkDueDate ? bulkDueDate.toISOString().split('T')[0] : undefined;
    const customMessage = bulkMessageType === 'custom' ? bulkCustomMessage : undefined;

    const result = await sendBulkWhatsAppMessages(selectedCustomers, bulkMessageType, dueDate, customMessage);
    
    Alert.alert(
      'تم الإرسال',
      `تم إرسال ${result.successCount} رسالة بنجاح${result.failCount > 0 ? ` وفشل ${result.failCount}` : ''}.`
    );
    
    setBulkMessageModalVisible(false);
  };
  const sortedCustomers = [...customers].sort((a, b) => {
    const balanceA = getCustomerBalance(a);
    const balanceB = getCustomerBalance(b);
    const hasDebtA = balanceA > 0;
    const hasDebtB = balanceB > 0;

    // Debtors first
    if (hasDebtA && !hasDebtB) return -1;
    if (!hasDebtA && hasDebtB) return 1;

    // Among debtors, sort by balance descending
    if (hasDebtA && hasDebtB) {
      return balanceB - balanceA;
    }

    // Among non-debtors, sort by reminder enabled first
    const reminderA = a.debtReminderSettings.enabled;
    const reminderB = b.debtReminderSettings.enabled;
    if (reminderA && !reminderB) return -1;
    if (!reminderA && reminderB) return 1;

    // Finally sort by name
    return a.name.localeCompare(b.name);
  });

  return (
    <ScreenContainer>
      <View style={styles.heroCard}>
        <Text style={styles.heroEyebrow}>Mol Hanout</Text>
        <Text style={styles.heroTitle}>متابعة الديون اليومية بطريقة سهلة وسريعة</Text>
        <Text style={styles.heroSubtitle}>
          اعرف الرصيد الحالي، راقب أكثر الزبائن ديناً، وابقَ جاهزاً لإرسال التذكير عبر واتساب.
        </Text>
      </View>

      <SectionTitle>لوحة الملخص</SectionTitle>
      <View style={styles.grid}>
        <StatCard icon="💰" title="إجمالي الديون" value={formatCurrency(getTotalDebts(customers))} />
        <StatCard icon="👤" title="عدد الزبائن" value={`${customers.length} زبون`} accent="#2C855A" />
      </View>
      <StatCard
        icon="📈"
        title="أعلى الزبائن ديناً"
        value={topDebtor ? `${topDebtor.name} - ${formatCurrency(Math.max(topDebtorBalance, 0))}` : 'لا يوجد'}
        accent="#9A2E1D"
      />

      <SectionTitle>🔔 تفاصيل الزبائن والتذكيرات</SectionTitle>
      <View style={styles.customersList}>
        {sortedCustomers.slice(0, 5).map((customer) => {
          const balance = getCustomerBalance(customer);
          const hasDebt = balance > 0;
          const reminderEnabled = customer.debtReminderSettings.enabled;
          const reminderTime = `${String(customer.debtReminderSettings.hour).padStart(2, '0')}:${String(customer.debtReminderSettings.minute).padStart(2, '0')}`;

          return (
            <Pressable
              key={customer.id}
              style={({ pressed }) => [styles.customerRow, pressed && styles.customerRowPressed]}
              onPress={() => rootNavigation?.navigate('CustomerDetail', { customerId: customer.id })}
            >
              <View style={styles.customerInfo}>
                <Text style={styles.customerName}>{customer.name}</Text>
                <Text style={styles.customerPhone}>{customer.phone || 'بدون رقم هاتف'}</Text>
              </View>
              <View style={styles.customerStats}>
                <Text style={[styles.customerBalance, { color: hasDebt ? '#8A4B14' : '#2C855A' }]}>
                  {formatCurrency(Math.max(balance, 0))}
                </Text>
                <View style={styles.reminderInfo}>
                  {reminderEnabled ? (
                    <Text style={styles.reminderEnabled}>
                      🔔 {reminderTime}
                      {hasDebt ? ' (نشط)' : ' (معطل)'}
                    </Text>
                  ) : (
                    <Text style={styles.reminderDisabled}>🔕 معطل</Text>
                  )}
                </View>
              </View>
            </Pressable>
          );
        })}
        {customers.length > 5 && (
          <Pressable
            style={({ pressed }) => [styles.showMoreButton, pressed && styles.showMorePressed]}
            onPress={() => rootNavigation?.navigate('Customers')}
          >
            <Text style={styles.showMoreText}>عرض جميع الزبائن ({customers.length})</Text>
          </Pressable>
        )}
      </View>

      <PrimaryButton title="💬 إرسال رسائل جماعية عبر واتساب" onPress={openBulkMessageModal} />

      <SectionTitle>📊 dashboard (شحال عندك / شحال خاصك تجيب)</SectionTitle>
      <View style={styles.grid}>
        <StatCard icon="📦" title="منتجات في المخزون" value={`${inventory.length} منتج`} accent="#2C855A" />
        <StatCard icon="⚠️" title="منتجات تحت الحد الأدنى" value={`${lowStockItems.length} منتج`} accent="#E6A500" />
      </View>
      <StatCard
        icon="🚫"
        title="منتجات نفدت"
        value={outOfStockItems.length > 0 ? `${outOfStockItems.length} منتج` : 'لا توجد منتجات نفدت'}
        accent={outOfStockItems.length > 0 ? "#9A2E1D" : "#2C855A"}
      />

      {lowStockItems.length > 0 && (
        <View style={styles.lowStockCard}>
          <Text style={styles.lowStockTitle}>تحتاج للتجديد:</Text>
          {lowStockItems.slice(0, 3).map((item) => (
            <Text key={item.id} style={styles.lowStockItem}>
              • {item.name}: {item.currentStock} {item.unit} (الحد الأدنى: {item.minStock})
            </Text>
          ))}
          {lowStockItems.length > 3 && (
            <Text style={styles.lowStockMore}>... و {lowStockItems.length - 3} منتجات أخرى</Text>
          )}
        </View>
      )}

      <SectionTitle>تفاصيل المخزون الكاملة</SectionTitle>
      <PrimaryButton title="➕ إضافة منتج جديد" onPress={openAddItemModal} />
      <View style={styles.inventoryList}>
        {inventory
          .sort((a, b) => {
            // Sort by stock status: out of stock first, then low stock, then normal
            const aOut = a.currentStock === 0;
            const bOut = b.currentStock === 0;
            if (aOut && !bOut) return -1;
            if (!aOut && bOut) return 1;
            const aLow = a.currentStock <= a.minStock;
            const bLow = b.currentStock <= b.minStock;
            if (aLow && !bLow) return -1;
            if (!aLow && bLow) return 1;
            return a.name.localeCompare(b.name);
          })
          .map((item) => {
            const isOutOfStock = item.currentStock === 0;
            const isLowStock = item.currentStock <= item.minStock && !isOutOfStock;
            const stockStatus = isOutOfStock ? 'نفد' : isLowStock ? 'منخفض' : 'متوفر';
            const statusColor = isOutOfStock ? '#9A2E1D' : isLowStock ? '#E6A500' : '#2C855A';

            return (
              <View key={item.id} style={styles.inventoryItem}>
                <View style={styles.inventoryInfo}>
                  <Text style={styles.inventoryName}>{item.name}</Text>
                  <Text style={styles.inventoryCategory}>{item.category}</Text>
                </View>
                <View style={styles.inventoryStats}>
                  <Text style={styles.inventoryStock}>
                    {item.currentStock} {item.unit}
                  </Text>
                  <Text style={[styles.inventoryMinStock, { color: statusColor }]}>
                    الحد الأدنى: {item.minStock} {item.unit}
                  </Text>
                  <Text style={[styles.inventoryStatus, { color: statusColor }]}>
                    حالة: {stockStatus}
                  </Text>
                </View>
                <View style={styles.inventoryActions}>
                  <Pressable
                    style={({ pressed }) => [styles.actionButton, pressed && styles.actionButtonPressed]}
                    onPress={() => openEditItemModal(item)}
                  >
                    <Text style={styles.editButtonText}>✏️ تعديل</Text>
                  </Pressable>
                  <Pressable
                    style={({ pressed }) => [styles.actionButton, styles.deleteButton, pressed && styles.actionButtonPressed]}
                    onPress={() => handleDeleteItem(item)}
                  >
                    <Text style={styles.deleteButtonText}>🗑️ حذف</Text>
                  </Pressable>
                </View>
              </View>
            );
          })}
      </View>

      <Modal
        visible={inventoryModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setInventoryModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingItem ? 'تعديل المنتج' : 'إضافة منتج جديد'}
            </Text>
            
            <ArabicInput
              label="اسم المنتج"
              value={itemName}
              onChangeText={setItemName}
              placeholder="أدخل اسم المنتج"
            />
            
            <ArabicInput
              label="الكمية الحالية"
              value={itemCurrentStock}
              onChangeText={setItemCurrentStock}
              placeholder="0"
              keyboardType="numeric"
            />
            
            <ArabicInput
              label="الحد الأدنى"
              value={itemMinStock}
              onChangeText={setItemMinStock}
              placeholder="0"
              keyboardType="numeric"
            />
            
            <ArabicInput
              label="الوحدة"
              value={itemUnit}
              onChangeText={setItemUnit}
              placeholder="كيلو، لتر، قطعة..."
            />
            
            <ArabicInput
              label="الفئة"
              value={itemCategory}
              onChangeText={setItemCategory}
              placeholder="خضار، فواكه، توابل..."
            />
            
            <View style={styles.modalButtons}>
              <Pressable
                style={({ pressed }) => [styles.modalButton, styles.cancelButton, pressed && styles.modalButtonPressed]}
                onPress={() => setInventoryModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>إلغاء</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [styles.modalButton, styles.saveButton, pressed && styles.modalButtonPressed]}
                onPress={handleSaveItem}
              >
                <Text style={styles.saveButtonText}>{editingItem ? 'تحديث' : 'إضافة'}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Bulk Messaging Modal */}
      <Modal
        visible={bulkMessageModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setBulkMessageModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.bulkModalContent}>
            <Text style={styles.modalTitle}>إرسال رسائل جماعية عبر واتساب</Text>
            
            <View style={styles.messageTypeContainer}>
              <Text style={styles.sectionLabel}>نوع الرسالة:</Text>
              <View style={styles.messageTypeButtons}>
                <Pressable
                  style={[styles.messageTypeButton, bulkMessageType === 'reminder' && styles.messageTypeButtonActive]}
                  onPress={() => setBulkMessageType('reminder')}
                >
                  <Text style={[styles.messageTypeButtonText, bulkMessageType === 'reminder' && styles.messageTypeButtonTextActive]}>تذكير</Text>
                </Pressable>
                <Pressable
                  style={[styles.messageTypeButton, bulkMessageType === 'followup' && styles.messageTypeButtonActive]}
                  onPress={() => setBulkMessageType('followup')}
                >
                  <Text style={[styles.messageTypeButtonText, bulkMessageType === 'followup' && styles.messageTypeButtonTextActive]}>متابعة</Text>
                </Pressable>
                <Pressable
                  style={[styles.messageTypeButton, bulkMessageType === 'payment_confirmation' && styles.messageTypeButtonActive]}
                  onPress={() => setBulkMessageType('payment_confirmation')}
                >
                  <Text style={[styles.messageTypeButtonText, bulkMessageType === 'payment_confirmation' && styles.messageTypeButtonTextActive]}>تأكيد دفع</Text>
                </Pressable>
                <Pressable
                  style={[styles.messageTypeButton, bulkMessageType === 'custom' && styles.messageTypeButtonActive]}
                  onPress={() => setBulkMessageType('custom')}
                >
                  <Text style={[styles.messageTypeButtonText, bulkMessageType === 'custom' && styles.messageTypeButtonTextActive]}>مخصص</Text>
                </Pressable>
              </View>
            </View>

            {bulkMessageType === 'custom' && (
              <ArabicInput
                label="الرسالة المخصصة"
                value={bulkCustomMessage}
                onChangeText={setBulkCustomMessage}
                placeholder="اكتب الرسالة هنا..."
                multiline
                numberOfLines={3}
              />
            )}

            <View style={styles.dueDateContainer}>
              <View style={styles.checkboxRow}>
                <Pressable
                  style={[styles.checkbox, includeBulkDueDate && styles.checkboxChecked]}
                  onPress={() => setIncludeBulkDueDate(!includeBulkDueDate)}
                >
                  {includeBulkDueDate && <Text style={styles.checkmark}>✓</Text>}
                </Pressable>
                <Text style={styles.checkboxLabel}>تضمين تاريخ الاستحقاق</Text>
              </View>
              {includeBulkDueDate && (
                <View>
                  <Text style={styles.sectionLabel}>تاريخ الاستحقاق</Text>
                  <SimpleDatePicker
                    value={bulkDueDate}
                    onChange={setBulkDueDate}
                  />
                </View>
              )}
            </View>

            <View style={styles.customerSelectionContainer}>
              <View style={styles.customerSelectionHeader}>
                <Text style={styles.sectionLabel}>اختيار الزبائن:</Text>
                <Pressable style={styles.selectAllButton} onPress={selectAllDebtors}>
                  <Text style={styles.selectAllButtonText}>اختيار جميع المدينين</Text>
                </Pressable>
              </View>
              
              <ScrollView style={styles.customerList} showsVerticalScrollIndicator={false}>
                {customers
                  .filter(customer => customer.phone)
                  .map((customer) => {
                    const balance = getCustomerBalance(customer);
                    const isSelected = selectedCustomers.includes(customer.id);
                    return (
                      <Pressable
                        key={customer.id}
                        style={[styles.bulkCustomerRow, isSelected && styles.bulkCustomerRowSelected]}
                        onPress={() => toggleCustomerSelection(customer.id)}
                      >
                        <View style={styles.bulkCustomerInfo}>
                          <Text style={[styles.bulkCustomerName, isSelected && styles.bulkCustomerNameSelected]}>{customer.name}</Text>
                          <Text style={[styles.bulkCustomerBalance, isSelected && styles.bulkCustomerBalanceSelected]}>
                            {formatCurrency(balance)}
                          </Text>
                        </View>
                        <View style={[styles.checkbox, isSelected && styles.checkboxChecked]}>
                          {isSelected && <Text style={styles.checkmark}>✓</Text>}
                        </View>
                      </Pressable>
                    );
                  })}
              </ScrollView>
              
              <Text style={styles.selectedCount}>
                تم اختيار {selectedCustomers.length} زبون
              </Text>
            </View>

            <View style={styles.bulkModalButtons}>
              <Pressable
                style={({ pressed }) => [styles.modalButton, styles.cancelButton, pressed && styles.modalButtonPressed]}
                onPress={() => setBulkMessageModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>إلغاء</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [styles.modalButton, styles.saveButton, pressed && styles.modalButtonPressed]}
                onPress={handleSendBulkMessages}
                disabled={selectedCustomers.length === 0}
              >
                <Text style={[styles.saveButtonText, selectedCustomers.length === 0 && styles.saveButtonTextDisabled]}>
                  إرسال ({selectedCustomers.length})
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
};

export { DashboardScreen };

const styles = StyleSheet.create({
  heroCard: {
    backgroundColor: '#2E241B',
    borderRadius: 28,
    padding: 22,
    gap: 8,
  },
  heroEyebrow: {
    color: '#F4E1C1',
    textAlign: 'right',
    fontSize: 13,
    fontWeight: '800',
  },
  heroTitle: {
    color: '#FFF8ED',
    textAlign: 'right',
    fontSize: 26,
    fontWeight: '900',
    lineHeight: 34,
  },
  heroSubtitle: {
    color: '#E8D7C0',
    textAlign: 'right',
    fontSize: 15,
    lineHeight: 24,
  },
  grid: {
    flexDirection: 'row',
    gap: 12,
  },
  reminderCard: {
    backgroundColor: '#FFF8ED',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#E7D7BD',
    padding: 18,
    gap: 14,
  },
  reminderTitle: {
    textAlign: 'right',
    color: '#2E241B',
    fontSize: 20,
    fontWeight: '900',
  },
  reminderSubtitle: {
    textAlign: 'right',
    color: '#6A5440',
    fontSize: 15,
    lineHeight: 24,
  },
  reminderStatsRow: {
    backgroundColor: '#F7F1E7',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reminderStatLabel: {
    color: '#6A5440',
    fontWeight: '700',
  },
  reminderStatValue: {
    color: '#8A4B14',
    fontWeight: '900',
    fontSize: 20,
  },
  lowStockCard: {
    backgroundColor: '#FFF8ED',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#E7D7BD',
    padding: 18,
    gap: 12,
  },
  lowStockTitle: {
    textAlign: 'right',
    color: '#2E241B',
    fontSize: 18,
    fontWeight: '900',
  },
  lowStockItem: {
    textAlign: 'right',
    color: '#6A5440',
    fontSize: 15,
    lineHeight: 22,
  },
  lowStockMore: {
    textAlign: 'right',
    color: '#8A4B14',
    fontSize: 14,
    fontWeight: '700',
  },
  customersList: {
    gap: 8,
  },
  customerRow: {
    backgroundColor: '#FFF8ED',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E6D6BC',
  },
  customerRowPressed: {
    opacity: 0.9,
    backgroundColor: '#F4E1C1',
  },
  customerInfo: {
    flex: 1,
    gap: 4,
  },
  customerName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#2E241B',
    textAlign: 'right',
  },
  customerPhone: {
    fontSize: 14,
    color: '#6B5B47',
    textAlign: 'right',
  },
  customerStats: {
    alignItems: 'flex-end',
    gap: 4,
  },
  customerBalance: {
    fontSize: 16,
    fontWeight: '800',
  },
  reminderInfo: {
    alignItems: 'flex-end',
  },
  reminderEnabled: {
    fontSize: 12,
    color: '#2C855A',
    fontWeight: '600',
  },
  reminderDisabled: {
    fontSize: 12,
    color: '#9A2E1D',
    fontWeight: '600',
  },
  showMoreButton: {
    backgroundColor: '#2E241B',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  showMorePressed: {
    opacity: 0.9,
  },
  showMoreText: {
    color: '#F4E1C1',
    fontSize: 16,
    fontWeight: '600',
  },
  inventoryList: {
    gap: 8,
  },
  inventoryItem: {
    backgroundColor: '#FFF8ED',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E6D6BC',
    gap: 12,
  },
  inventoryInfo: {
    flex: 1,
    gap: 4,
  },
  inventoryName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#2E241B',
    textAlign: 'right',
  },
  inventoryCategory: {
    fontSize: 14,
    color: '#6B5B47',
    textAlign: 'right',
  },
  inventoryStats: {
    flex: 1,
    alignItems: 'flex-end',
    gap: 4,
  },
  inventoryStock: {
    fontSize: 16,
    fontWeight: '800',
    color: '#2E241B',
  },
  inventoryMinStock: {
    fontSize: 12,
    fontWeight: '600',
  },
  inventoryStatus: {
    fontSize: 12,
    fontWeight: '600',
  },
  inventoryActions: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#F4E1C1',
    borderWidth: 1,
    borderColor: '#E6D6BC',
  },
  actionButtonPressed: {
    opacity: 0.8,
  },
  editButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2E241B',
  },
  deleteButton: {
    backgroundColor: '#FFF8ED',
    borderColor: '#9A2E1D',
  },
  deleteButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9A2E1D',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFF8ED',
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    gap: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#2E241B',
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalButtonPressed: {
    opacity: 0.9,
  },
  cancelButton: {
    backgroundColor: '#F4E1C1',
    borderWidth: 1,
    borderColor: '#E6D6BC',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6A5440',
  },
  saveButton: {
    backgroundColor: '#2C855A',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF8ED',
  },
  bulkMessageSubtitle: {
    textAlign: 'right',
    color: '#6A5440',
    fontSize: 14,
    lineHeight: 20,
  },
  bulkSection: {
    gap: 12,
  },
  bulkSectionTitle: {
    textAlign: 'right',
    color: '#2E241B',
    fontSize: 16,
    fontWeight: '800',
  },
  customerSelector: {
    maxHeight: 200,
    borderWidth: 1,
    borderColor: '#E6D6BC',
    borderRadius: 12,
    padding: 8,
  },
  customerSelectorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 4,
    backgroundColor: '#F4E1C1',
  },
  customerSelectorItemSelected: {
    backgroundColor: '#8A4B14',
  },
  customerSelectorItemPressed: {
    opacity: 0.8,
  },
  customerSelectorInfo: {
    flex: 1,
    gap: 4,
  },
  customerSelectorName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2E241B',
    textAlign: 'right',
  },
  customerSelectorNameSelected: {
    color: '#FFF8ED',
  },
  customerSelectorBalance: {
    fontSize: 12,
    color: '#6A5440',
    textAlign: 'right',
  },
  customerSelectorBalanceSelected: {
    color: '#E8D7C0',
  },
  selectionIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#6A5440',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectionIndicatorSelected: {
    backgroundColor: '#2C855A',
    borderColor: '#2C855A',
  },
  selectionIndicatorText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#6A5440',
  },
  selectionIndicatorTextSelected: {
    color: '#FFF8ED',
  },
  messageTypeSelector: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  messageTypeOption: {
    flex: 1,
    minWidth: 120,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#F4E1C1',
    borderWidth: 1,
    borderColor: '#E6D6BC',
    alignItems: 'center',
    gap: 6,
  },
  messageTypeOptionSelected: {
    backgroundColor: '#8A4B14',
    borderColor: '#8A4B14',
  },
  messageTypeOptionPressed: {
    opacity: 0.8,
  },
  messageTypeIcon: {
    fontSize: 16,
  },
  messageTypeLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6A5440',
    textAlign: 'center',
  },
  messageTypeLabelSelected: {
    color: '#FFF8ED',
  },
  bulkModalContent: {
    backgroundColor: '#FFF8ED',
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
    gap: 16,
  },
  messageTypeContainer: {
    gap: 12,
  },
  sectionLabel: {
    textAlign: 'right',
    color: '#2E241B',
    fontSize: 16,
    fontWeight: '800',
  },
  messageTypeButtons: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  messageTypeButton: {
    flex: 1,
    minWidth: 80,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 12,
    backgroundColor: '#F4E1C1',
    borderWidth: 1,
    borderColor: '#E6D6BC',
    alignItems: 'center',
  },
  messageTypeButtonActive: {
    backgroundColor: '#8A4B14',
    borderColor: '#8A4B14',
  },
  messageTypeButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6A5440',
  },
  messageTypeButtonTextActive: {
    color: '#FFF8ED',
  },
  dueDateContainer: {
    gap: 12,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#6A5440',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#2C855A',
    borderColor: '#2C855A',
  },
  checkmark: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFF8ED',
  },
  checkboxLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2E241B',
    textAlign: 'right',
    flex: 1,
  },
  customerSelectionContainer: {
    gap: 12,
  },
  customerSelectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#2C855A',
    borderRadius: 8,
  },
  selectAllButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFF8ED',
  },
  customerList: {
    maxHeight: 200,
    borderWidth: 1,
    borderColor: '#E6D6BC',
    borderRadius: 12,
    padding: 8,
  },
  bulkCustomerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 4,
    backgroundColor: '#F4E1C1',
  },
  bulkCustomerRowSelected: {
    backgroundColor: '#8A4B14',
  },
  bulkCustomerInfo: {
    flex: 1,
    gap: 4,
  },
  bulkCustomerName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2E241B',
    textAlign: 'right',
  },
  bulkCustomerNameSelected: {
    color: '#FFF8ED',
  },
  bulkCustomerBalance: {
    fontSize: 12,
    color: '#6A5440',
    textAlign: 'right',
  },
  bulkCustomerBalanceSelected: {
    color: '#E8D7C0',
  },
  selectedCount: {
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
    color: '#2E241B',
  },
  bulkModalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  saveButtonTextDisabled: {
    color: '#E8D7C0',
  },
});
