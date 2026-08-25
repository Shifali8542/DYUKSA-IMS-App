// ── DYUKSA IMS Mobile — Centralized Type System ───────────────────────────
// Mirrors the Django backend response schemas exactly.
// Every type here corresponds to a backend serializer.

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
  user_id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  org_id: number;
  org_name: string;
  org_slug: string;
  platform_roles: PlatformRoles;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface LoginResponse extends AuthTokens { }

export interface RefreshResponse {
  access: string;
}

// ── API Response wrappers ─────────────────────────────────────────────────
export interface IMSResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// ── User / Profile ────────────────────────────────────────────────────────
export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  ims_role: ImsRole | string;
  is_active: boolean;
}

// ── Dashboard ─────────────────────────────────────────────────────────────
export interface DashboardWarehouse {
  id: number;
  name: string;
  code: string;
  capacity: number;
  items_on_hand: number;
  capacity_percent: number;
}

export interface DashboardData {
  total_products: number;
  total_warehouses: number;
  low_stock_count: number;
  pending_orders: number;
  pending_dispatches: number;
  today_dispatches: number;
  revenue_30_days?: string;
  orders_30_days?: number;
  purchase_orders?: {
    total: number;
    draft: number;
    approved: number;
    received: number;
    cancelled: number;
  };
  warehouses?: DashboardWarehouse[];
}

// ── Product — matches backend ProductSerializer ───────────────────────────
export interface Product {
  id: number;
  name: string;
  sku: string;
  barcode?: string | null;
  description?: string;
  category: number | null;
  category_name?: string | null;
  brand?: number | null;
  brand_name?: string | null;
  unit: number;
  unit_symbol?: string;
  cost_price: string;
  selling_price: string;
  tax_rate?: string;
  reorder_level: string;
  is_active: boolean;
  organisation?: number;
  available_stock?: string;
  created_at: string;
  updated_at: string;
}

export interface ProductCreatePayload {
  name: string;
  sku: string;
  category: number;
  brand?: number | null;
  unit: number;
  cost_price: string;
  selling_price: string;
  reorder_level: string;
  tax_rate?: string;
  is_active?: boolean;
  description?: string;
  barcode?: string;
}

// ── Brand — matches backend BrandSerializer ───────────────────────────────
export interface Brand {
  id: number;
  name: string;
  is_active: boolean;
}

// ── Unit — matches backend UnitSerializer ─────────────────────────────────
export interface Unit {
  id: number;
  name: string;
  symbol: string;
  is_active: boolean;
}

// ── Inventory — matches backend InventoryBalanceSerializer ────────────────
export interface InventoryBalance {
  id: number;
  product: number;
  product_name?: string;
  product_sku?: string;
  warehouse: number;
  warehouse_name?: string;
  warehouse_code?: string;
  on_hand: string;
  reserved: string;
  in_transit: string;
  damaged: string;
  available: string;
  reorder_level?: string;
  is_low_stock?: boolean;
  cost_price?: string;
  stock_value?: string;
  updated_at: string;
}

// ── Product Stock Response — matches backend ProductViewSet.stock action ──
export interface ProductStockResponse {
  product_id: number;
  sku: string;
  name: string;
  reorder_level: string;
  total_on_hand: string;
  total_available: string;
  warehouses: {
    warehouse_id: number;
    warehouse_name: string;
    warehouse_code: string;
    on_hand: string;
    reserved: string;
    in_transit: string;
    damaged: string;
    available: string;
    is_low_stock: boolean;
  }[];
}

// ── Stock Adjustment — matches backend StockAdjustmentView ────────────────
export interface StockAdjustmentPayload {
  product_id: number;
  warehouse_id: number;
  adjustment_type: 'in' | 'out';
  quantity: string;
  reason: string;
}

export interface StockAdjustmentResponse {
  product_id: number;
  sku: string;
  product_name: string;
  warehouse_id: number;
  warehouse_name: string;
  adjustment_type: string;
  quantity_adjusted: string;
  on_hand_after: string;
  available_after: string;
}

// ── Warehouse — matches backend WarehouseSerializer ───────────────────────
export interface Warehouse {
  id: number;
  name: string;
  code: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  capacity: number;
  is_active: boolean;
  manager?: number | null;
}

// ── Category — matches backend CategorySerializer ─────────────────────────
export interface Category {
  id: number;
  name: string;
  slug?: string;
  parent?: number | null;
  is_active: boolean;
}

// ── Supplier — matches backend SupplierSerializer ─────────────────────────
export interface Supplier {
  id: number;
  code: string;
  name: string;
  contact_name: string;
  email: string;
  phone: string;
  tax_number?: string;
  address: string;
  city?: string;
  state?: string;
  pincode?: string;
  payment_terms?: string;
  is_active: boolean;
}

// ── Customer — matches backend CustomerSerializer ─────────────────────────
export interface Customer {
  id: number;
  code: string;
  name: string;
  email: string;
  phone: string;
  tax_number?: string;
  address: string;
  city?: string;
  is_active: boolean;
}

export interface CustomerCreatePayload {
  name: string;
  email?: string;
  phone?: string;
  tax_number?: string;
  address?: string;
  city?: string;
}

// ── Sales Order — matches backend SalesOrderSerializer ────────────────────
export type OrderStatus =
  | 'draft' | 'confirmed' | 'packed' | 'dispatched' | 'delivered' | 'cancelled';

export interface OrderItem {
  id: number;
  product: number;
  product_name?: string;
  product_sku?: string;
  quantity: string;
  unit_price: string;
  discount: string;
  tax_rate: string;
  line_subtotal?: string;
  line_discount?: string;
  line_tax?: string;
  line_total?: string;
}

export interface SalesOrder {
  id: number;
  order_number: string;
  customer: number;
  customer_name?: string;
  customer_code?: string;
  warehouse: number;
  warehouse_name?: string;
  warehouse_code?: string;
  status: OrderStatus;
  status_display?: string;
  order_date: string;
  expected_delivery?: string;
  delivery_address: string;
  discount_amount: string;
  tax_amount: string;
  notes: string;
  items?: OrderItem[];
  subtotal?: string;
  total?: string;
  approved_by?: number | null;
  approved_by_name?: string | null;
  approved_at?: string | null;
  cancelled_reason?: string;
  created_at: string;
  updated_at?: string;
  created_by?: number;
  created_by_name?: string;
}

// ── Create Order — matches backend CreateOrderSerializer ──────────────────
export interface CreateOrderItemPayload {
  product_id: number;
  quantity: string;
  unit_price: string;
  discount?: string;
  tax_rate?: string;
}

export interface CreateOrderPayload {
  customer_id: number;
  warehouse_id: number;
  order_date: string;
  expected_delivery?: string;
  delivery_address?: string;
  notes?: string;
  discount_amount?: string;
  tax_amount?: string;
  items: CreateOrderItemPayload[];
}

// ── Purchase Order — matches backend PurchaseOrderSerializer ──────────────
export type POStatus =
  | 'draft' | 'approved' | 'sent' | 'partially_received' | 'received' | 'cancelled';

export interface PurchaseOrder {
  id: number;
  number: string;
  supplier: number;
  supplier_name?: string;
  warehouse: number;
  warehouse_name?: string;
  status: POStatus;
  order_date: string;
  expected_date?: string;
  subtotal: string;
  tax_total: string;
  total: string;
  notes: string;
  created_at: string;
}

// ── Dispatch — matches backend DispatchNoteSerializer ─────────────────────
export type DispatchStatus =
  | 'pending' | 'approved' | 'dispatched' | 'delivered' | 'returned';

export interface DispatchNote {
  id: number;
  dispatch_number: string;
  order: number;
  order_number?: string;
  customer_name?: string;
  warehouse_name?: string;
  status: DispatchStatus;
  carrier?: string;
  tracking_number?: string;
  created_at: string;
}

// ── Notification — matches backend NotificationSerializer ─────────────────
export type NotificationType =
  | 'low_stock' | 'order_confirmed' | 'order_delivered'
  | 'po_received' | 'transfer_done' | 'invoice_overdue' | 'general';

export interface Notification {
  id: number;
  notification_type: NotificationType;
  subject: string;
  message: string;
  status: 'pending' | 'sent' | 'failed' | 'read';
  read_at?: string | null;
  entity_type?: string;
  entity_id?: string;
  created_at: string;
}

// ── Navigation ────────────────────────────────────────────────────────────
export type RootStackParamList = {
  Onboarding: undefined;
  Auth: undefined;
  Main: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  ForgotPassword: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Inventory: undefined;
  Orders: undefined;
  Alerts: undefined;
  More: undefined;
};

export type MainStackParamList = {
  MainTabs: undefined;
  ProductDetails: { productId: number };
  ProductForm: { productId?: number };
  OrderDetail: { orderId: number };
  OrderForm: undefined;
  Warehouses: undefined;
  Profile: undefined;
  Settings: undefined;
  Customers: undefined;
  CustomerForm: { customerId?: number };
};