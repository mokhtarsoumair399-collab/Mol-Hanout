import { Platform } from 'react-native';

export type DeviceContact = {
  id: string;
  name: string;
  phone: string;
};

export async function requestContactsAccess() {
  if (Platform.OS === 'web') {
    return false;
  }

  const Contacts = await import('expo-contacts');
  const existingPermission = await Contacts.getPermissionsAsync();
  if (existingPermission.granted) {
    return true;
  }

  const requestedPermission = await Contacts.requestPermissionsAsync();
  return requestedPermission.granted;
}

export async function loadDeviceContacts(): Promise<DeviceContact[]> {
  if (Platform.OS === 'web') {
    return [];
  }

  const Contacts = await import('expo-contacts');
  const { data } = await Contacts.getContactsAsync({
    fields: [Contacts.Fields.PhoneNumbers],
    sort: Contacts.SortTypes.FirstName,
  });

  return data
    .map((contact, index) => ({
      id: contact.id || `device-contact-${index}`,
      name: contact.name || 'بدون اسم',
      phone: contact.phoneNumbers?.[0]?.number?.trim() || '',
    }))
    .filter((contact) => contact.phone);
}
