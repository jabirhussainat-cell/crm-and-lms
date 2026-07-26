/** Keep only digits, then last 10 (handles +91XXXXXXXXXX). */
export function normalizePhone(phone: string): string {
  const digits = String(phone || '').replace(/\D/g, '');
  if (digits.length >= 10) return digits.slice(-10);
  return digits;
}

export function isValidTenDigitPhone(phone: string): boolean {
  return /^\d{10}$/.test(normalizePhone(phone));
}

/** UI helper: allow only digit input, max 10 */
export function digitsOnlyTen(value: string): string {
  return value.replace(/\D/g, '').slice(0, 10);
}
