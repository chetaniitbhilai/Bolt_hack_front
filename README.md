# PinddaLangar Frontend (Expo App)

This is the mobile frontend for the **PinddaLangar** app, built using **React Native**, **Expo Router**, and **TypeScript**.  
It helps users discover nearby Bhandaras (free food distribution events) based on their location and time.

---

## 🗂️ Project Structure

```
.
├── app/
│   ├── (tabs)/                # Tab-based navigation using Expo Router
│   │   ├── _layout.tsx        # Layout for tab navigation
│   │   ├── add.tsx            # Screen to add new Bhandara
│   │   ├── index.tsx          # Home screen
│   │   ├── +not-found.tsx     # 404 fallback
│   └── _layout.tsx            # Root layout
│
├── assets/images/             # App images (icon, splash, etc.)
│   ├── badge.png
│   ├── icon.jpg / icon.png
│   └── splash.png
│
├── components/
│   ├── BhandaraCard.tsx       # Card UI for displaying Bhandara info
│   ├── ErrorMessage.tsx       # UI for showing error messages
│   └── LoadingSpinner.tsx     # Loading spinner animation
│
├── hooks/
│   └── useFramework.ts        # Custom hook (can be renamed/updated)
│
├── types/
│   └── bhandara.ts            # TypeScript interface for Bhandara objects
│
├── utils/
│   ├── api.ts                 # API functions (GET/POST requests)
│   └── location.ts            # Location fetching and distance logic
│
├── .expo/                     # Expo-specific metadata (auto-generated)
├── .gitignore
├── .npmrc
├── .prettierrc
├── app.json                   # Expo app configuration
├── eas.json                   # EAS build configuration
├── expo-env.d.ts              # Type definitions for Expo
├── package.json               # Project metadata and dependencies
├── package-lock.json          # Locked dependency versions
└── tsconfig.json              # TypeScript configuration
```

---

## ⚙️ Technologies Used

- **React Native** with **Expo**
- **TypeScript**
- **Expo Router** for file-based routing
- **Expo Location API** for GPS access
- **Custom Backend API** (Node.js + MongoDB)

---

## 🚀 Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npx expo start
   ```

3. Run on Android/iOS using the Expo Go app or emulator.

---

## 🔧 Features

- **Nearby Bhandaras**: Shows events within 5km radius.
- **Add Bhandara**: Easily list new events with location and time.
- **Location Detection**: Uses device GPS to show nearby events.
- **Offline Friendly (Coming soon)**: Will support caching Bhandaras.

---

## 📁 Screens

- `/index.tsx`: Lists nearby Bhandaras.
- `/add.tsx`: Form to create a new Bhandara.
- `BhandaraCard.tsx`: UI representation of each Bhandara.

---

## 🌐 API Integration

Handled via `utils/api.ts`  
Uses `axios` or `fetch` to communicate with backend.

---
