// ── DYUKSA IMS Mobile — Centralized Type System ───────────────────────────
// Mirrors the Django backend response schemas and web app types.ts exactly.

// ── Auth ─────────────────────────────────────────────────────────────────
export type ImsRole =
  | 'ims_admin'
  | 'warehouse_mgr'
  | 'sales_executive'
  | 'branch_manager'
  | 'accountant'
  | 'employee';

export interface PlatformRoles {
  all?: string;
  ims?: ImsRole | string;
}

export interface JwtPayload {
  user_id:        number;
  username:       string;
  email:          string;
  first_name:     string;
  last_name:      string;
  org_id:         number;
  org_name:       string;
  org_slug:       string;
  platform_roles: PlatformRoles;
}

export interface AuthTokens {
  access:  string;
  refresh: string;
}

export interface LoginResponse extends AuthTokens {}

export interface RefreshResponse {
  access: string;
}

// ── API Response wrappers ─────────────────────────────────────────────────
export interface IMSResponse<T> {
  success: boolean;
  data:    T;
  message?: string;
}

export interface PaginatedResponse<T> {
  count:    number;
  next:     string | null;
  previous: string | null;
  results:  T[];
}

// ── User / Profile ────────────────────────────────────────────────────────
export interface User {
  id:         number;
  username:   string;
  email:      string;
  first_name: string;
  last_name:  string;
  ims_role:   ImsRole | string;
  is_active:  boolean;
}

// ── Dashboard ─────────────────────────────────────────────────────────────
export interface DashboardWarehouse {
  id:       number;
  name:     string;
  code:     string;
  capacity: number;
  items:    number;
  percent:  number;
}

export interface DashboardData {
  total_products:     number;
  total_warehouses:   number;
  low_stock_count:    number;
  pending_orders:     number;
  pending_dispatches: number;
  today_dispatches:   number;
  revenue_30_days?:   number;
  orders_30_days?:    number;
  total_stock_value?: number;
  warehouses?:        DashboardWarehouse[];
}

// ── Product ───────────────────────────────────────────────────────────────
export interface Product {
  id:                  number;
  name:                string;
  sku:                 string;
  category:            number | null;
  category_name:       string | null;
  brand?:              number | null;
  brand_name?:         string | null;
  unit:                string;
  purchase_price:      string;
  selling_price:       string;
  low_stock_threshold: number;
  is_active:           boolean;
  total_stock:         number;
  is_low_stock:        boolean;
  organisation:        number;
  created_at:          string;
  updated_at:          string;
}

// ── Inventory ─────────────────────────────────────────────────────────────
export interface InventoryBalance {
  id:                  number;
  product:             number;
  product_name:        string;
  product_sku:         string;
  warehouse:           number;
  warehouse_name:      string;
  on_hand:             number;
  reserved:            number;
  in_transit:          number;
  damaged:             number;
  available:           number;
  low_stock_threshold: number;
  updated_at:          string;
}

export interface StockLevel {
  id:             number;
  warehouse:      number;
  warehouse_name: string;
  warehouse_code: string;
  quantity:       number;
}

// ── Warehouse ─────────────────────────────────────────────────────────────
export interface Warehouse {
  id:         number;
  name:       string;
  code:       string;
  address:    string;
  city:       string;
  state:      string;
  pincode:    string;
  capacity:   number;
  is_active:  boolean;
}

// ── Category ─────────────────────────────────────────────────────────────
export interface Category {
  id:        number;
  name:      string;
  parent?:   number | null;
  is_active: boolean;
}

// ── Supplier ─────────────────────────────────────────────────────────────
export interface Supplier {
  id:           number;
  code:         string;
  name:         string;
  contact_name: string;
  email:        string;
  phone:        string;
  address:      string;
  is_active:    boolean;
}

// ── Customer ─────────────────────────────────────────────────────────────
export interface Customer {
  id:      number;
  name:    string;
  email:   string;
  phone:   string;
  address: string;
}

// ── Sales Order ───────────────────────────────────────────────────────────
export type OrderStatus =
  | 'pending' | 'confirmed' | 'dispatched' | 'delivered' | 'cancelled';

export interface OrderItem {
  id:           number;
  product:      number;
  product_name: string;
  product_sku:  string;
  quantity:     number;
  unit_price:   string;
  total_price:  string;
}

export interface SalesOrder {
  id:               number;
  order_number:     string;
  customer:         number;
  customer_name:    string;
  warehouse:        number;
  warehouse_name:   string;
  status:           OrderStatus;
  order_date:       string;
  expected_delivery?: string;
  delivery_address: string;
  total_amount:     string;
  discount_amount:  string;
  tax_amount:       string;
  notes:            string;
  items?:           OrderItem[];
  created_at:       string;
}

// ── Purchase Order ────────────────────────────────────────────────────────
export type POStatus =
  | 'draft' | 'confirmed' | 'partially_received' | 'received' | 'cancelled';

export interface PurchaseOrder {
  id:            number;
  number:        string;
  supplier:      number;
  supplier_name: string;
  warehouse:     number;
  status:        POStatus;
  order_date:    string;
  total_amount:  string;
  notes:         string;
  created_at:    string;
}

// ── Dispatch ─────────────────────────────────────────────────────────────
export type DispatchStatus =
  | 'pending' | 'packed' | 'shipped' | 'delivered' | 'returned';

export interface DispatchNote {
  id:              number;
  dispatch_number: string;
  order:           number;
  order_number:    string;
  customer_name:   string;
  warehouse_name:  string;
  status:          DispatchStatus;
  created_at:      string;
}

// ── Notification ──────────────────────────────────────────────────────────
export type NotificationType =
  | 'low_stock' | 'order_confirmed' | 'order_delivered'
  | 'po_received' | 'transfer_done' | 'invoice_overdue' | 'general';

export interface Notification {
  id:                number;
  notification_type: NotificationType;
  message:           string;
  is_read:           boolean;
  created_at:        string;
}

// ── Stock Transfer ────────────────────────────────────────────────────────
export type TransferStatus =
  | 'pending' | 'approved' | 'in_transit' | 'completed' | 'cancelled';

export interface StockTransfer {
  id:             number;
  reference:      string;
  from_warehouse: number;
  from_name:      string;
  to_warehouse:   number;
  to_name:        string;
  product:        number;
  product_name:   string;
  quantity:       number;
  status:         TransferStatus;
  notes:          string;
  created_at:     string;
}

// ── Navigation ────────────────────────────────────────────────────────────
export type RootStackParamList = {
  Splash:          undefined;
  Onboarding:      undefined;
  Auth:            undefined;
  Main:            undefined;
};

export type AuthStackParamList = {
  Login:           undefined;
  ForgotPassword:  undefined;
};

export type MainTabParamList = {
  Home:            undefined;
  Inventory:       undefined;
  Orders:          undefined;
  Notifications:   undefined;
  More:            undefined;
};

export type MainStackParamList = {
  MainTabs:        undefined;
  ProductDetails:  { productId: number };
  OrderDetail:     { orderId: number };
  Warehouses:      undefined;
  Profile:         undefined;
  Settings:        undefined;
  StockTransfers:  undefined;
  Suppliers:       undefined;
  Customers:       undefined;
};
