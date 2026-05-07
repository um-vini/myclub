/**
 * Formats a numeric or string value into a Brazilian currency/number format.
 * Ensures consistent display of two decimal places.
 */
export const formatNumber = (value: number | string) => {
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value));
};
