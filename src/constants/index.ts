// ── DYUKSA IMS — App Constants ────────────────────────────────────────────
// Centralized: no screen hardcodes these values.
// Status labels match backend model choices exactly.

export const ORDER_STATUS_LABEL: Record<string, string> = {
  draft:      'Draft',
  confirmed:  'Confirmed',
  packed:     'Packed',
  dispatched: 'Dispatched',
  delivered:  'Delivered',
  cancelled:  'Cancelled',
};

export const PO_STATUS_LABEL: Record<string, string> = {
  draft:               'Draft',
  approved:            'Approved',
  sent:                'Sent',
  partially_received:  'Partial',
  received:            'Received',
  cancelled:           'Cancelled',
};

export const DISPATCH_STATUS_LABEL: Record<string, string> = {
  pending:    'Pending',
  approved:   'Approved',
  dispatched: 'Dispatched',
  delivered:  'Delivered',
  returned:   'Returned',
};

export const TRANSFER_STATUS_LABEL: Record<string, string> = {
  draft:     'Draft',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

export const NOTIFICATION_TYPE_LABEL: Record<string, string> = {
  low_stock:       'Low Stock',
  order_confirmed: 'Order Confirmed',
  order_delivered: 'Order Delivered',
  po_received:     'Stock Received',
  transfer_done:   'Transfer Done',
  invoice_overdue: 'Invoice Overdue',
  general:         'General',
};

// ── Role Labels 
export const IMS_ROLE_LABELS: Record<string, string> = {
  ims_admin:            'IMS Admin',
  warehouse_mgr:        'Warehouse Manager',
  branch_manager:       'Branch Manager',
  procurement_manager:  'Procurement Manager',
  inventory_controller: 'Inventory Controller',
  receiving_staff:      'Receiving Staff',
  quality_inspector:    'Quality Inspector',
  picker:               'Picker',
  packer:               'Packer',
  dispatcher:           'Dispatcher',
  fleet_manager:        'Fleet Manager',
  driver:               'Driver',
  ims_sales_exec:       'Sales Executive',
  order_manager:        'Order Manager',
  ims_customer_support: 'Customer Support',
  ims_billing_exec:     'Billing Executive',
  ims_accountant:       'Accountant',
  employee:             'Employee',
  // Legacy codes 
  sales_executive:      'Sales Executive',
  accountant:           'Accountant',
};

export function getRoleLabel(roleCode: string): string {
  return IMS_ROLE_LABELS[roleCode] ?? roleCode;
}

export const PAGE_SIZE = 20;

export const STORAGE_KEYS = {
  ACCESS_TOKEN:  'dyuksa_access_token',
  REFRESH_TOKEN: 'dyuksa_refresh_token',
  WORKSPACE_ID:  'dyuksa_workspace_id',
  THEME_MODE:    'dyuksa_theme_mode',
  ONBOARDING:    'dyuksa_onboarding_done',
} as const;