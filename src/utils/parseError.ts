/**
 * Parse backend error response into a user-friendly message.
 * Handles the standard IMS envelope: {success: false, error: {code, message, detail}}
 */
export function parseBackendError(e: any): string {
  const data = e?.response?.data;
  const errorObj = data?.error;

  // Field-level validation errors from DRF
  const detail = errorObj?.detail;
  if (detail && typeof detail === 'object' && !Array.isArray(detail)) {
    const fields = Object.entries(detail)
      .map(([key, val]) => {
        const msg = Array.isArray(val) ? val[0] : String(val);
        return `${key}: ${msg}`;
      })
      .join('\n');
    if (fields) return fields;
  }

  // Standard error message from envelope
  if (errorObj?.message) return errorObj.message;

  // Fallback: DRF default format
  if (data?.detail) return String(data.detail);
  if (data?.message) return String(data.message);

  // Axios error
  if (e?.message) return e.message;

  return 'An unexpected error occurred.';
}

/**
 * Extract field-level errors from backend response.
 * Returns a Record<string, string> for form field errors.
 */
export function parseFieldErrors(e: any, validFields: string[]): Record<string, string> {
  const detail = e?.response?.data?.error?.detail;
  if (!detail || typeof detail !== 'object' || Array.isArray(detail)) return {};

  const errors: Record<string, string> = {};
  for (const key of Object.keys(detail)) {
    if (validFields.includes(key)) {
      const val = detail[key];
      errors[key] = Array.isArray(val) ? val[0] : String(val);
    }
  }
  return errors;
}