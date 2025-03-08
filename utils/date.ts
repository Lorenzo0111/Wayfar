export function formatDate(
  dateString: string | null,
  fallback: string = "N/A",
): string {
  if (!dateString) return fallback;

  try {
    const date = new Date(dateString);

    if (isNaN(date.getTime())) return fallback;

    return date.toLocaleDateString();
  } catch (error) {
    console.error("Error formatting date:", error);
    return fallback;
  }
}

export function getDurationDays(
  startDate: string | null,
  endDate: string | null,
): number | null {
  if (!startDate || !endDate) return null;

  try {
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) return null;

    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
  } catch (error) {
    console.error("Error calculating duration:", error);
    return null;
  }
}
