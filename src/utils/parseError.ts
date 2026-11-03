/**
 * Parse backend error response into a user-friendly message.
 * Handles the standard IMS envelope: {success: false, error: {code, message, detail}}
 */
const GENERIC = 'Something went wrong. Please try again.';

/** Plain-language message for problems that are not the user's fault. */
function friendlyByStatus(status: number | undefined): string | null {
  if (status === 401) return 'Your session has expired. Please log in again.';
  if (status === 403) return "You don't have permission to do this.";
  if (status === 404) return "We couldn't find what you were looking for. This feature may not be available yet.";
  if (status === 408) return 'The server is taking too long to respond. Please try again.';
  if (status === 429) return 'Too many attempts. Please wait a moment and try again.';
  if (status !== undefined && status >= 500) return 'Something went wrong on our side. Please try again in a moment.';
  return null;
}

export function parseBackendError(e: any): string {
  // No reply from the server at all (offline, timeout, unreachable)
  if (!e?.response) {
    if (e?.code === 'ECONNABORTED' || /timeout/i.test(e?.message ?? '')) {
      return 'The server is taking too long to respond. Please try again.';
    }
    if (e?.isAxiosError || e?.request) {
      return 'Please check your internet connection and try again.';
    }
    return GENERIC;
  }

  const status: number = e.response.status;
  const data = e.response.data;
  const errorObj = data?.error;

  // Server problems, missing pages, permissions → never show technical text
  const friendly = friendlyByStatus(status);
  if (friendly) return friendly;

  // Field-level validation errors (400 / 409 / 422) are meant for the user
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

  if (errorObj?.message) return errorObj.message;
  if (typeof data?.detail === 'string') return data.detail;
  if (typeof data?.message === 'string') return data.message;

  return GENERIC;
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