import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, Animated, Dimensions, Pressable, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';

import HomeScreen from '../screens/Home/Home';
import InventoryScreen from '../screens/Inventory/Inventory';
import OrdersScreen from '../screens/Orders/Orders';
import NotificationsScreen from '../screens/Notifications/Notifications';
import MoreScreen from '../screens/Settings/More';
import ProductDetailsScreen from '../screens/ProductDetails/ProductDetails';
import OrderDetailScreen from '../screens/OrderDetail/OrderDetail';
import WarehousesScreen from '../screens/Warehouses/Warehouses';
import ProfileScreen from '../screens/Profile/Profile';
import SettingsScreen from '../screens/Settings/Settings';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const DRAWER_WIDTH = 280;

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const TAB_ICONS: Record<string, string> = {
  Home: '🏠',
  Inventory: '📦',
  Orders: '📋',
  Alerts: '🔔',
  More: '☰',
};

interface Props { onLogout: () => void; }

// ═══════════════════════════════════════════════════════════════════════════
// CUSTOM DRAWER — Pure Animated, no external library
// ═══════════════════════════════════════════════════════════════════════════

interface DrawerContextType {
  openDrawer: () => void;
  closeDrawer: () => void;
}

const DrawerContext = React.createContext<DrawerContextType>({
  openDrawer: () => {},
  closeDrawer: () => {},
});

export function useDrawer() {
  return React.useContext(DrawerContext);
}

function CustomDrawer({ children, onLogout }: { children: React.ReactNode; onLogout: () => void }) {
  const { colors, spacing, fontSize, fontWeight, borderRadius } = useTheme();
  const insets = useSafeAreaInsets();
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

  const menuItems = [
    { label: 'Home',          icon: '🏠' },
    { label: 'Inventory',     icon: '📦' },
    { label: 'Orders',        icon: '📋' },
    { label: 'Warehouses',    icon: '🏭' },
    { label: 'Notifications', icon: '🔔' },
    { label: 'My Profile',    icon: '👤' },
    { label: 'Settings',      icon: '⚙️' },
  ];

  return (
    <DrawerContext.Provider value={{ openDrawer, closeDrawer }}>
      <View style={{ flex: 1 }}>
        {/* Main Content */}
        {children}

        {/* Overlay */}
        {isOpen && (
          <Animated.View
            style={[
              StyleSheet.absoluteFill,
              { backgroundColor: 'rgba(0,0,0,0.5)', opacity: overlayOpacity },
            ]}
          >
            <Pressable style={StyleSheet.absoluteFill} onPress={closeDrawer} />
          </Animated.View>
        )}

        {/* Drawer Panel */}
        <Animated.View
          style={[
            s.drawerPanel,
            {
              width: DRAWER_WIDTH,
              backgroundColor: colors.surface,
              transform: [{ translateX }],
              paddingTop: insets.top + 16,
              shadowColor: '#000',
              shadowOffset: { width: 2, height: 0 },
              shadowOpacity: 0.25,
              shadowRadius: 10,
              elevation: 20,
            },
          ]}
        >
          {/* Drawer Header */}
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
                onPress={() => closeDrawer()}
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
          paddingBottom: 20,
          paddingTop: 8,
          height: 80,
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

// ═══════════════════════════════════════════════════════════════════════════
// MAIN NAVIGATOR — Stack + Custom Drawer
// ═══════════════════════════════════════════════════════════════════════════

function MainStack({ onLogout }: Props) {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs">
        {() => <TabNavigator onLogout={onLogout} />}
      </Stack.Screen>
      <Stack.Screen name="ProductDetails" options={{ headerShown: true, title: 'Product Details' }}>
        {(props: any) => <ProductDetailsScreen {...props} />}
      </Stack.Screen>
      <Stack.Screen name="OrderDetail" options={{ headerShown: true, title: 'Order Detail' }}>
        {(props: any) => <OrderDetailScreen {...props} />}
      </Stack.Screen>
      <Stack.Screen name="Warehouses" component={WarehousesScreen} options={{ headerShown: true, title: 'Warehouses' }} />
      <Stack.Screen name="Profile" component={ProfileScreen} options={{ headerShown: true, title: 'My Profile' }} />
      <Stack.Screen name="Settings" component={SettingsScreen} options={{ headerShown: true, title: 'Settings' }} />
    </Stack.Navigator>
  );
}

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