# 🥪 La Gran Familia — Deli & Market App

A mobile app for managing **La Gran Familia Deli & Market** — built with Capacitor 6 and runs natively on iPhone and Android. All data is stored locally on the device (no server needed).

---

## Features

- **📊 Dashboard** — Weekly snapshot: revenue, expenses, merchandise, payroll, and net profit
- **💵 Revenue** — Log weekly revenue totals
- **🧾 Expenses** — Track one-time and recurring monthly overhead
- **🛍️ Merchandise** — Log store purchases by vendor with receipt photos
- **👥 Employees** — Manage weekly pay and deductions
- **📋 Orders** — Create order lists by department, share with workers
- **📈 Reports** — All-time and weekly financial reports
- **👤 Users** — Admin and worker accounts (max 3 admins)
- **⚙️ Settings** — Dark/light mode, English/Spanish language

---

## Tech Stack

- **Capacitor 6** — Native iOS & Android wrapper
- **IndexedDB** — On-device storage, works fully offline
- **Vanilla JS / HTML / CSS** — No frameworks, no build step
- **iOS** — Distributed via TestFlight
- **Android** — APK via Android Studio

---

> Change the password after first login in the Users tab.

---

## Development

```bash
# Install dependencies
npm install

# Serve locally in browser
npx serve www -p 3000

# Sync changes to iOS/Android
npx cap sync

# Open in Xcode (iOS)
npx cap open ios

# Open in Android Studio
npx cap open android
```

---

## Project Structure

```
www/
├── index.html          # App shell (login + nav)
├── css/app.css         # Styles + dark mode
└── js/
    ├── db.js           # IndexedDB wrapper
    ├── translations.js # EN/ES translations
    ├── app.js          # Core: boot, login, nav
    └── pages/
        ├── dashboard.js
        ├── revenue.js
        ├── expenses.js
        ├── merchandise.js
        ├── employees.js
        ├── orders.js
        ├── reports.js
        ├── users.js
        └── settings.js
```
