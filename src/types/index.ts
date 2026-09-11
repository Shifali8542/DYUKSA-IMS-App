// ── Auth 
export type ImsRole =
  | 'ims_admin'
  | 'warehouse_mgr'
  | 'branch_manager'
  | 'procurement_manager'
  | 'inventory_controller'
  | 'receiving_staff'
  | 'quality_inspector'
  | 'picker'
  | 'packer'
  | 'dispatcher'
  | 'fleet_manager'
  | 'driver'
  | 'ims_sales_exec'
  | 'order_manager'
  | 'ims_customer_support'
  | 'ims_billing_exec'
  | 'ims_accountant'
  | 'employee';

export interface JwtPayload {
  user_id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  org_id: number;
  org_name: string;
  org_slug: string;
  platform_roles: { ims?: ImsRole | string;[key: string]: any };
}

export interface LoginResponse {
  access: string;
  refresh: string;
}

export interface RefreshResponse {
  access: string;
}

// ── API Response wrappers 
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

// ── User / Profile 
export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  ims_role: ImsRole | string;
  is_active: boolean;
}

// ── Dashboard 
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
  warehouses?: {
    id: number;
    name: string;
    code: string;
    capacity: number;
    items_on_hand: number;
    capacity_percent: number;
  }[];
}

// ── Product 
// ── Product Image 
export interface ProductImage {
  id: number;
  product: number;
  image: string;
  image_url: string;
  alt_text: string;
  sort_order: number;
  is_primary: boolean;
  file_size: number;
  width: number | null;
  height: number | null;
  created_at: string;
}

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
  hsn_code?: string;
  image?: string | null;
  weight?: string | null;
  weight_unit?: string;
  length?: string | null;
  width?: string | null;
  height?: string | null;
  preferred_vendor?: number | null;
  preferred_vendor_name?: string | null;
  is_active: boolean;
  organisation?: number;
  available_stock?: string;
  images?: ProductImage[];
  primary_image_url?: string | null;
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
  hsn_code?: string;
  weight?: string;
  weight_unit?: string;
  length?: string;
  width?: string;
  height?: string;
  preferred_vendor?: number | null;
  is_active?: boolean;
  description?: string;
  barcode?: string;
}

// ── Brand / Unit 
export interface Brand {
  id: number;
  name: string;
  is_active: boolean;
}

export interface Unit {
  id: number;
  name: string;
  symbol: string;
  is_active: boolean;
}

// ── Inventory 
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

// ── Warehouse / Category 
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

export interface Category {
  id: number;
  name: string;
  slug?: string;
  parent?: number | null;
  is_active: boolean;
}

// ── Supplier / Customer 
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

// ── Sales Order 
export interface SalesOrder {
  id: number;
  order_number: string;
  invoice_id: number | null;
  invoice_number: string | null;
  dispatch_note_id: number | null;
  dispatch_number: string | null;
  customer: number;
  customer_name?: string;
  customer_code?: string;
  warehouse: number;
  warehouse_name?: string;
  warehouse_code?: string;
  status: string;
  status_display?: string;
  order_date: string;
  expected_delivery?: string;
  delivery_address: string;
  discount_amount: string;
  tax_amount: string;
  notes: string;
  items?: {
    id: number;
    product: number;
    product_name?: string;
    product_sku?: string;
    quantity: string;
    unit_price: string;
    discount: string;
    tax_rate: string;
    line_subtotal?: string;
    line_total?: string;
  }[];
  subtotal?: string;
  total?: string;
  cancelled_reason?: string;
  created_at: string;
  updated_at?: string;
  created_by_name?: string;
}

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

// ── Purchase Order 
export interface PurchaseOrder {
  id: number;
  number: string;
  supplier: number;
  supplier_name?: string;
  warehouse: number;
  warehouse_name?: string;
  status: string;
  order_date: string;
  expected_date?: string;
  subtotal: string;
  tax_total: string;
  total: string;
  notes: string;
  created_at: string;
}

// ── Dispatch 
export type DispatchStatus = 'pending' | 'approved' | 'dispatched' | 'delivered' | 'returned';

export interface DispatchItem {
  id: number;
  product: number;
  product_name: string;
  product_sku: string;
  order_item: number | null;
  quantity: string;
}

export interface DispatchNote {
  id: number;
  organisation: number;
  order: number;
  order_number: string;
  customer_name: string;
  dispatch_number: string;
  warehouse: number;
  warehouse_name: string;
  status: DispatchStatus;
  status_display: string;
  dispatched_at: string | null;
  delivered_at: string | null;
  carrier: string;
  tracking_number: string;
  delivery_address: string;
  approved_by: number | null;
  approved_at: string | null;
  notes: string;
  items: DispatchItem[];
  shiprocket_order_id: number | null;
  shiprocket_shipment_id: number | null;
  awb_code: string;
  courier_name: string;
  created_at: string;
  updated_at: string;
  created_by: number | null;
  created_by_name: string;
}

// ── Notification 
export interface Notification {
  id: number;
  notification_type: string;
  subject: string;
  message: string;
  status: 'pending' | 'sent' | 'failed' | 'read';
  read_at?: string | null;
  entity_type?: string;
  entity_id?: string;
  created_at: string;
}

// ── Navigation 
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
  ProductForm: { productId?: number; barcode?: string };
  OrderDetail: { orderId: number };
  OrderForm: undefined;
  Warehouses: undefined;
  Profile: undefined;
  Settings: undefined;
  Customers: undefined;
  CustomerForm: { customerId?: number };
  Scanner: undefined;
  POForm: undefined;
  PODetail: { poId: number };
  Suppliers: undefined;
  BulkImport: undefined;
  Invoices: undefined;
  InvoiceDetail: { invoiceId: number };
  InvoicePreview: { invoiceId: number };
  InvoiceSettingsScreen: undefined;
  InvoiceForm: undefined;
  Dispatches: undefined;
  DispatchDetail: { dispatchId: number };
};
// ── Invoices 
export type InvoiceStatus = 'draft' | 'finalized' | 'partially_paid' | 'paid' | 'overdue' | 'cancelled';

export interface InvoiceItem {
  id: number;
  product: number;
  product_name: string;
  product_sku: string;
  description: string;
  quantity: string;
  unit_price: string;
  discount: string;
  tax_rate: string;
  line_total: string;
}

export interface InvoicePayment {
  id: number;
  number: string;
  invoice: number;
  invoice_number: string;
  payment_date: string;
  amount: string;
  method: string;
  method_display: string;
  transaction_reference: string;
  notes: string;
  created_at: string;
}

export interface InvoiceCreditNote {
  id: number;
  number: string;
  invoice: number;
  invoice_number: string;
  issue_date: string;
  amount: string;
  reason: string;
  created_at: string;
}

export interface Invoice {
  id: number;
  organisation: number;
  number: string;
  sales_order: number | null;
  sales_order_number: string | null;
  customer: number;
  customer_name: string;
  status: InvoiceStatus;
  status_display: string;
  invoice_date: string;
  due_date: string;
  subtotal: string;
  discount_total: string;
  tax_total: string;
  other_charges: string;
  total: string;
  paid_amount: string;
  balance_due: string;
  notes: string;
  items: InvoiceItem[];
  payments: InvoicePayment[];
  credit_notes: InvoiceCreditNote[];
  created_at: string;
  updated_at: string;
}

export interface InvoiceSettings {
  organisation: number;
  company_name: string;
  display_name: string;
  logo_url: string;
  tagline: string;
  address_line1: string;
  address_line2: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  phone: string;
  email: string;
  website: string;
  gstin: string;
  pan: string;
  cin: string;
  bank_name: string;
  bank_account_number: string;
  bank_ifsc: string;
  bank_branch: string;
  terms_and_conditions: string;
  payment_instructions: string;
  default_due_days: number;
  invoice_prefix: string;
  invoice_footer_note: string;
  full_address: string;
}