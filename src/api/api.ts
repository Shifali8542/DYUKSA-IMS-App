import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { tokenStorage } from '../utils/tokenStorage';
import type {
  LoginResponse, RefreshResponse, DashboardData, Product, ProductCreatePayload, ProductImage, ProductStockResponse, StockAdjustmentPayload, StockAdjustmentResponse,
  Warehouse, SalesOrder, CreateOrderPayload, PurchaseOrder, Notification, Customer, CustomerCreatePayload, Supplier, Category, Brand, Unit, PaginatedResponse, IMSResponse, User,
} from '../types';

// Base URLs — from environment
const CENTRAL_URL = process.env.EXPO_PUBLIC_CENTRAL_URL || 'http://192.168.1.17:8001';
const IMS_URL = process.env.EXPO_PUBLIC_IMS_URL || 'http://192.168.1.15:8000';

// const CENTRAL_URL = process.env.EXPO_PUBLIC_CENTRAL_URL || 'https://www.dyuksa.com';
// const IMS_URL = process.env.EXPO_PUBLIC_IMS_URL || 'http://172.24.246.68:8000';

// ── Axios instances
export const centralClient = axios.create({
  baseURL: CENTRAL_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

export const imsClient = axios.create({
  baseURL: IMS_URL,
  timeout: 15000,
});

// ── Request interceptor: attach Bearer token 
imsClient.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const token = await tokenStorage.getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  const wsId = await tokenStorage.getWorkspaceId();
  if (wsId) config.headers['X-Workspace-ID'] = wsId;
  const isFormData = config.data instanceof FormData
    || (config.data && config.data.constructor && config.data.constructor.name === 'FormData');
  if (!isFormData) {
    config.headers['Content-Type'] = config.headers['Content-Type'] || 'application/json';
  } else {
    // Let axios/RN set multipart boundary automatically
    delete config.headers['Content-Type'];
  }
  return config;
});

// ── Response interceptor
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
    is_active?: boolean; ordering?: string; page?: number; page_size?: number;
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
// PRODUCT IMAGES — /api/v1/products/:id/images/
// ═══════════════════════════════════════════════════════════════════════════
export const ProductImageApi = {
  getImages: async (productId: number): Promise<ProductImage[]> => {
    const { data } = await imsClient.get(`/api/v1/products/${productId}/images/`);
    return data.data ?? data;
  },

  upload: async (
    productId: number,
    file: { uri: string; name: string; type: string },
    opts?: { alt_text?: string; sort_order?: number; is_primary?: boolean },
  ): Promise<ProductImage> => {
    // Use fetch instead of axios — axios breaks with RN FormData file URIs
    const form = new FormData();
    form.append('image', file as any);
    if (opts?.alt_text) form.append('alt_text', opts.alt_text);
    if (opts?.sort_order != null) form.append('sort_order', String(opts.sort_order));
    if (opts?.is_primary) form.append('is_primary', 'true');

    const token = await tokenStorage.getAccessToken();
    const wsId = await tokenStorage.getWorkspaceId();
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    if (wsId) headers['X-Workspace-ID'] = wsId;

    const response = await fetch(`${IMS_URL}/api/v1/products/${productId}/images/`, {
      method: 'POST',
      headers,
      body: form,
    });

    if (!response.ok) {
      const errBody = await response.json().catch(() => ({}));
      throw { response: { status: response.status, data: errBody }, message: errBody?.error?.message || response.statusText };
    }

    const data = await response.json();
    return data.data ?? data;
  },

  update: async (
    productId: number,
    imageId: number,
    payload: { alt_text?: string; sort_order?: number; is_primary?: boolean },
  ): Promise<ProductImage> => {
    const { data } = await imsClient.patch(
      `/api/v1/products/${productId}/images/${imageId}/`,
      payload,
    );
    return data.data ?? data;
  },

  delete: async (productId: number, imageId: number): Promise<void> => {
    await imsClient.delete(`/api/v1/products/${productId}/images/${imageId}/`);
  },

  reorder: async (productId: number, order: number[]): Promise<void> => {
    await imsClient.post(`/api/v1/products/${productId}/images/reorder/`, { order });
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

  deleteCategory: async (id: number): Promise<void> => {
    await imsClient.delete(`/api/v1/categories/${id}/`);
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

  deleteBrand: async (id: number): Promise<void> => {
    await imsClient.delete(`/api/v1/brands/${id}/`);
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

  deleteUnit: async (id: number): Promise<void> => {
    await imsClient.delete(`/api/v1/units/${id}/`);
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

  createWarehouse: async (payload: { name: string; code: string; address?: string; city?: string; state?: string; pincode?: string; capacity?: number }): Promise<Warehouse> => {
    const { data } = await imsClient.post('/api/v1/warehouses/', payload);
    return data.data ?? data;
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

  getPurchaseOrder: async (id: number): Promise<PurchaseOrder> => {
    const { data } = await imsClient.get(`/api/v1/purchase-orders/${id}/`);
    return data.data ?? data;
  },

  createPurchaseOrder: async (payload: {
    supplier_id: number; warehouse_id: number; order_date: string;
    expected_date?: string; notes?: string;
    items: { product_id: number; quantity: number; unit_price: number; tax_rate: number }[];
  }): Promise<PurchaseOrder> => {
    const { data } = await imsClient.post('/api/v1/purchase-orders/', payload);
    return data.data ?? data;
  },

  transitionPO: async (id: number, status: string, reason?: string): Promise<PurchaseOrder> => {
    const { data } = await imsClient.post(`/api/v1/purchase-orders/${id}/transition/`, { status, reason });
    return data.data ?? data;
  },

  receivePO: async (id: number, items: { item_id: number; received_quantity: number }[]): Promise<PurchaseOrder> => {
    const { data } = await imsClient.post(`/api/v1/purchase-orders/${id}/receive/`, { items });
    return data.data ?? data;
  },

  getSuppliers: async (params?: { search?: string }): Promise<Supplier[]> => {
    const { data } = await imsClient.get('/api/v1/suppliers/', { params });
    return data.results ?? data.data ?? data;
  },

  createSupplier: async (payload: {
    code: string; name: string; contact_name?: string; email?: string;
    phone?: string; tax_number?: string; address?: string; city?: string;
    state?: string; pincode?: string; payment_terms?: string;
  }): Promise<Supplier> => {
    const { data } = await imsClient.post('/api/v1/suppliers/', payload);
    return data.data ?? data;
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