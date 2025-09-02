/**
 * Currency formatting utilities for the Shingari application
 * Uses Euro (€) as the default currency and Spanish locale formatting
 */

export const formatCurrency = (amount: number | null | undefined): string => {
  if (amount === null || amount === undefined) {
    return '€0,00';
  }

  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const formatPercentage = (value: number | null | undefined): string => {
  if (value === null || value === undefined) {
    return '-';
  }

  return `${value.toFixed(2)}%`;
};
