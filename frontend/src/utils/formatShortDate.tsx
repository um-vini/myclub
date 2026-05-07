/**
 * Formats a date object or string into a short Brazilian date format (DD/MM).
 * Useful for timeline logs and compact table cells.
 */
export const formatShortDate = (date: Date | string) => {
  if (!date) return '';

  return new Date(date).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
  });
};
