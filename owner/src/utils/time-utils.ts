/**
 * Format time string to HH:mm format
 * @param timeString - Time string in format "HH:mm:ss" or "HH:mm"
 * @returns Formatted time string in "HH:mm" format
 */
export const formatTimeToHHmm = (timeString: string) => {
  // Assuming timeString is in format "HH:mm:ss" or "HH:mm"
  const [hours, minutes] = timeString.split(":");
  return `${hours}:${minutes}`;
};
