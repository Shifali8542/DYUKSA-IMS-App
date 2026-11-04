/** Format an amount in the organisation's currency (comes from the backend). */
export function formatMoney(
  value: string | number | null | undefined,
  currency = 'INR',
): string {
  const n = typeof value === 'string' ? parseFloat(value) : value;
  if (n === null || n === undefined || Number.isNaN(n)) return '–';
  try {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency', currency, minimumFractionDigits: 0, maximumFractionDigits: 2,
    }).format(n);
  } catch {
    return `${currency} ${n.toLocaleString()}`;
  }
}