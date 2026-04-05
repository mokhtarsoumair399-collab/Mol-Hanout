import React, { useMemo, useState } from 'react';
import { Alert, FlatList, Modal, Platform, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ArabicInput } from '../components/ArabicInput';
import { EmptyState } from '../components/EmptyState';
import { PrimaryButton } from '../components/PrimaryButton';
import { ScreenContainer } from '../components/ScreenContainer';
import { useAppContext } from '../context/AppContext';
import { RootStackParamList } from '../navigation/AppNavigator';
import { DeviceContact, loadDeviceContacts, requestContactsAccess } from '../utils/contacts';

type Props = NativeStackScreenProps<RootStackParamList, 'CustomerForm'>;

export function CustomerFormScreen({ navigation, route }: Props) {
  const { addCustomer, updateCustomer, getCustomerById } = useAppContext();
  const editingCustomer = useMemo(
    () => (route.params?.customerId ? getCustomerById(route.params.customerId) : undefined),
    [getCustomerById, route.params?.customerId],
  );

  const [name, setName] = useState(editingCustomer?.name ?? '');
  const [phone, setPhone] = useState(editingCustomer?.phone ?? '');
  const [contactsModalVisible, setContactsModalVisible] = useState(false);
  const [contacts, setContacts] = useState<DeviceContact[]>([]);
  const [contactsSearch, setContactsSearch] = useState('');
  const [contactsLoading, setContactsLoading] = useState(false);

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert('تنبيه', 'اسم الزبون مطلوب');
      return;
    }

    if (editingCustomer) {
      updateCustomer(editingCustomer.id, { name, phone });
    } else {
      addCustomer({ name, phone });
    }

    navigation.goBack();
  };

  const handleImportFromContacts = async () => {
    if (Platform.OS === 'web') {
      Alert.alert('تنبيه', 'استيراد جهات الاتصال غير مدعوم على الويب.');
      return;
    }

    setContactsLoading(true);
    try {
      const granted = await requestContactsAccess();
      if (!granted) {
        Alert.alert('تنبيه', 'يلزم السماح بالوصول إلى جهات الاتصال أولاً.');
        return;
      }

      const loadedContacts = await loadDeviceContacts();
      setContacts(loadedContacts);
      setContactsModalVisible(true);
    } catch (error) {
      Alert.alert('تنبيه', 'تعذر تحميل جهات الاتصال من الهاتف.');
    } finally {
      setContactsLoading(false);
    }
  };

  const filteredContacts = contacts.filter((contact) =>
    contact.name.toLowerCase().includes(contactsSearch.trim().toLowerCase()),
  );

  return (
    <>
    <ScreenContainer scrollable={false}>
      <View style={styles.form}>
        <ArabicInput
          label="اسم الزبون"
          value={name}
          onChangeText={setName}
          placeholder="مثال: الحاج مصطفى"
        />
        <ArabicInput
          label="رقم الهاتف (اختياري)"
          value={phone}
          onChangeText={setPhone}
          placeholder="2126..."
          keyboardType="phone-pad"
        />
        <PrimaryButton
          title={contactsLoading ? 'جاري تحميل جهات الاتصال...' : '📇 اختيار من جهات الاتصال'}
          variant="secondary"
          onPress={handleImportFromContacts}
          disabled={Platform.OS === 'web'}
        />
        {Platform.OS === 'web' && (
          <Text style={styles.webInfoText}>استيراد جهات الاتصال غير مدعوم على الويب.</Text>
        )}
        <PrimaryButton title={editingCustomer ? 'حفظ التعديلات' : 'حفظ الزبون'} onPress={handleSave} />
      </View>
    </ScreenContainer>

    <Modal
      animationType="slide"
      transparent
      visible={contactsModalVisible}
      onRequestClose={() => setContactsModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <Text style={styles.modalTitle}>اختيار جهة اتصال</Text>
          <ArabicInput
            label="البحث في جهات الاتصال"
            value={contactsSearch}
            onChangeText={setContactsSearch}
            placeholder="اكتب الاسم"
          />
          {filteredContacts.length ? (
            <FlatList
              data={filteredContacts}
              keyExtractor={(item) => item.id}
              style={styles.contactsList}
              contentContainerStyle={styles.contactsListContent}
              renderItem={({ item }) => (
                <View style={styles.contactItem}>
                  <View style={styles.contactTextWrap}>
                    <Text style={styles.contactName}>{item.name}</Text>
                    <Text style={styles.contactPhone}>{item.phone}</Text>
                  </View>
                  <PrimaryButton
                    title="اختيار"
                    style={styles.pickButton}
                    onPress={() => {
                      setName(item.name);
                      setPhone(item.phone);
                      setContactsModalVisible(false);
                      setContactsSearch('');
                    }}
                  />
                </View>
              )}
            />
          ) : (
            <EmptyState
              title="لا توجد نتائج"
              subtitle="جرّب اسماً آخر أو تأكد أن جهة الاتصال تتوفر على رقم هاتف."
            />
          )}
          <PrimaryButton
            title="إغلاق"
            variant="secondary"
            onPress={() => {
              setContactsModalVisible(false);
              setContactsSearch('');
            }}
          />
        </View>
      </View>
    </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  form: {
    flex: 1,
    justifyContent: 'center',
    gap: 18,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(46, 36, 27, 0.35)',
  },
  modalCard: {
    backgroundColor: '#F7F1E7',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 20,
    gap: 16,
    maxHeight: '82%',
  },
  modalTitle: {
    textAlign: 'right',
    color: '#2E241B',
    fontSize: 22,
    fontWeight: '900',
  },
  contactsList: {
    maxHeight: 360,
  },
  contactsListContent: {
    gap: 10,
  },
  contactItem: {
    backgroundColor: '#FFF8ED',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E6D6BC',
    padding: 14,
    gap: 12,
  },
  contactTextWrap: {
    gap: 4,
  },
  contactName: {
    textAlign: 'right',
    color: '#2E241B',
    fontSize: 17,
    fontWeight: '800',
  },
  contactPhone: {
    textAlign: 'right',
    color: '#6A5440',
  },
  pickButton: {
    alignSelf: 'stretch',
  },
  webInfoText: {
    marginTop: 12,
    color: '#6A5440',
    textAlign: 'right',
    fontSize: 14,
  },
});
