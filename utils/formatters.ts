export function formatCurrency(value: number) {
  return `${value.toFixed(2)} درهم`;
}

export function formatDate(date: string) {
  return new Intl.DateTimeFormat('ar-MA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date));
}

export function formatDateToIso(date: Date) {
  return date.toISOString().split('T')[0];
}

export function normalizePhoneNumber(phone: string) {
  return phone.replace(/[^\d]/g, '');
}
