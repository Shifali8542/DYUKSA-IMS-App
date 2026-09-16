import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import { SalesReturnApi, OrderApi } from '../../../api/api';
import type { SalesOrder } from '../../../types';

export interface ReturnLineItem {
    key: string;
    product_id: number;
    product_name: string;
    product_sku: string;
    max_qty: number;
    quantity: string;
    unit_price: string;
    disposition: 'inspection' | 'restock' | 'damaged' | 'scrap';
    selected: boolean;
}

let keyCounter = 0;

function todayStr(): string {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function useSalesReturnForm(orderId: number, customerId: number, warehouseId: number) {
    const [order, setOrder] = useState<SalesOrder | null>(null);
    const [items, setItems] = useState<ReturnLineItem[]>([]);
    const [reason, setReason] = useState('');
    const [notes, setNotes] = useState('');
    const [returnDate, setReturnDate] = useState(todayStr());
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [savedId, setSavedId] = useState<number | null>(null);

    const loadOrder = useCallback(async () => {
        setLoading(true);
        try {
            const o = await OrderApi.getSalesOrder(orderId);
            setOrder(o);
            const lineItems: ReturnLineItem[] = (o.items ?? []).map((item: any) => ({
                key: `ri_${++keyCounter}`,
                product_id: item.product ?? item.product_id,
                product_name: item.product_name ?? item.name ?? '',
                product_sku: item.product_sku ?? item.sku ?? '',
                max_qty: parseFloat(item.quantity),
                quantity: item.quantity,
                unit_price: item.unit_price,
                disposition: 'inspection' as const,
                selected: true,
            }));
            setItems(lineItems);
        } catch (e: any) {
            Alert.alert('Error', 'Failed to load order details.');
        } finally {
            setLoading(false);
        }
    }, [orderId]);

    useEffect(() => { loadOrder(); }, [loadOrder]);

    function toggleItem(key: string) {
        setItems((prev) => prev.map((i) => i.key === key ? { ...i, selected: !i.selected } : i));
    }

    function updateItem(key: string, field: keyof ReturnLineItem, value: any) {
        setItems((prev) => prev.map((i) => i.key === key ? { ...i, [field]: value } : i));
    }

    async function handleSave(): Promise<boolean> {
        const selected = items.filter((i) => i.selected);
        if (selected.length === 0) {
            Alert.alert('Error', 'Select at least one item to return.');
            return false;
        }
        if (!reason.trim()) {
            Alert.alert('Error', 'Please enter a reason for the return.');
            return false;
        }

        for (const item of selected) {
            const qty = parseFloat(item.quantity);
            if (isNaN(qty) || qty <= 0) {
                Alert.alert('Error', `${item.product_name}: quantity must be greater than 0.`);
                return false;
            }
            if (qty > item.max_qty) {
                Alert.alert('Error', `${item.product_name}: quantity cannot exceed ${item.max_qty}.`);
                return false;
            }
        }

        setSaving(true);
        try {
            const sr = await SalesReturnApi.create({
                sales_order_id: orderId,
                customer_id: customerId,
                warehouse_id: warehouseId,
                return_date: returnDate,
                reason,
                notes,
                items: selected.map((i) => ({
                    product_id: i.product_id,
                    quantity: i.quantity,
                    unit_price: i.unit_price,
                    disposition: i.disposition,
                })),
            });
            setSavedId(sr.id);
            return true;
        } catch (e: any) {
            Alert.alert('Error', e?.response?.data?.error?.message ?? 'Failed to create return.');
            return false;
        } finally {
            setSaving(false);
        }
    }

    return { order, items, reason, setReason, notes, setNotes, returnDate, setReturnDate, loading, saving, savedId, toggleItem, updateItem, handleSave };
}