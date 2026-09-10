import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import { InvoiceSettingsApi } from '../../../api/api';
import type { InvoiceSettings } from '../../../types';

const EMPTY_SETTINGS: Partial<InvoiceSettings> = {
  company_name: '', logo_url: '', tagline: '',
  address_line1: '', address_line2: '', city: '', state: '', pincode: '', country: 'India',
  phone: '', email: '', website: '',
  gstin: '', pan: '', cin: '',
  bank_name: '', bank_account_number: '', bank_ifsc: '', bank_branch: '',
  terms_and_conditions: '', payment_instructions: '',
  default_due_days: 30, invoice_prefix: '', invoice_footer_note: '',
};

export function useInvoiceSettings() {
  const [form, setForm]       = useState<Partial<InvoiceSettings>>(EMPTY_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState<string | null>(null);

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await InvoiceSettingsApi.getSettings();
      setForm({ ...EMPTY_SETTINGS, ...data });
    } catch (e: any) {
      setError(e?.message ?? 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchSettings(); }, [fetchSettings]);

  function setField(key: keyof InvoiceSettings, value: any) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function save(): Promise<boolean> {
    setSaving(true);
    try {
      const updated = await InvoiceSettingsApi.updateSettings(form);
      setForm({ ...EMPTY_SETTINGS, ...updated });
      Alert.alert('Saved', 'Invoice settings updated successfully.');
      return true;
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'Failed to save settings.');
      return false;
    } finally {
      setSaving(false);
    }
  }

  return { form, setField, loading, saving, error, save };
}