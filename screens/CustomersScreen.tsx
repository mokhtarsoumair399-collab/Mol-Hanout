import React, { useLayoutEffect, useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import { ArabicInput } from '../components/ArabicInput';
import { CustomerCard } from '../components/CustomerCard';
import { EmptyState } from '../components/EmptyState';
import { PrimaryButton } from '../components/PrimaryButton';
import { ScreenContainer } from '../components/ScreenContainer';
import { SectionTitle } from '../components/SectionTitle';
import { useAppContext } from '../context/AppContext';

export function CustomersScreen({ navigation }: { navigation: any }) {
  const { customers, loading } = useAppContext();
  const [search, setSearch] = useState('');
  const rootNavigation = navigation.getParent();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: true,
      title: 'الزبائن',
      headerRight: () => (
        <Text onPress={() => rootNavigation?.navigate('CustomerForm')} style={styles.headerButton}>
          ➕ إضافة
        </Text>
      ),
    });
  }, [navigation, rootNavigation]);

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
      <PrimaryButton title="➕ إضافة زبون جديد" onPress={() => rootNavigation?.navigate('CustomerForm')} />

      {loading ? (
        <Text style={styles.loading}>جاري تحميل البيانات...</Text>
      ) : filteredCustomers.length ? (
        filteredCustomers.map((customer) => (
          <CustomerCard
            key={customer.id}
            customer={customer}
            onPress={() => rootNavigation?.navigate('CustomerDetail', { customerId: customer.id })}
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
