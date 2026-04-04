Here is your README translated and well-organized into **major world languages**, including **Arabic**, **English**, **French**, **Spanish**, and **German**:

---

# 🌍 Mol Hanout – Multilingual README

---

## 🇬🇧 English

# Mol Hanout

An Expo app to track customer debts inside a shop, with Arabic UI, RTL support, and WhatsApp reminders.

## Run

```bash
nvm use
npm install
npx expo start
eas build -p android --profile preview
```

## Environment Requirements

* This project uses `Expo SDK 54`.
* Requires `Node 20.19.4` or newer.
* Using `Node 18` may cause errors like `toReversed is not a function`.

## Build Android & iOS

```bash
npm install
npx eas login
npx eas build -p android --profile production
npx eas build -p ios --profile production
```

* EAS config file: `eas.json`
* Android package: `com.molhanout.app`
* iOS bundle identifier: `com.molhanout.app`

## Features

* Customer management: add, edit, delete, search.
* Debt and payment tracking with automatic balance.
* Dashboard with total debts, number of customers, and top debtors.
* Customer detail screen with transaction history.
* WhatsApp reminder button.
* **Bulk WhatsApp messaging** - Send messages to multiple customers at once.
* **Auto-message settings** - Configure automatic reminders, followups, and payment confirmations per customer.
* **Inventory management** - Track products, stock levels, and low stock alerts.
* Automatic daily local notifications configurable per customer.
* Per-customer reminder dropdown with a built-in time picker.
* Instant test notification button for checking reminder delivery.
* Toast feedback when saving or changing reminder settings.
* Offline-first storage using `AsyncStorage`.

## Notes

* App starts with demo data.
* UI is بالكامل in Arabic.
* RTL is enabled; first launch may require reload on some devices.

## Contact Co-Founders

* Mokhtar Soumair: [https://www.linkedin.com/in/mokhtar-soumair-4b8855394/](https://www.linkedin.com/in/mokhtar-soumair-4b8855394/)
* Houssam Essaki: [https://www.linkedin.com/in/houssam-essaki/](https://www.linkedin.com/in/houssam-essaki/)

---

## 🇸🇦 العربية

# Mol Hanout

تطبيق Expo لمتابعة ديون الزبائن داخل الدكان، مع واجهة عربية ودعم RTL وتذكير عبر واتساب.

## التشغيل

```bash
nvm use
npm install
npx expo start
eas build -p android --profile preview
```

## متطلبات البيئة

* المشروع يعمل على `Expo SDK 54`.
* يتطلب `Node 20.19.4` أو أحدث.
* استخدام `Node 18` قد يسبب خطأ مثل `toReversed is not a function`.

## بناء Android و iOS

```bash
npm install
npx eas login
npx eas build -p android --profile production
npx eas build -p ios --profile production
```

* ملف الإعداد: `eas.json`
* Android package: `com.molhanout.app`
* iOS bundle identifier: `com.molhanout.app`

## المزايا

* إدارة الزبائن: إضافة، تعديل، حذف، وبحث.
* تتبع الديون والتسديدات مع رصيد تلقائي.
* لوحة ملخص تعرض إجمالي الديون وعدد الزبائن وأكبر المدينين.
* شاشة تفاصيل لكل زبون مع سجل المعاملات.
* زر إرسال تذكير عبر واتساب.
* **إرسال رسائل جماعية عبر واتساب** - إرسال رسائل لعدة زبائن دفعة واحدة.
* **إعدادات الرسائل التلقائية** - تكوين تذكيرات تلقائية ومتابعات وتأكيدات دفع لكل زبون.
* **إدارة المخزون** - تتبع المنتجات ومستويات المخزون وتنبيهات المخزون المنخفض.
* إشعارات محلية تلقائية يومية قابلة للتخصيص لكل زبون.
* قسم منسدل لكل زبون لإعداد التذكير مع منتقي وقت.
* زر اختبار فوري لإرسال إشعار تجريبي مباشرة.
* رسائل Toast عند حفظ إعدادات التذكير أو تغييرها.
* تخزين محلي باستخدام `AsyncStorage`.

## ملاحظات

* التطبيق يبدأ ببيانات تجريبية.
* الواجهة بالعربية بالكامل.
* دعم RTL مفعل وقد يتطلب إعادة تحميل أول مرة.

## المؤسسون

* Mokhtar Soumair
* Houssam Essaki

---

## 🇫🇷 Français

# Mol Hanout

Application Expo pour suivre les dettes des clients dans un magasin, avec interface arabe, support RTL et rappels via WhatsApp.

## Exécution

```bash
nvm use
npm install
npx expo start
eas build -p android --profile preview
```

## Prérequis

* Utilise `Expo SDK 54`
* Nécessite `Node 20.19.4` ou plus récent
* `Node 18` peut causer une erreur (`toReversed is not a function`)

## Build Android & iOS

```bash
npm install
npx eas login
npx eas build -p android --profile production
npx eas build -p ios --profile production
```

* Config EAS: `eas.json`
* Package Android: `com.molhanout.app`
* iOS bundle: `com.molhanout.app`

## Fonctionnalités

* Gestion des clients.
* Suivi des dettes et paiements.
* Tableau de bord avec statistiques.
* Détails client avec historique.
* Rappel WhatsApp.
* **Messagerie WhatsApp en masse** - Envoyer des messages à plusieurs clients simultanément.
* **Paramètres de messages automatiques** - Configurer des rappels automatiques, suivis et confirmations de paiement par client.
* **Gestion des stocks** - Suivre les produits, niveaux de stock et alertes de stock faible.
* Notifications locales quotidiennes configurables par client.
* Sélecteur d'heure intégré dans le rappel de chaque client.
* Bouton de test pour envoyer une notification immédiate.
* Stockage local (`AsyncStorage`).

## Notes

* Données de démonstration incluses.
* Interface en arabe.
* Support RTL activé.

---

## 🇪🇸 Español

# Mol Hanout

Aplicación Expo para gestionar deudas de clientes en una tienda, con interfaz árabe, soporte RTL y recordatorios por WhatsApp.

## Ejecutar

```bash
nvm use
npm install
npx expo start
eas build -p android --profile preview
```

## Requisitos

* Usa `Expo SDK 54`
* Requiere `Node 20.19.4` o superior
* `Node 18` puede causar errores

## Build Android & iOS

```bash
npm install
npx eas login
npx eas build -p android --profile production
npx eas build -p ios --profile production
```

## Funcionalidades

* Gestión de clientes.
* Seguimiento de deudas.
* Panel con estadísticas.
* Historial de transacciones.
* Recordatorios por WhatsApp.
* **Mensajería WhatsApp masiva** - Enviar mensajes a múltiples clientes a la vez.
* **Configuración de mensajes automáticos** - Configurar recordatorios automáticos, seguimientos y confirmaciones de pago por cliente.
* **Gestión de inventario** - Rastrear productos, niveles de stock y alertas de stock bajo.
* Notificaciones locales diarias configurables por cliente.
* Selector de hora integrado para el recordatorio de cada cliente.
* Botón de prueba para enviar una notificación inmediata.
* Almacenamiento local.

---

## 🇩🇪 Deutsch

# Mol Hanout

Eine Expo-App zur Verwaltung von Kundenschulden im Geschäft mit arabischer Oberfläche, RTL-Unterstützung und WhatsApp-Erinnerungen.

## Ausführen

```bash
nvm use
npm install
npx expo start
eas build -p android --profile preview
```

## Anforderungen

* `Expo SDK 54`
* `Node 20.19.4` oder neuer
* `Node 18` kann Fehler verursachen

## Build Android & iOS

```bash
npm install
npx eas login
npx eas build -p android --profile production
npx eas build -p ios --profile production
```

## Funktionen

* Kundenverwaltung.
* Schuldenverfolgung.
* Dashboard mit Statistiken.
* WhatsApp-Erinnerungen.
* **WhatsApp-Massenversand** - Nachrichten an mehrere Kunden gleichzeitig senden.
* **Automatische Nachrichteneinstellungen** - Automatische Erinnerungen, Nachverfolgungen und Zahlungsbestätigungen pro Kunde konfigurieren.
* **Bestandsverwaltung** - Produkte, Lagerbestände und niedrige Lagerbestands-Warnungen verfolgen.
* Tägliche lokale Benachrichtigungen pro Kunde konfigurierbar.
* Integrierter Zeitwähler und Soforttest für Kundenerinnerungen.
* Transaktionshistorie.
* WhatsApp-Erinnerungen.
* Lokaler Speicher.

---
