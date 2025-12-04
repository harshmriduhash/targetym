/**
 * Format date to French locale
 * @param date - Date string or Date object
 * @param options - Intl.DateTimeFormatOptions
 * @returns Formatted date string
 */
export function formatDate(
  date: string | Date,
  options: Intl.DateTimeFormatOptions = { month: 'short', year: 'numeric' }
): string {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) {
      return 'Date invalide';
    }
    return dateObj.toLocaleDateString('fr-FR', options);
  } catch (error) {
    return 'Date invalide';
  }
}

/**
 * Format join date with "Depuis" prefix
 * @param date - Date string or Date object
 * @returns Formatted string like "Depuis jan. 2024"
 */
export function formatJoinDate(date: string | Date): string {
  return `Depuis ${formatDate(date)}`;
}

/**
 * Calculate time difference in days
 * @param startDate - Start date
 * @param endDate - End date (defaults to now)
 * @returns Number of days
 */
export function getDaysDifference(
  startDate: string | Date,
  endDate: string | Date = new Date()
): number {
  const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
  const end = typeof endDate === 'string' ? new Date(endDate) : endDate;
  const diffTime = Math.abs(end.getTime() - start.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}
