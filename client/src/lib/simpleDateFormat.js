/**
 * Simple date formatting function to replace the removed dateFormat utility
 * @param {string|Date} dateTime - The date to format
 * @returns {string} - Formatted date string
 */
export const dateFormat = (dateTime) => {
  const date = new Date(dateTime);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short', 
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
};

export default dateFormat;