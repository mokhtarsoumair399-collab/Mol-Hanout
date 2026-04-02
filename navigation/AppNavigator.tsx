import React from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { DashboardScreen } from '../screens/DashboardScreen';
import { CustomerDetailScreen } from '../screens/CustomerDetailScreen';
import { CustomerFormScreen } from '../screens/CustomerFormScreen';
import { CustomersScreen } from '../screens/CustomersScreen';

export type RootStackParamList = {
  MainTabs: undefined;
  CustomerForm: { customerId?: string } | undefined;
  CustomerDetail: { customerId: string };
};

export type MainTabParamList = {
  Dashboard: undefined;
  Customers: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#8A4B14',
        tabBarInactiveTintColor: '#8C7A64',
        tabBarStyle: {
          height: 70,
          paddingBottom: 10,
          paddingTop: 10,
        },
        tabBarLabelStyle: {
          fontSize: 14,
          fontWeight: '700',
        },
      }}
    >
      <Tab.Screen
        name="Customers"
        component={CustomersScreen}
        options={{ title: '👤 الزبائن' }}
      />
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{ title: '💰 الرئيسية' }}
      />
    </Tab.Navigator>
  );
}

export function AppNavigator() {
  return (
    <NavigationContainer
      theme={{
        ...DefaultTheme,
        colors: {
          ...DefaultTheme.colors,
          background: '#F7F1E7',
          card: '#FFF8ED',
          text: '#2E241B',
          primary: '#8A4B14',
          border: '#E7D7BD',
        },
      }}
    >
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: '#FFF8ED' },
          headerTintColor: '#2E241B',
          headerTitleStyle: { fontWeight: '700' },
          contentStyle: { backgroundColor: '#F7F1E7' },
        }}
      >
        <Stack.Screen
          name="MainTabs"
          component={MainTabs}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="CustomerForm"
          component={CustomerFormScreen}
          options={({ route }) => ({
            title: route.params?.customerId ? 'تعديل الزبون' : 'إضافة زبون',
          })}
        />
        <Stack.Screen
          name="CustomerDetail"
          component={CustomerDetailScreen}
          options={{ title: 'تفاصيل الحساب' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
