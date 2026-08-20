// ── DYUKSA IMS Mobile — Centralized API Service ───────────────────────────
// All API calls go through this file. Screens never call axios directly.
// Architecture: Screen → Hook → Api.ts → Django Backend

import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { tokenStorage } from '../utils/tokenStorage';
import type {
  LoginResponse, RefreshResponse, AuthTokens,
  DashboardData, Product, InventoryBalance, Warehouse,
  SalesOrder, PurchaseOrder, DispatchNote, Notification,
  StockTransfer, Supplier, Customer, Category,
  PaginatedResponse, IMSResponse, User,
} from '../types';

// ── Base URLs — from environment
// In production set these via .env / EAS secrets
const CENTRAL_URL = process.env.EXPO_PUBLIC_CENTRAL_URL || 'http://192.168.1.17:8001';
const IMS_URL = process.env.EXPO_PUBLIC_IMS_URL || 'http://192.168.1.15:8000';

// ── Axios instances 
// centralClient → Dyuksa Central (auth only)
export const centralClient = axios.create({
  baseURL: CENTRAL_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// imsClient → DYUKSA IMS Django backend
export const imsClient = axios.create({
  baseURL: IMS_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// ── Request interceptor: attach Bearer token ──────────────────────────────
imsClient.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const token = await tokenStorage.getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  const wsId = await tokenStorage.getWorkspaceId();
  if (wsId) config.headers['X-Workspace-ID'] = wsId;
  return config;
});

// ── Response interceptor: auto-refresh on 401 ────────────────────────────
let isRefreshing = false;
let pendingQueue: Array<(token: string | null) => void> = [];

function resolveQueue(token: string | null) {
  pendingQueue.forEach((cb) => cb(token));
  pendingQueue = [];
}

imsClient.interceptors.response.use(
  (r) => r,
  async (error: AxiosError) => {
    const orig = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;
    if (error.response?.status === 401 && orig && !orig._retry) {
      const refresh = await tokenStorage.getRefreshToken();
      if (!refresh) { await tokenStorage.clear(); return Promise.reject(error); }
      orig._retry = true;
      if (isRefreshing) {
        return new Promise((res, rej) => {
          pendingQueue.push((t) => t
            ? (orig.headers.Authorization = `Bearer ${t}`, res(imsClient(orig)))
            : rej(error));
        });
      }
      isRefreshing = true;
      try {
        const { data } = await centralClient.post<RefreshResponse>('/api/v1/auth/refresh/', { refresh });
        await tokenStorage.setAccessToken(data.access);
        resolveQueue(data.access);
        orig.headers.Authorization = `Bearer ${data.access}`;
        return imsClient(orig);
      } catch (e) { resolveQueue(null); await tokenStorage.clear(); return Promise.reject(e); }
      finally { isRefreshing = false; }
    }
    return Promise.reject(error);
  }
);

// ═══════════════════════════════════════════════════════════════════════════
// AUTH APIS — Central
// ═══════════════════════════════════════════════════════════════════════════
export const AuthApi = {
  login: async (username: string, password: string): Promise<LoginResponse> => {
    const { data } = await centralClient.post<LoginResponse>('/api/v1/auth/login/', { username, password });
    return data;
  },
  logout: async (refresh: string): Promise<void> => {
    await centralClient.post('/api/v1/auth/logout/', { refresh });
  },
  refresh: async (refresh: string): Promise<RefreshResponse> => {
    const { data } = await centralClient.post<RefreshResponse>('/api/v1/auth/refresh/', { refresh });
    return data;
  },
  forgotPassword: async (email: string): Promise<void> => {
    await centralClient.post('/api/v1/auth/forgot-password/', { email });
  },
  verifyOtp: async (email: string, otp: string): Promise<void> => {
    await centralClient.post('/api/v1/auth/verify-otp/', { email, otp });
  },
  setNewPassword: async (email: string, otp: string, password: string): Promise<void> => {
    await centralClient.post('/api/v1/auth/set-new-password/', { email, otp, password });
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// DASHBOARD API
// ═══════════════════════════════════════════════════════════════════════════
export const DashboardApi = {
  getSummary: async (): Promise<DashboardData> => {
    const { data } = await imsClient.get<IMSResponse<DashboardData>>('/api/v1/reports/dashboard/');
    return data.data;
  },
  getSalesReport: async (params?: { date_from?: string; date_to?: string }) => {
    const { data } = await imsClient.get('/api/v1/reports/sales/', { params });
    return data.data;
  },
  getInventoryReport: async () => {
    const { data } = await imsClient.get('/api/v1/reports/inventory/');
    return data.data;
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// INVENTORY / PRODUCTS API
// ═══════════════════════════════════════════════════════════════════════════
export const InventoryApi = {
  getProducts: async (params?: {
    search?: string; category?: number; warehouse?: number;
    is_active?: boolean; low_stock?: boolean; page?: number;
  }): Promise<PaginatedResponse<Product>> => {
    const { data } = await imsClient.get('/api/v1/products/', { params });
    return data;
  },

  getProduct: async (id: number): Promise<Product> => {
    const { data } = await imsClient.get<IMSResponse<Product>>(`/api/v1/inventory/products/${id}/`);
    return data.data;
  },

  getLowStock: async (): Promise<Product[]> => {
    const { data } = await imsClient.get('/api/v1/products/', {
      params: { low_stock: true, page_size: 5 }
    });
    return data.results ?? data.data ?? [];
  },
  getStockLevels: async (params?: {
    product?: number; warehouse?: number; page?: number;
  }): Promise<PaginatedResponse<InventoryBalance>> => {
    const { data } = await imsClient.get('/api/v1/inventory/', { params });
    return data;
  },

  getValuation: async () => {
    const { data } = await imsClient.get('/api/v1/inventory/products/valuation/');
    return data.data;
  },

  getCategories: async (): Promise<Category[]> => {
    const { data } = await imsClient.get('/api/v1/inventory/categories/');
    return data.results ?? data.data ?? data;
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// WAREHOUSE API
// ═══════════════════════════════════════════════════════════════════════════
export const WarehouseApi = {
  getWarehouses: async (params?: { search?: string; is_active?: boolean }): Promise<Warehouse[]> => {
    const { data } = await imsClient.get('/api/v1/warehouses/', { params });
    return data.data ?? data.results ?? data;
  },

  getWarehouse: async (id: number): Promise<Warehouse> => {
    const { data } = await imsClient.get<IMSResponse<Warehouse>>(`/api/v1/warehouses/${id}/`);
    return data.data;
  },

  getWarehouseInventory: async (id: number): Promise<InventoryBalance[]> => {
    const { data } = await imsClient.get(`/api/v1/warehouses/${id}/inventory/`);
    return data.data ?? data.results ?? data;
  },

  receiveStock: async (warehouseId: number, payload: {
    product_id: number; quantity: number; reference?: string; notes?: string;
  }) => {
    const { data } = await imsClient.post(`/api/v1/warehouses/${warehouseId}/receive-stock/`, payload);
    return data.data;
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// ORDERS API
// ═══════════════════════════════════════════════════════════════════════════
export const OrderApi = {
  getSalesOrders: async (params?: {
    status?: string; search?: string; warehouse?: number;
    date_from?: string; date_to?: string; page?: number;
  }): Promise<PaginatedResponse<SalesOrder>> => {
    const { data } = await imsClient.get('/api/v1/orders/', { params });
    return data;
  },

  getSalesOrder: async (id: number): Promise<SalesOrder> => {
    const { data } = await imsClient.get<IMSResponse<SalesOrder>>(`/api/v1/orders/${id}/`);
    return data.data;
  },

  transitionOrder: async (id: number, status: string, reason?: string) => {
    const { data } = await imsClient.post(`/api/v1/orders/${id}/transition/`, { status, reason });
    return data.data;
  },

  getPurchaseOrders: async (params?: {
    status?: string; supplier?: number; page?: number;
  }): Promise<PaginatedResponse<PurchaseOrder>> => {
    const { data } = await imsClient.get('/api/v1/purchase-orders/', { params });
    return data;
  },

  getPurchaseOrder: async (id: number): Promise<PurchaseOrder> => {
    const { data } = await imsClient.get<IMSResponse<PurchaseOrder>>(`/api/v1/purchase-orders/${id}/`);
    return data.data;
  },

  transitionPO: async (id: number, status: string) => {
    const { data } = await imsClient.post(`/api/v1/purchase-orders/${id}/transition/`, { status });
    return data.data;
  },

  receiveStockPO: async (id: number, items: { item_id: number; received_quantity: number }[]) => {
    const { data } = await imsClient.post(`/api/v1/purchase-orders/${id}/receive/`, { items });
    return data.data;
  },

  getDispatchNotes: async (params?: { status?: string; page?: number }): Promise<PaginatedResponse<DispatchNote>> => {
    const { data } = await imsClient.get('/api/v1/dispatch/', { params });
    return data;
  },

  transitionDispatch: async (id: number, status: string) => {
    const { data } = await imsClient.post(`/api/v1/dispatch/${id}/transition/`, { status });
    return data.data;
  },

  getStockTransfers: async (params?: { status?: string; page?: number }): Promise<PaginatedResponse<StockTransfer>> => {
    const { data } = await imsClient.get('/api/v1/warehouses/transfers/', { params });
    return data;
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// NOTIFICATIONS API
// ═══════════════════════════════════════════════════════════════════════════
export const NotificationApi = {
  getNotifications: async (params?: {
    unread?: boolean; page?: number;
  }): Promise<PaginatedResponse<Notification>> => {
    const { data } = await imsClient.get('/api/v1/notifications/', { params });
    return data;
  },

  getUnreadCount: async (): Promise<number> => {
    try {
      const { data } = await imsClient.get('/api/v1/notifications/', {
        params: { unread: true, page_size: 1 },
      });
      return data.count ?? 0;
    } catch { return 0; }
  },

  markRead: async (ids: number[]): Promise<void> => {
    await imsClient.post('/api/v1/notifications/mark-read/', { ids });
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// SUPPLIER / CUSTOMER API
// ═══════════════════════════════════════════════════════════════════════════
export const SupplierApi = {
  getSuppliers: async (params?: { search?: string }): Promise<PaginatedResponse<Supplier>> => {
    const { data } = await imsClient.get('/api/v1/suppliers/', { params });
    return data;
  },
};

export const CustomerApi = {
  getCustomers: async (params?: { search?: string }): Promise<PaginatedResponse<Customer>> => {
    const { data } = await imsClient.get('/api/v1/orders/customers/', { params });
    return data;
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// USER / SETTINGS API
// ═══════════════════════════════════════════════════════════════════════════
export const UserApi = {
  getMe: async (): Promise<User> => {
    const { data } = await imsClient.get<IMSResponse<User>>('/api/v1/users/me/');
    return data.data;
  },
  getSettings: async () => {
    const { data } = await imsClient.get('/api/v1/settings/');
    return data.data;
  },
};
