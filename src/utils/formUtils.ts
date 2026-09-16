/** Returns today as YYYY-MM-DD. Replaces the 4 duplicate todayStr() functions. */
export function todayStr(): string {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** Returns a date N days from now as YYYY-MM-DD. */
export function futureDateStr(days: number): string {
    const d = new Date(Date.now() + days * 86400000);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** Shared line-item key generator — safe across all form hooks. */
let _lineItemCounter = 0;
export function nextLineKey(prefix = 'item'): string {
    return `${prefix}_${++_lineItemCounter}`;
}

/** Shared return line item shape — used by both SalesReturnForm and PurchaseReturnForm. */
export interface ReturnLineItem {
    key: string;
    product_id: number;
    product_name: string;
    product_sku: string;
    max_qty: number;
    quantity: string;
    unit_price: string;
    selected: boolean;
}

/** Shared return status filter — used by both SalesReturns and PurchaseReturns. */
export type ReturnFilter = 'all' | 'draft' | 'approved' | 'completed' | 'cancelled';
export const RETURN_FILTERS: ReturnFilter[] = ['all', 'draft', 'approved', 'completed', 'cancelled'];