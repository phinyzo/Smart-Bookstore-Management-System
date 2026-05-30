/**
 * Format a number as KES currency
 * Examples:
 *   formatKES(2000)   → "KES 2,000"
 *   formatKES(25000)  → "KES 25,000"
 *   formatKES(1500.5) → "KES 1,501"
 */
export const formatKES = (amount) => {
  const rounded = Math.round(Number(amount))
  return `KES ${rounded.toLocaleString("en-KE")}`
}

/**
 * Format as plain number with commas (no currency prefix)
 * Examples:
 *   formatNumber(25000) → "25,000"
 */
export const formatNumber = (amount) =>
  Math.round(Number(amount)).toLocaleString("en-KE")
