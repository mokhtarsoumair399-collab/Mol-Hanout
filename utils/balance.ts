import { Customer, InventoryItem } from './types';

export function getCustomerBalance(customer: Customer) {
  return customer.transactions.reduce((total, transaction) => {
    return transaction.type === 'debt' ? total + transaction.amount : total - transaction.amount;
  }, 0);
}

export function getTotalDebts(customers: Customer[]) {
  return customers.reduce((total, customer) => total + Math.max(getCustomerBalance(customer), 0), 0);
}

export function getTopDebtor(customers: Customer[]) {
  return [...customers].sort((a, b) => getCustomerBalance(b) - getCustomerBalance(a))[0];
}

export function getLowStockItems(inventory: InventoryItem[]) {
  return inventory.filter((item) => item.currentStock <= item.minStock);
}

export function getOutOfStockItems(inventory: InventoryItem[]) {
  return inventory.filter((item) => item.currentStock === 0);
}

export function getTotalInventoryValue(inventory: InventoryItem[]) {
  return inventory.reduce((total, item) => total + item.currentStock, 0);
}
