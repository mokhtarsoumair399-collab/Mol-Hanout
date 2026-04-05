import React, { useLayoutEffect, useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ArabicInput } from '../components/ArabicInput';
import { CustomerCard } from '../components/CustomerCard';
import { EmptyState } from '../components/EmptyState';
import { PrimaryButton } from '../components/PrimaryButton';
import { ScreenContainer } from '../components/ScreenContainer';
import { SectionTitle } from '../components/SectionTitle';
import { useAppContext } from '../context/AppContext';
import { MainTabParamList, RootStackParamList } from '../navigation/AppNavigator';

export function CustomersScreen({ navigation }: { navigation: BottomTabNavigationProp<MainTabParamList, 'Customers'> }) {
  const { customers, loading } = useAppContext();
  const [search, setSearch] = useState('');
  const parentStackNavigation =
    (navigation.getParent() as NativeStackNavigationProp<RootStackParamList> | undefined) ??
    (navigation.getParent()?.getParent() as NativeStackNavigationProp<RootStackParamList> | undefined);
  const navigationAny = navigation as any;

  const openCustomerForm = () => {
    if (parentStackNavigation) {
      parentStackNavigation.navigate('CustomerForm');
      return;
    }

    navigationAny.navigate('CustomerForm');
  };

  const openCustomerDetail = (customerId: string) => {
    if (parentStackNavigation) {
      parentStackNavigation.navigate('CustomerDetail', { customerId });
      return;
    }

    navigationAny.navigate('CustomerDetail', { customerId });
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: true,
      title: 'الزبائن',
      headerRight: () => (
        <Text onPress={openCustomerForm} style={styles.headerButton}>
          ➕ إضافة
        </Text>
      ),
    });
  }, [navigation, openCustomerForm]);

  const filteredCustomers = customers.filter((customer) =>
    customer.name.toLowerCase().includes(search.trim().toLowerCase()),
  );

  return (
    <ScreenContainer>
      <SectionTitle>قائمة الزبائن</SectionTitle>
      <ArabicInput
        label="البحث بالاسم"
        value={search}
        onChangeText={setSearch}
        placeholder="اكتب اسم الزبون"
      />
      <PrimaryButton title="➕ إضافة زبون جديد" onPress={openCustomerForm} />

      {loading ? (
        <Text style={styles.loading}>جاري تحميل البيانات...</Text>
      ) : filteredCustomers.length ? (
        filteredCustomers.map((customer) => (
          <CustomerCard
            key={customer.id}
            customer={customer}
            onPress={() => openCustomerDetail(customer.id)}
          />
        ))
      ) : (
        <EmptyState title="لا يوجد زبائن" subtitle="أضف أول زبون أو غيّر نص البحث لإظهار النتائج." />
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  headerButton: {
    color: '#8A4B14',
    fontWeight: '800',
    fontSize: 15,
  },
  loading: {
    textAlign: 'center',
    color: '#6A5440',
    marginTop: 24,
    fontSize: 16,
  },
});
