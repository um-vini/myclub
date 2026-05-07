/**
 * Formats a full name to a compact version: "Firstname L."
 * Example: "Júlia Emanuelle" -> "Júlia E."
 */
export const formatNameMobile = (name: string): string => {
  if (!name) return '';

  const parts = name.trim().split(/\s+/);

  if (parts.length <= 1) {
    return parts[0];
  }

  const firstName = parts[0];
  const firstLetterOfLastName = parts[1].charAt(0).toUpperCase();

  return `${firstName} ${firstLetterOfLastName}.`;
};
