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

// Roles that can see admin features
export const ADMIN_ROLES = ['ims_admin'] as const;

// Roles that can manage inventory operations
export const INVENTORY_ROLES = ['ims_admin', 'warehouse_mgr', 'branch_manager'] as const;

// Roles that can manage orders
export const SALES_ROLES = ['ims_admin', 'sales_executive', 'branch_manager'] as const;

// Roles that can view reports
export const REPORT_ROLES = ['ims_admin', 'branch_manager', 'accountant'] as const;

export const PAGE_SIZE = 20;

export const STORAGE_KEYS = {
  ACCESS_TOKEN:  'dyuksa_access_token',
  REFRESH_TOKEN: 'dyuksa_refresh_token',
  WORKSPACE_ID:  'dyuksa_workspace_id',
  THEME_MODE:    'dyuksa_theme_mode',
  ONBOARDING:    'dyuksa_onboarding_done',
} as const;
