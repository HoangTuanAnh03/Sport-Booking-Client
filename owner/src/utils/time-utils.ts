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

export const generateTimeLine = (
  openTime: string,
  closeTime: string,
  step: number
): { time: string }[] => {
  const times: { time: string }[] = [];
  const openTimeObj = parseTime(openTime);
  const closeTimeObj = parseTime(closeTime);

  let h = openTimeObj.hour;
  let m = openTimeObj.minute;
  const endH = closeTimeObj.hour;
  const endM = closeTimeObj.minute;

  while (h < endH || (h === endH && m <= endM)) {
    const timeStr = `${h.toString().padStart(2, "0")}:${m
      .toString()
      .padStart(2, "0")}`;
    times.push({ time: timeStr });
    m += step;
    if (m >= 60) {
      h += 1;
      m = m % 60;
    }
  }
  return times;
};

export const parseTime = (
  timeStr: string | { hour?: number; minute?: number }
) => {
  if (
    typeof timeStr === "object" &&
    timeStr !== null &&
    "hour" in timeStr &&
    "minute" in timeStr
  ) {
    return { hour: timeStr.hour || 0, minute: timeStr.minute || 0 };
  }
  const [hour, minute] = (typeof timeStr === "string" ? timeStr : "")
    .split(":")
    .map(Number);
  return { hour: hour || 0, minute: minute || 0 };
};

export const formatTime = (timeObj: any): string => {
  if (typeof timeObj === "string") return timeObj;
  if (typeof timeObj === "object" && timeObj !== null) {
    const hour = (timeObj.hour || 0).toString().padStart(2, "0");
    const minute = (timeObj.minute || 0).toString().padStart(2, "0");
    return `${hour}:${minute}`;
  }
  return "00:00";
};

export const toMinutes = (str: string): number => {
  const [h, m] = str.split(":").map(Number);
  return h * 60 + m;
};
