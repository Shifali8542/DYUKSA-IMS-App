import { useState, useEffect, useMemo } from 'react';
import { tokenStorage } from '../utils/tokenStorage';
import { getImsRole } from '../utils/jwt';
import type { ImsRole } from '../types';

// Normalise legacy role codes
function normaliseRole(role: string | null): ImsRole | null {
  if (!role) return null;
  if (role === 'sales_executive') return 'ims_sales_exec';
  if (role === 'accountant') return 'ims_accountant';
  return role as ImsRole;
}

// Role sets for permission checks — mirrors backend core/permissions.py exactly
const ADMIN = new Set(['ims_admin']);

const MANAGEMENT = new Set([...ADMIN, 'warehouse_mgr', 'branch_manager']);

const CAN_MANAGE_CATALOGUE = new Set([
  ...MANAGEMENT, 'procurement_manager', 'inventory_controller',
]);

const CAN_ADJUST_STOCK = new Set([
  ...MANAGEMENT, 'inventory_controller', 'receiving_staff',
]);

const CAN_MANAGE_ORDERS = new Set([
  ...MANAGEMENT, 'order_manager', 'ims_sales_exec',
]);

const CAN_MANAGE_CUSTOMERS = new Set([
  ...MANAGEMENT, 'order_manager', 'ims_sales_exec', 'ims_customer_support',
]);

const CAN_MANAGE_PURCHASING = new Set([
  ...MANAGEMENT, 'procurement_manager',
]);

const CAN_MANAGE_DISPATCH = new Set([
  ...MANAGEMENT, 'order_manager', 'dispatcher',
]);

const CAN_MANAGE_FINANCE = new Set([
  ...MANAGEMENT, 'order_manager', 'ims_sales_exec', 'ims_billing_exec', 'ims_accountant',
]);

const CAN_VIEW_REPORTS = new Set([
  ...MANAGEMENT, 'inventory_controller', 'ims_accountant', 'ims_billing_exec',
]);

export interface Permissions {
  role: ImsRole | null;
  isAdmin: boolean;
  isManagement: boolean;
  // Catalogue
  canCreateProducts: boolean;
  canEditProducts: boolean;
  canDeleteProducts: boolean;
  // Inventory
  canAdjustStock: boolean;
  canViewInventory: boolean;
  // Orders
  canCreateOrders: boolean;
  canConfirmOrders: boolean;
  canCancelOrders: boolean;
  // Customers
  canCreateCustomers: boolean;
  canEditCustomers: boolean;
  // Purchasing
  canManagePurchasing: boolean;
  // Dispatch
  canManageDispatch: boolean;
  // Finance & Reports
  canManageFinance: boolean;
  canViewReports: boolean;
  // Admin
  canManageUsers: boolean;
  canManageSettings: boolean;
}

export function usePermissions(): Permissions {
  const [role, setRole] = useState<ImsRole | null>(null);

  useEffect(() => {
    tokenStorage.getAccessToken().then((token) => {
      if (token) {
        setRole(normaliseRole(getImsRole(token)));
      }
    }).catch(() => {});
  }, []);

  return useMemo<Permissions>(() => {
    const r = role ?? 'employee';
    return {
      role,
      isAdmin:            ADMIN.has(r),
      isManagement:       MANAGEMENT.has(r),
      // Catalogue
      canCreateProducts:  CAN_MANAGE_CATALOGUE.has(r),
      canEditProducts:    CAN_MANAGE_CATALOGUE.has(r),
      canDeleteProducts:  ADMIN.has(r),
      // Inventory
      canAdjustStock:     CAN_ADJUST_STOCK.has(r),
      canViewInventory:   true, // all roles
      // Orders
      canCreateOrders:    CAN_MANAGE_ORDERS.has(r),
      canConfirmOrders:   CAN_MANAGE_ORDERS.has(r),
      canCancelOrders:    CAN_MANAGE_ORDERS.has(r),
      // Customers
      canCreateCustomers: CAN_MANAGE_CUSTOMERS.has(r),
      canEditCustomers:   CAN_MANAGE_CUSTOMERS.has(r),
      // Purchasing
      canManagePurchasing: CAN_MANAGE_PURCHASING.has(r),
      // Dispatch
      canManageDispatch:  CAN_MANAGE_DISPATCH.has(r),
      // Finance & Reports
      canManageFinance:   CAN_MANAGE_FINANCE.has(r),
      canViewReports:     CAN_VIEW_REPORTS.has(r),
      // Admin
      canManageUsers:     ADMIN.has(r),
      canManageSettings:  ADMIN.has(r),
    };
  }, [role]);
}