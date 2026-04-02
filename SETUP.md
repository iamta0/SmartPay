# SmartPay — Setup Guide

Follow these steps in order. The whole setup takes about 20 minutes.

---

## Step 1 — Prerequisites

Make sure you have these installed:

```bash
node --version   # must be ≥ 18
npm --version    # must be ≥ 9
```

Install the Expo CLI globally if you haven't already:

```bash
npm install -g expo-cli
```

---

## Step 2 — Install dependencies

```bash
cd SmartPay
npm install
```

Also install the Babel module resolver (needed for `@/` path aliases):

```bash
npm install --save-dev babel-plugin-module-resolver
```

---

## Step 3 — Create your Firebase project

1. Go to [https://console.firebase.google.com](https://console.firebase.google.com)
2. Click **"Add project"** → name it `SmartPay` → click through the wizard
3. Once inside the project dashboard:

### Enable Authentication
- Left sidebar → **Build → Authentication**
- Click **"Get started"**
- Under **Sign-in method**, enable **Email/Password**
- Click **Save**

### Enable Firestore
- Left sidebar → **Build → Firestore Database**
- Click **"Create database"**
- Choose **"Start in test mode"** (you will tighten rules in Step 6)
- Pick the region closest to your users (e.g. `europe-west1` for Europe, `us-central1` for USA)

### Get your web config
- Click the **gear icon** (Project settings) → **Your apps** → **"Add app"** → Web (`</>`)
- Register the app (name it anything)
- Copy the `firebaseConfig` object — you'll need it in the next step

---

## Step 4 — Configure environment variables

```bash
cp .env.example .env
```

Open `.env` and fill in your Firebase values:

```
EXPO_PUBLIC_FIREBASE_API_KEY=AIzaSy...
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
EXPO_PUBLIC_FIREBASE_APP_ID=1:123:web:abc...
```

> ⚠️ Never commit `.env` to git. It is already in `.gitignore`.

---

## Step 5 — Create Firestore indexes

Some queries need composite indexes. Firebase will show you a link in the console
if an index is missing — click it to auto-create. Alternatively, create these manually:

**Collection:** `transactions`

| Fields | Order |
|--------|-------|
| `senderId` ASC + `createdAt` DESC | For sender query |
| `receiverId` ASC + `createdAt` DESC | For receiver query |

To create:
- Firebase Console → Firestore → **Indexes** tab → **Add index**

---

## Step 6 — Apply Firestore security rules

1. Open `firestore.rules` in the project root
2. Copy the entire contents
3. Firebase Console → Firestore → **Rules** tab
4. Replace the existing rules with your copied content
5. Click **Publish**

---

## Step 7 — Run the app

### On your phone (recommended)
```bash
npx expo start
```
Scan the QR code with the **Expo Go** app (iOS App Store / Google Play).

### On iOS Simulator (Mac only)
```bash
npx expo start --ios
```

### On Android Emulator
```bash
npx expo start --android
```

---

## Step 8 — Test the full transfer flow

1. **Create two accounts** — sign up twice (use two different emails)
2. **Add balance** — in Firebase Console → Firestore → `wallets` collection,
   find one wallet document and set `balance` to `500000` (= ₦5,000.00)
3. **Send money** — from account 1, send to account 2's email
4. **Verify** — check both wallet balances update and transaction records appear

---

## Troubleshooting

### "Module not found: @/"
Make sure `babel-plugin-module-resolver` is installed and `babel.config.js` is correct.
Restart the Metro bundler with `npx expo start --clear`.

### "Firebase: Error (auth/...)"
Double-check your `.env` values — even a single wrong character breaks auth.

### Firestore permission denied
Check that your security rules are published and the user is authenticated before calling Firestore.

### QR code not scanning
Ensure `react-native-svg` is installed. Run `npx expo install react-native-svg`.

### Metro bundler cache issues
```bash
npx expo start --clear
```

---

## Project structure recap

```
SmartPay/
├── App.tsx                          ← Entry point
├── app.json                         ← Expo config
├── firestore.rules                  ← Paste into Firebase Console
├── .env                             ← Your Firebase credentials (not committed)
└── src/
    ├── types/index.ts               ← All TypeScript interfaces
    ├── config/firebase.ts           ← Firebase init
    ├── services/
    │   ├── authService.ts           ← signup / login / logout
    │   ├── walletService.ts         ← fetchWallet / transferFunds (atomic)
    │   └── transactionService.ts   ← paginated transaction fetch
    ├── store/
    │   ├── authStore.ts             ← Zustand: user session
    │   ├── walletStore.ts           ← Zustand: wallet balance
    │   └── transactionStore.ts     ← Zustand: transaction list
    ├── hooks/
    │   ├── useAuth.ts               ← Firebase auth listener
    │   ├── useTransfer.ts           ← Transfer flow hook
    │   └── useTransactions.ts      ← Paginated load hook
    ├── navigation/
    │   ├── RootNavigator.tsx        ← Auth gate
    │   ├── AuthNavigator.tsx        ← Login / Signup stack
    │   └── AppNavigator.tsx         ← Bottom tabs
    ├── screens/
    │   ├── SplashScreen.tsx
    │   ├── auth/LoginScreen.tsx
    │   ├── auth/SignupScreen.tsx
    │   ├── home/HomeScreen.tsx
    │   ├── send/SendMoneyScreen.tsx
    │   ├── receive/ReceiveMoneyScreen.tsx
    │   ├── history/TransactionHistoryScreen.tsx
    │   ├── pin/PinScreen.tsx
    │   └── profile/ProfileScreen.tsx
    ├── components/
    │   ├── ui/Button.tsx
    │   ├── ui/Input.tsx
    │   ├── ui/Card.tsx
    │   ├── ui/LoadingOverlay.tsx
    │   ├── wallet/BalanceCard.tsx
    │   └── transactions/TransactionItem.tsx
    └── utils/
        ├── currency.ts              ← formatAmount / toSmallestUnit
        ├── validators.ts            ← Zod schemas
        └── theme.ts                 ← Colors / Spacing / Radius constants
```

---

## What's built

| Feature | Status |
|---------|--------|
| Email/password auth | ✅ |
| Persistent login session | ✅ |
| Wallet balance display | ✅ |
| Hide/show balance | ✅ |
| Send money (3-step flow) | ✅ |
| Atomic transfer (no partial states) | ✅ |
| Insufficient balance guard | ✅ |
| Invalid recipient guard | ✅ |
| Transaction history (paginated) | ✅ |
| Filter transactions (all/in/out) | ✅ |
| QR code for receiving | ✅ |
| Share payment details | ✅ |
| 4-digit PIN (set & verify) | ✅ |
| PIN shake animation on wrong entry | ✅ |
| Profile screen | ✅ |
| Animated splash screen | ✅ |
| Pull-to-refresh | ✅ |
| Strict TypeScript (zero `any`) | ✅ |
| Zod input validation | ✅ |
| Firestore security rules | ✅ |

## Optional next steps

- **Biometric auth** — use `expo-local-authentication` in `PinScreen`
- **Push notifications** — add `expo-notifications` + Firebase Cloud Messaging
- **QR scanner** — add `expo-camera` barcode scanner on the Send screen
- **Spending chart** — install `victory-native` and group debits by week
- **Currency conversion** — integrate an exchange rate API
- **Offline queue** — persist failed transfers in AsyncStorage and retry on reconnect
