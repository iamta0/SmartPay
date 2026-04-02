// src/utils/currency.ts
import type { Currency } from '@/types';

const CURRENCY_LOCALES: Record<Currency, string> = {
  NGN: 'en-NG',
  USD: 'en-US',
  GBP: 'en-GB',
  EUR: 'de-DE',
};

/**
 * Format an amount stored in smallest unit (kobo/cents) to display string.
 * e.g. formatAmount(150000, 'NGN') → '₦1,500.00'
 */
export function formatAmount(amountInSmallestUnit: number, currency: Currency): string {
  const value = amountInSmallestUnit / 100;
  return new Intl.NumberFormat(CURRENCY_LOCALES[currency], {
    style:                 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(value);
}

/** Convert display value (e.g. 500) → smallest unit (50000 kobo) */
export function toSmallestUnit(amount: number): number {
  return Math.round(amount * 100);
}

/** Convert smallest unit → display value */
export function fromSmallestUnit(amount: number): number {
  return amount / 100;
}
