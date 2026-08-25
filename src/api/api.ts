import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { tokenStorage } from '../utils/tokenStorage';
import type {
  LoginResponse, RefreshResponse,
  DashboardData, Product, ProductCreatePayload,
  ProductStockResponse, StockAdjustmentPayload, StockAdjustmentResponse,
  Warehouse, SalesOrder, CreateOrderPayload,
  PurchaseOrder, Notification,
  Customer, CustomerCreatePayload,
  Category, Brand, Unit,
  PaginatedResponse, IMSResponse, User,
} from '../types';

// ── Base URLs — from environment
const CENTRAL_URL = process.env.EXPO_PUBLIC_CENTRAL_URL || 'http://192.168.1.17:8001';
const IMS_URL = process.env.EXPO_PUBLIC_IMS_URL || 'http://192.168.1.15:8000';

// ── Axios instances
export const centralClient = axios.create({
  baseURL: CENTRAL_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

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
// AUTH — Central
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
// DASHBOARD — /api/v1/reports/
// ═══════════════════════════════════════════════════════════════════════════
export const DashboardApi = {
  getSummary: async (): Promise<DashboardData> => {
    const { data } = await imsClient.get<IMSResponse<DashboardData>>('/api/v1/reports/dashboard/');
    return data.data;
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// PRODUCT — /api/v1/products/
// ═══════════════════════════════════════════════════════════════════════════
export const ProductApi = {
  getProducts: async (params?: {
    search?: string; category?: number; brand?: number;
    is_active?: boolean; page?: number; page_size?: number;
  }): Promise<PaginatedResponse<Product>> => {
    const { data } = await imsClient.get('/api/v1/products/', { params });
    return data;
  },

  getProduct: async (id: number): Promise<Product> => {
    const { data } = await imsClient.get(`/api/v1/products/${id}/`);
    return data.data ?? data;
  },

  getProductStock: async (id: number): Promise<ProductStockResponse> => {
    const { data } = await imsClient.get(`/api/v1/products/${id}/stock/`);
    return data.data ?? data;
  },

  createProduct: async (payload: ProductCreatePayload): Promise<Product> => {
    const { data } = await imsClient.post('/api/v1/products/', payload);
    return data.data ?? data;
  },

  updateProduct: async (id: number, payload: Partial<ProductCreatePayload>): Promise<Product> => {
    const { data } = await imsClient.patch(`/api/v1/products/${id}/`, payload);
    return data.data ?? data;
  },

  deleteProduct: async (id: number): Promise<void> => {
    await imsClient.delete(`/api/v1/products/${id}/`).catch((e) => {
      if (e?.response?.status === 204) return;
      throw e;
    });
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// INVENTORY — /api/v1/inventory/
// ═══════════════════════════════════════════════════════════════════════════
export const InventoryApi = {
  adjustStock: async (payload: StockAdjustmentPayload): Promise<StockAdjustmentResponse> => {
    const { data } = await imsClient.post('/api/v1/inventory/adjust/', payload);
    return data.data ?? data;
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// CATEGORY — /api/v1/categories/
// ═══════════════════════════════════════════════════════════════════════════
export const CategoryApi = {
  getCategories: async (): Promise<Category[]> => {
    const { data } = await imsClient.get('/api/v1/categories/');
    return data.results ?? data.data ?? data;
  },

  createCategory: async (payload: { name: string; parent?: number }): Promise<Category> => {
    const base = payload.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const slug = `${base}-${Date.now().toString(36)}`;
    const { data } = await imsClient.post('/api/v1/categories/', { ...payload, slug });
    return data.data ?? data;
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// BRAND — /api/v1/brands/
// ═══════════════════════════════════════════════════════════════════════════
export const BrandApi = {
  getBrands: async (): Promise<Brand[]> => {
    const { data } = await imsClient.get('/api/v1/brands/');
    return data.results ?? data.data ?? data;
  },

  createBrand: async (payload: { name: string }): Promise<Brand> => {
    const { data } = await imsClient.post('/api/v1/brands/', payload);
    return data.data ?? data;
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// UNIT — /api/v1/units/
// ═══════════════════════════════════════════════════════════════════════════
export const UnitApi = {
  getUnits: async (): Promise<Unit[]> => {
    const { data } = await imsClient.get('/api/v1/units/');
    return data.results ?? data.data ?? data;
  },

  createUnit: async (payload: { name: string; symbol: string }): Promise<Unit> => {
    const { data } = await imsClient.post('/api/v1/units/', { ...payload, decimal_places: 0 });
    return data.data ?? data;
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// WAREHOUSE — /api/v1/warehouses/
// ═══════════════════════════════════════════════════════════════════════════
export const WarehouseApi = {
  getWarehouses: async (params?: { search?: string; is_active?: boolean }): Promise<Warehouse[]> => {
    const { data } = await imsClient.get('/api/v1/warehouses/', { params });
    return data.data ?? data.results ?? data;
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// ORDERS — /api/v1/orders/
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
    const { data } = await imsClient.get(`/api/v1/orders/${id}/`);
    return data.data ?? data;
  },

  createOrder: async (payload: CreateOrderPayload): Promise<SalesOrder> => {
    const { data } = await imsClient.post('/api/v1/orders/', payload);
    return data.data ?? data;
  },

  confirmOrder: async (id: number): Promise<SalesOrder> => {
    const { data } = await imsClient.post(`/api/v1/orders/${id}/confirm/`);
    return data.data ?? data;
  },

  cancelOrder: async (id: number, reason?: string): Promise<SalesOrder> => {
    const { data } = await imsClient.post(`/api/v1/orders/${id}/cancel/`, { reason });
    return data.data ?? data;
  },

  getPurchaseOrders: async (params?: {
    status?: string; supplier?: number; page?: number;
  }): Promise<PaginatedResponse<PurchaseOrder>> => {
    const { data } = await imsClient.get('/api/v1/purchase-orders/', { params });
    return data;
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// NOTIFICATIONS — /api/v1/notifications/
// ═══════════════════════════════════════════════════════════════════════════
export const NotificationApi = {
  getNotifications: async (params?: {
    status?: string; page?: number;
  }): Promise<PaginatedResponse<Notification>> => {
    const { data } = await imsClient.get('/api/v1/notifications/', { params });
    return data;
  },

  markRead: async (ids?: number[]): Promise<void> => {
    await imsClient.post('/api/v1/notifications/mark-read/', ids?.length ? { ids } : {});
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// CUSTOMER — /api/v1/customers/
// ═══════════════════════════════════════════════════════════════════════════
export const CustomerApi = {
  getCustomers: async (params?: { search?: string }): Promise<PaginatedResponse<Customer>> => {
    const { data } = await imsClient.get('/api/v1/customers/', { params });
    return data;
  },

  getCustomer: async (id: number): Promise<Customer> => {
    const { data } = await imsClient.get(`/api/v1/customers/${id}/`);
    return data.data ?? data;
  },

  createCustomer: async (payload: CustomerCreatePayload): Promise<Customer> => {
    const { data } = await imsClient.post('/api/v1/customers/', payload);
    return data.data ?? data;
  },

  updateCustomer: async (id: number, payload: Partial<CustomerCreatePayload>): Promise<Customer> => {
    const { data } = await imsClient.patch(`/api/v1/customers/${id}/`, payload);
    return data.data ?? data;
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// USER — /api/v1/users/
// ═══════════════════════════════════════════════════════════════════════════
export const UserApi = {
  getMe: async (): Promise<User> => {
    const { data } = await imsClient.get<IMSResponse<User>>('/api/v1/users/me/');
    return data.data;
  },
};