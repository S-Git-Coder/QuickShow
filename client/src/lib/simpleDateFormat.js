/**
 * Simple date formatting function to replace the removed dateFormat utility
 * @param {string|Date} dateTime - The date to format
 * @returns {string} - Formatted date string
 */
export const dateFormat = (dateTime, opts = {}) => {
  const date = new Date(dateTime);
  const options = {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: 'Asia/Kolkata', // ensure consistent IST display
    ...opts,
  };
  return new Intl.DateTimeFormat('en-US', options).format(date);
};

export default dateFormat;