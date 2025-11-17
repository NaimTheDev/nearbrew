export const HOURS_IN_DAY = 24;

export const to12HourLabel = (hour: number) => {
  const normalized = ((hour % HOURS_IN_DAY) + HOURS_IN_DAY) % HOURS_IN_DAY;
  const suffix = normalized >= 12 ? 'pm' : 'am';
  const formattedHour = ((normalized + 11) % 12) + 1;
  return `${formattedHour}${suffix}`;
};

export const formatHourRange = (startHour: number, duration: number) => {
  const endHour = startHour + duration;
  return `${to12HourLabel(startHour)}-${to12HourLabel(endHour)}`;
};

