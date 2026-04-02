import * as Contacts from 'expo-contacts';

export type DeviceContact = {
  id: string;
  name: string;
  phone: string;
};

export async function requestContactsAccess() {
  const existingPermission = await Contacts.getPermissionsAsync();
  if (existingPermission.granted) {
    return true;
  }

  const requestedPermission = await Contacts.requestPermissionsAsync();
  return requestedPermission.granted;
}

export async function loadDeviceContacts(): Promise<DeviceContact[]> {
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
