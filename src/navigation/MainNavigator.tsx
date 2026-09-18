import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, Animated, Dimensions, Pressable, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../theme/ThemeContext';
import { usePermissions } from '../hooks/usePermissions';
import { DrawerContext } from './DrawerContext';
import HomeScreen from '../screens/Home/Home';
import InventoryScreen from '../screens/Inventory/Inventory';
import OrdersScreen from '../screens/Orders/Orders';
import NotificationsScreen from '../screens/Notifications/Notifications';
import MoreScreen from '../screens/Settings/More';
import ProductDetailsScreen from '../screens/ProductDetails/ProductDetails';
import ProductFormScreen from '../screens/ProductForm/ProductForm';
import OrderDetailScreen from '../screens/OrderDetail/OrderDetail';
import OrderFormScreen from '../screens/OrderForm/OrderForm';
import WarehousesScreen from '../screens/Warehouses/Warehouses';
import ProfileScreen from '../screens/Profile/Profile';
import SettingsScreen from '../screens/Settings/Settings';
import CustomersScreen from '../screens/Customers/Customers';
import CustomerFormScreen from '../screens/CustomerForm/CustomerForm';
import ScannerScreen from '../screens/Scanner/scanner';
import POFormScreen from '../screens/POForm/POForm';
import PODetailScreen from '../screens/PODetail/PODetail';
import SuppliersScreen from '../screens/Suppliers/Suppliers';
import BulkImportScreen from '../screens/BulkImport/BulkImport';
import InvoicesScreen from '../screens/Invoices/Invoices';
import InvoiceDetailScreen from '../screens/InvoiceDetail/InvoiceDetail';
import InvoicePreviewScreen from '../screens/InvoicePreview/InvoicePreview';
import InvoiceSettingsScreen from '../screens/InvoiceSettings/InvoiceSettings';
import InvoiceFormScreen from '../screens/InvoiceForm/InvoiceForm';
import DispatchesScreen from '../screens/Dispatches/Dispatches';
import DispatchDetailScreen from '../screens/DispatchDetail/DispatchDetail';
import PackingSlipPreviewScreen from '../screens/PackingSlipPreview/PackingSlipPreview';
import SalesReturnsScreen from '../screens/SalesReturns/SalesReturns';
import SalesReturnDetailScreen from '../screens/SalesReturnDetail/SalesReturnDetail';
import SalesReturnFormScreen from '../screens/SalesReturnForm/SalesReturnForm';
import PurchaseReturnsScreen from '../screens/PurchaseReturns/PurchaseReturns';
import PurchaseReturnDetailScreen from '../screens/PurchaseReturnDetail/PurchaseReturnDetail';
import PurchaseReturnFormScreen from '../screens/PurchaseReturnForm/PurchaseReturnForm';
import ReportsScreen from '../screens/Reports/Reports';
import StockMovementsScreen from '../screens/StockMovements/StockMovements';


const DRAWER_WIDTH = 280;

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator(); <Stack.Screen name="DispatchDetail" options={{ headerShown: true, title: 'Dispatch Detail' }}>
  {(props: any) => <DispatchDetailScreen {...props} />}
</Stack.Screen>

const TAB_ICONS: Record<string, string> = {
  Home: '🏠',
  Inventory: '📦',
  Orders: '📋',
  Alerts: '🔔',
  More: '☰',
};

interface Props { onLogout: () => void; }

// ═══════════════════════════════════════════════════════════════════════════
// CUSTOM DRAWER — uses useNavigation from React Navigation
// ═══════════════════════════════════════════════════════════════════════════

function DrawerContent({ closeDrawer, onLogout }: { closeDrawer: () => void; onLogout: () => void }) {
  const { colors, spacing, fontSize, fontWeight, borderRadius } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { canCreateCustomers, canManagePurchasing } = usePermissions();

  function navigateTo(screen: string, params?: Record<string, any>) {
    closeDrawer();
    setTimeout(() => {
      try {
        navigation.navigate(screen, params);
      } catch { }
    }, 150);
  }

  const menuItems = [
    { label: 'Home', icon: '🏠', onPress: () => navigateTo('MainTabs', { screen: 'Home' }) },
    { label: 'Inventory', icon: '📦', onPress: () => navigateTo('MainTabs', { screen: 'Inventory' }) },
    { label: 'Orders', icon: '📋', onPress: () => navigateTo('MainTabs', { screen: 'Orders' }) },
    { label: 'Invoices', icon: '🧾', onPress: () => navigateTo('Invoices') },
    { label: 'Invoice Settings', icon: '⚙️', onPress: () => navigateTo('InvoiceSettingsScreen') },
    { label: 'Dispatches', icon: '🚚', onPress: () => navigateTo('Dispatches') },
    { label: 'Warehouses', icon: '🏭', onPress: () => navigateTo('Warehouses') },
    ...(canManagePurchasing ? [{ label: 'Suppliers', icon: '🏢', onPress: () => navigateTo('Suppliers') }] : []),
    { label: 'Notifications', icon: '🔔', onPress: () => navigateTo('MainTabs', { screen: 'Alerts' }) },
    { label: 'My Profile', icon: '👤', onPress: () => navigateTo('Profile') },
    { label: 'Settings', icon: '⚙️', onPress: () => navigateTo('Settings') },
    { label: 'Sales Returns', icon: '🔄', onPress: () => navigateTo('SalesReturns') },
    { label: 'Purchase Returns', icon: '📤', onPress: () => navigateTo('PurchaseReturns') },
    { label: 'Reports', icon: '📊', onPress: () => navigateTo('Reports') },
    { label: 'Stock Movements', icon: '📋', onPress: () => navigateTo('StockMovements') },
  ];

  return (
    <View style={{ paddingTop: insets.top + 16, flex: 1 }}>
      {/* Header */}
      <View style={[s.drawerHeader, { paddingHorizontal: spacing.lg, paddingBottom: spacing.lg, borderBottomColor: colors.border, borderBottomWidth: 1 }]}>
        <View style={[s.logoBox, { backgroundColor: colors.primary, borderRadius: borderRadius.md }]}>
          <Text style={s.logoText}>D</Text>
        </View>
        <View style={{ marginLeft: spacing.base }}>
          <Text style={{ color: colors.textPrimary, fontSize: fontSize.lg, fontWeight: fontWeight.bold }}>
            DYUKSA IMS
          </Text>
          <Text style={{ color: colors.textSecondary, fontSize: fontSize.xs }}>
            Inventory Management
          </Text>
        </View>
      </View>

      {/* Menu Items */}
      <View style={{ marginTop: spacing.sm }}>
        {menuItems.map((item) => (
          <TouchableOpacity
            key={item.label}
            onPress={item.onPress}
            style={[s.menuItem, { paddingVertical: spacing.md, paddingHorizontal: spacing.lg }]}
          >
            <Text style={{ fontSize: 20, marginRight: spacing.base, width: 28 }}>{item.icon}</Text>
            <Text style={{ color: colors.textPrimary, fontSize: fontSize.base, fontWeight: fontWeight.medium }}>
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Divider + Logout */}
      <View style={[s.divider, { borderTopColor: colors.border, marginTop: spacing.lg }]} />
      <TouchableOpacity
        onPress={() => { closeDrawer(); onLogout(); }}
        style={[s.menuItem, { paddingVertical: spacing.md, paddingHorizontal: spacing.lg }]}
      >
        <Text style={{ fontSize: 20, marginRight: spacing.base, width: 28 }}>🚪</Text>
        <Text style={{ color: colors.danger, fontSize: fontSize.base, fontWeight: fontWeight.semibold }}>
          Sign Out
        </Text>
      </TouchableOpacity>
    </View>
  );
}

function CustomDrawer({ children, onLogout }: { children: React.ReactNode; onLogout: () => void }) {
  const { colors } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const translateX = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;

  function openDrawer() {
    setIsOpen(true);
    Animated.parallel([
      Animated.timing(translateX, { toValue: 0, duration: 250, useNativeDriver: true }),
      Animated.timing(overlayOpacity, { toValue: 1, duration: 250, useNativeDriver: true }),
    ]).start();
  }

  function closeDrawer() {
    Animated.parallel([
      Animated.timing(translateX, { toValue: -DRAWER_WIDTH, duration: 200, useNativeDriver: true }),
      Animated.timing(overlayOpacity, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start(() => setIsOpen(false));
  }

  return (
    <DrawerContext.Provider value={{ openDrawer, closeDrawer }}>
      <View style={{ flex: 1 }}>
        {children}

        {isOpen && (
          <Animated.View
            style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.5)', opacity: overlayOpacity }]}
          >
            <Pressable style={StyleSheet.absoluteFill} onPress={closeDrawer} />
          </Animated.View>
        )}

        <Animated.View
          style={[
            s.drawerPanel,
            {
              width: DRAWER_WIDTH,
              backgroundColor: colors.surface,
              transform: [{ translateX }],
              shadowColor: '#000',
              shadowOffset: { width: 2, height: 0 },
              shadowOpacity: 0.25,
              shadowRadius: 10,
              elevation: 20,
            },
          ]}
        >
          <DrawerContent closeDrawer={closeDrawer} onLogout={onLogout} />
        </Animated.View>
      </View>
    </DrawerContext.Provider>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// TAB NAVIGATOR
// ═══════════════════════════════════════════════════════════════════════════

function TabNavigator({ onLogout }: Props) {
  const { colors, fontSize } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused }) => (
          <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.5 }}>
            {TAB_ICONS[route.name] ?? '•'}
          </Text>
        ),
        tabBarActiveTintColor: colors.tabActive,
        tabBarInactiveTintColor: colors.tabInactive,
        tabBarStyle: {
          backgroundColor: colors.tabBar,
          borderTopColor: colors.tabBarBorder,
          borderTopWidth: 1,
          paddingBottom: Math.max(insets.bottom, 8),
          paddingTop: 8,
          height: 56 + Math.max(insets.bottom, 8),
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
        },
        tabBarLabelStyle: {
          fontSize: fontSize.xs,
          fontWeight: '600',
          marginTop: 2,
          marginBottom: 4,
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Inventory" component={InventoryScreen} />
      <Tab.Screen name="Orders" component={OrdersScreen} />
      <Tab.Screen name="Alerts" component={NotificationsScreen} />
      <Tab.Screen name="More">
        {() => <MoreScreen onLogout={onLogout} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

// MAIN STACK — all routes registered here
function MainStack({ onLogout }: Props) {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs">
        {() => <TabNavigator onLogout={onLogout} />}
      </Stack.Screen>
      <Stack.Screen name="ProductDetails" options={{ headerShown: true, title: 'Product Details' }}>
        {(props: any) => <ProductDetailsScreen {...props} />}
      </Stack.Screen>
      <Stack.Screen name="ProductForm" options={{ headerShown: true, title: 'Add Product' }}>
        {(props: any) => <ProductFormScreen {...props} />}
      </Stack.Screen>
      <Stack.Screen name="OrderDetail" options={{ headerShown: true, title: 'Order Detail' }}>
        {(props: any) => <OrderDetailScreen {...props} />}
      </Stack.Screen>
      <Stack.Screen name="OrderForm" options={{ headerShown: true, title: 'Create Order' }}>
        {(props: any) => <OrderFormScreen {...props} />}
      </Stack.Screen>
      <Stack.Screen name="Warehouses" component={WarehousesScreen} options={{ headerShown: true, title: 'Warehouses' }} />
      <Stack.Screen name="Profile" component={ProfileScreen} options={{ headerShown: true, title: 'My Profile' }} />
      <Stack.Screen name="Settings" component={SettingsScreen} options={{ headerShown: true, title: 'Settings' }} />
      <Stack.Screen name="Customers" component={CustomersScreen} options={{ headerShown: true, title: 'Customers' }} />
      <Stack.Screen name="POForm" options={{ headerShown: true, title: 'Create Purchase Order' }}>
        {(props: any) => <POFormScreen {...props} />}
      </Stack.Screen>
      <Stack.Screen name="PODetail" options={{ headerShown: true, title: 'Purchase Order' }}>
        {(props: any) => <PODetailScreen {...props} />}
      </Stack.Screen>
      <Stack.Screen name="Suppliers" component={SuppliersScreen} options={{ headerShown: true, title: 'Suppliers' }} />
      <Stack.Screen name="BulkImport" options={{ headerShown: true, title: 'Import Products' }}>
        {(props: any) => <BulkImportScreen {...props} />}
      </Stack.Screen>
      <Stack.Screen name="Scanner" options={{ headerShown: true, title: 'Barcode Scanner' }}>
        {(props: any) => <ScannerScreen {...props} />}
      </Stack.Screen>
      <Stack.Screen name="CustomerForm" options={{ headerShown: true, title: 'Add Customer' }}>
        {(props: any) => <CustomerFormScreen {...props} />}
      </Stack.Screen>
      <Stack.Screen name="Invoices" component={InvoicesScreen} options={{ headerShown: true, title: 'Invoices' }} />
      <Stack.Screen name="InvoiceDetail" options={{ headerShown: true, title: 'Invoice Detail' }}>
        {(props: any) => <InvoiceDetailScreen {...props} />}
      </Stack.Screen>
      <Stack.Screen name="InvoicePreview" options={{ headerShown: true, title: 'Invoice' }}>
        {(props: any) => <InvoicePreviewScreen {...props} />}
      </Stack.Screen>
      <Stack.Screen name="InvoiceSettingsScreen" component={InvoiceSettingsScreen} options={{ headerShown: true, title: 'Invoice Settings' }} />
      <Stack.Screen name="InvoiceForm" options={{ headerShown: true, title: 'New Invoice' }}>
        {(props: any) => <InvoiceFormScreen {...props} />}
      </Stack.Screen>
      <Stack.Screen name="Dispatches" component={DispatchesScreen} options={{ headerShown: true, title: 'Dispatches' }} />
      <Stack.Screen name="DispatchDetail" options={{ headerShown: true, title: 'Dispatch Detail' }}>
        {(props: any) => <DispatchDetailScreen {...props} />}
      </Stack.Screen>
      <Stack.Screen name="PackingSlipPreview" options={{ headerShown: true, title: 'Packing Slip' }}>
        {(props: any) => <PackingSlipPreviewScreen {...props} />}
      </Stack.Screen>
      <Stack.Screen name="SalesReturns" component={SalesReturnsScreen} options={{ headerShown: true, title: 'Sales Returns' }} />
      <Stack.Screen name="SalesReturnDetail" options={{ headerShown: true, title: 'Return Detail' }}>
        {(props: any) => <SalesReturnDetailScreen {...props} />}
      </Stack.Screen>
      <Stack.Screen name="SalesReturnForm" options={{ headerShown: true, title: 'New Sales Return' }}>
        {(props: any) => <SalesReturnFormScreen {...props} />}
      </Stack.Screen>
      <Stack.Screen name="PurchaseReturns" component={PurchaseReturnsScreen} options={{ headerShown: true, title: 'Purchase Returns' }} />
      <Stack.Screen name="PurchaseReturnDetail" options={{ headerShown: true, title: 'Return Detail' }}>
        {(props: any) => <PurchaseReturnDetailScreen {...props} />}
      </Stack.Screen>
      <Stack.Screen name="PurchaseReturnForm" options={{ headerShown: true, title: 'New Purchase Return' }}>
        {(props: any) => <PurchaseReturnFormScreen {...props} />}
      </Stack.Screen>
      <Stack.Screen name="Reports" component={ReportsScreen} options={{ headerShown: true, title: 'Reports' }} />
      <Stack.Screen name="StockMovements" component={StockMovementsScreen} options={{ headerShown: true, title: 'Stock Movements' }} />
    </Stack.Navigator>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN NAVIGATOR — wraps stack in custom drawer
// ═══════════════════════════════════════════════════════════════════════════

export default function MainNavigator({ onLogout }: Props) {
  return (
    <CustomDrawer onLogout={onLogout}>
      <MainStack onLogout={onLogout} />
    </CustomDrawer>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════════════════════

const s = StyleSheet.create({
  drawerPanel: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    zIndex: 100,
  },
  drawerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoBox: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#fff',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  divider: {
    borderTopWidth: 1,
    marginHorizontal: 16,
  },
});