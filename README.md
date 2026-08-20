# DYUKSA IMS — React Native Mobile App

**Tech Stack:** React Native + TypeScript + Expo SDK 54  
**Backend:** DYUKSA IMS Django 6.x REST API (existing)  
**Auth:** DYUKSA Central JWT (same as Web App)

---

## Mac Setup — Step by Step

### 1. Install Node.js (via nvm — recommended)
```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
nvm install 20
nvm use 20
node -v   # should show v20.x
npm -v    # should show 10.x
```

### 2. Install Expo CLI
```bash
npm install -g expo-cli
npm install -g eas-cli
```

### 3. Install dependencies
```bash
cd dyuksa-ims-mobile
npm install
```

### 4. Set environment variables
Create `.env` in project root:
```
EXPO_PUBLIC_CENTRAL_URL=http://192.168.1.17:8001
EXPO_PUBLIC_IMS_URL=http://192.168.1.15:8000
```

### 5. Run the app
```bash
npx expo start
```

Press:
- `i` → iOS Simulator (Mac only, requires Xcode)
- `a` → Android Emulator (requires Android Studio)
- Scan QR with **Expo Go** app on your phone

---

## Project Structure

```
src/
├── theme/
│   ├── colors.ts          ← all colors (light + dark)
│   ├── spacing.ts         ← all spacing, border radius
│   ├── fonts.ts           ← typography system
│   └── ThemeContext.tsx   ← useTheme() hook
│
├── types/
│   └── index.ts           ← all TypeScript interfaces
│
├── constants/
│   └── index.ts           ← status labels, role lists, storage keys
│
├── services/
│   └── Api.ts             ← ALL API calls (centralized)
│
├── utils/
│   ├── tokenStorage.ts    ← secure token storage (expo-secure-store)
│   └── jwt.ts             ← JWT decode utilities
│
├── navigation/
│   ├── AppNavigator.tsx   ← root (splash → auth → main)
│   ├── AuthNavigator.tsx  ← login + forgot password
│   └── MainNavigator.tsx  ← bottom tabs + screen stack
│
├── components/            ← reusable UI components
│   ├── Button/
│   ├── Input/
│   ├── Card/
│   ├── Badge/
│   ├── SearchBar/
│   ├── Loader/
│   ├── EmptyState/
│   └── ErrorState/
│
└── screens/
    ├── Splash/            ← animated logo screen
    ├── Onboarding/        ← first-launch slides
    ├── Login/             ← JWT login via Central
    ├── ForgotPassword/    ← OTP-based password reset
    ├── Home/              ← dashboard KPIs + low stock
    ├── Inventory/         ← paginated product list + filters
    ├── ProductDetails/    ← product info + stock levels
    ├── Orders/            ← sales + purchase orders tabs
    ├── OrderDetail/       ← order detail + status transitions
    ├── Warehouses/        ← warehouse list
    ├── Notifications/     ← alerts + mark read
    ├── Profile/           ← user info from JWT + API
    └── Settings/          ← theme toggle + app info
```

---

## Web vs Mobile Feature Mapping

| Feature                | Web App | Mobile App | Notes |
|------------------------|---------|------------|-------|
| Login / Logout         | ✅      | ✅          | Same Central auth |
| Forgot Password (OTP)  | ✅      | ✅          | Same API |
| Dashboard KPIs         | ✅      | ✅          | Mobile-optimised |
| Product List           | ✅      | ✅          | With search + filter |
| Product Details        | ✅      | ✅          | Stock, price, category |
| Inventory stock levels | ✅      | ✅          | Per warehouse |
| Low stock alerts       | ✅      | ✅          | Home screen banner |
| Sales Orders list      | ✅      | ✅          | With status filter |
| Order detail + transition | ✅   | ✅          | Confirm/Cancel on mobile |
| Purchase Orders        | ✅      | ✅          | View only on mobile |
| Dispatch notes         | ✅      | ⚠️ Partial  | View only (web for full ops) |
| Warehouse list         | ✅      | ✅          | View + capacity |
| Notifications          | ✅      | ✅          | With mark read |
| Profile                | ✅      | ✅          | JWT + API data |
| Theme (Light/Dark)     | ✅      | ✅          | System + manual |
| Invoice Generator      | ✅      | ❌ Web only | Complex form |
| User Management        | ✅      | ❌ Web only | Admin task |
| Categories CRUD        | ✅      | ❌ Web only | Admin task |
| Supplier CRUD          | ✅      | ❌ Web only | Web admin |
| Customer CRUD          | ✅      | ❌ Web only | Web admin |
| Reports charts         | ✅      | ❌ Web only | Better on large screen |
| Settings (business)    | ✅      | ❌ Web only | Admin task |
| Barcode scan           | ❌      | 🔮 Phase 2 | Needs new API |
| Stock receive mobile   | ❌      | 🔮 Phase 2 | Needs new API |

---

## API Gap Analysis

### APIs Already Available (used by mobile)

| API | Endpoint | Mobile Screen |
|-----|----------|---------------|
| Login | POST /api/v1/auth/login/ | Login |
| Logout | POST /api/v1/auth/logout/ | More |
| Refresh | POST /api/v1/auth/refresh/ | Auto-interceptor |
| Forgot password | POST /api/v1/auth/forgot-password/ | ForgotPassword |
| Verify OTP | POST /api/v1/auth/verify-otp/ | ForgotPassword |
| Set new password | POST /api/v1/auth/set-new-password/ | ForgotPassword |
| Dashboard | GET /api/v1/reports/dashboard/ | Home |
| Products list | GET /api/v1/inventory/products/ | Inventory |
| Product detail | GET /api/v1/inventory/products/:id/ | ProductDetails |
| Low stock | GET /api/v1/inventory/products/low-stock/ | Home |
| Categories | GET /api/v1/inventory/categories/ | Inventory filter |
| Warehouses | GET /api/v1/warehouses/ | Warehouses |
| Sales Orders | GET /api/v1/orders/ | Orders |
| Sales Order detail | GET /api/v1/orders/:id/ | OrderDetail |
| Order transition | POST /api/v1/orders/:id/transition/ | OrderDetail |
| Purchase Orders | GET /api/v1/purchase-orders/ | Orders |
| Notifications | GET /api/v1/notifications/ | Notifications |
| Mark read | POST /api/v1/notifications/mark-read/ | Notifications |
| User profile | GET /api/v1/users/me/ | Profile |

### APIs Missing (needed for Phase 2)

| API | Purpose | Endpoint Suggestion | Priority |
|-----|---------|---------------------|----------|
| Barcode lookup | Scan SKU → product | GET /api/v1/inventory/products/barcode/?sku= | High |
| Quick stock receive | Receive stock on mobile | POST /api/v1/warehouses/:id/receive-stock/ | High |
| Push notification token | Register device | POST /api/v1/notifications/register-device/ | Medium |
| Sales order create mobile | Simplified mobile create | POST /api/v1/orders/ (existing, needs mobile form) | Medium |

---

## DYUKSA IMS Mobile App — Proposed Scope

### Phase 1 — Must Have (Current Build ✅)
- Splash screen + onboarding
- Login / Logout / Forgot Password
- Home dashboard with KPIs and low stock alerts
- Full inventory browser (search, filter, pagination)
- Product detail view
- Sales orders list + detail + status transitions
- Purchase orders view
- Warehouse list
- Notifications with mark read
- User profile
- Light/Dark theme

### Phase 2 — Recommended
- Barcode/QR scanner for product lookup (new API needed)
- Quick stock receive from mobile (new API needed)
- Stock transfer initiation
- Push notifications (FCM/APNs integration)
- Sales order creation from mobile

### Phase 3 — Future
- Offline mode with sync
- Camera-based product image upload
- Analytics charts on mobile
- Approval workflows for purchase orders
- Real-time stock updates via WebSocket

---

## Engineering Rules Applied

- ✅ No inline styles anywhere
- ✅ All colors from `theme/colors.ts`
- ✅ All spacing from `theme/spacing.ts`
- ✅ All API calls in `services/Api.ts`
- ✅ All types in `types/index.ts`
- ✅ All constants in `constants/index.ts`
- ✅ Screen → Hook → Api.ts → Backend pattern
- ✅ No hardcoded roles, no hardcoded data
- ✅ JWT role read from backend token
- ✅ Secure token storage (device keychain)
- ✅ Auto token refresh on 401
- ✅ Loading / Error / Empty states on every screen
- ✅ FlatList with pagination (no loading all data at once)
- ✅ Safe area handling on all screens
- ✅ Works on iOS + Android + tablets
