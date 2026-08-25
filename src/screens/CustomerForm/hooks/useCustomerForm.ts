import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import { CustomerApi } from '../../../api/api';
import type { CustomerCreatePayload } from '../../../types';

interface FormFields {
  code:       string;
  name:       string;
  email:      string;
  phone:      string;
  tax_number: string;
  address:    string;
  city:       string;
}

const EMPTY_FORM: FormFields = {
  code: '', name: '', email: '', phone: '', tax_number: '', address: '', city: '',
};

type FormErrors = Partial<Record<keyof FormFields, string>>;

export function useCustomerForm(customerId?: number) {
  const isEdit = !!customerId;

  const [form,    setForm]    = useState<FormFields>(EMPTY_FORM);
  const [errors,  setErrors]  = useState<FormErrors>({});
  const [loading, setLoading] = useState(!!customerId);
  const [saving,  setSaving]  = useState(false);
  const [saved,   setSaved]   = useState(false);

  // Load existing customer in edit mode
  const loadCustomer = useCallback(async () => {
    if (!customerId) return;
    setLoading(true);
    try {
      const c = await CustomerApi.getCustomer(customerId);
      setForm({
        code:       c.code,
        name:       c.name,
        email:      c.email ?? '',
        phone:      c.phone ?? '',
        tax_number: c.tax_number ?? '',
        address:    c.address ?? '',
        city:       c.city ?? '',
      });
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'Failed to load customer');
    } finally {
      setLoading(false);
    }
  }, [customerId]);

  useEffect(() => { loadCustomer(); }, [loadCustomer]);

  function setField<K extends keyof FormFields>(key: K, value: FormFields[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function validate(): boolean {
    const e: FormErrors = {};
    if (!form.code.trim()) e.code = 'Customer code is required';
    if (!form.name.trim()) e.name = 'Customer name is required';
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = 'Enter a valid email';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSave(): Promise<boolean> {
    if (!validate()) return false;

    setSaving(true);
    try {
      const payload: CustomerCreatePayload & { code: string } = {
        code:       form.code.trim().toUpperCase(),
        name:       form.name.trim(),
        email:      form.email.trim() || undefined,
        phone:      form.phone.trim() || undefined,
        tax_number: form.tax_number.trim() || undefined,
        address:    form.address.trim() || undefined,
        city:       form.city.trim() || undefined,
      };

      if (isEdit && customerId) {
        await CustomerApi.updateCustomer(customerId, payload);
      } else {
        await CustomerApi.createCustomer(payload as any);
      }

      setSaved(true);
      return true;
    } catch (e: any) {
      // Handle DRF field-level errors
      const fieldErrors = e?.response?.data;
      if (fieldErrors && typeof fieldErrors === 'object') {
        const fe: FormErrors = {};
        for (const key of Object.keys(fieldErrors)) {
          if (key in EMPTY_FORM) {
            const val = fieldErrors[key];
            fe[key as keyof FormFields] = Array.isArray(val) ? val[0] : String(val);
          }
        }
        if (Object.keys(fe).length > 0) {
          setErrors(fe);
          return false;
        }
      }

      Alert.alert('Error', e?.response?.data?.message ?? e?.message ?? 'Failed to save customer');
      return false;
    } finally {
      setSaving(false);
    }
  }

  return {
    form, setField, errors,
    loading, saving, saved,
    isEdit, handleSave,
  };
}