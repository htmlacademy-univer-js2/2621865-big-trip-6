function calculateDuration(dateFrom, dateTo) {
  const start = new Date(dateFrom);
  const end = new Date(dateTo);
  const diff = end - start;
  
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  if (hours === 0) {
    return `${minutes}M`;
  } else if (minutes === 0) {
    return `${hours}H`;
  } else {
    return `${hours}H ${minutes}M`;
  }
}

function formatDate(dateString, format) {
  const date = new Date(dateString);
  
  if (format === 'time') {
    return date.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});
  }
  
  if (format === 'date') {
    return date.toLocaleString('en', {month: 'short', day: 'numeric'}).toUpperCase();
  }
  
  return dateString;
}

export {calculateDuration, formatDate};