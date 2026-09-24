// Converts any API error into a friendly message. Raw server errors are never shown.
export function getErrorMessage(error, fallback = 'Something went wrong. Please try again.') {
  if (error?.code === 'ECONNABORTED') {
    return 'The server is taking too long to respond. Please try again.';
  }
  if (!error?.response) {
    return 'Unable to reach the server. Please check your connection and try again.';
  }
  const { status, data } = error.response;
  if (status >= 500) return fallback;
  return data?.message || fallback;
}

// Maps server validation errors [{field, message}] to { field: message }.
export function getFieldErrors(error) {
  const list = error?.response?.data?.errors;
  if (!Array.isArray(list)) return {};
  return list.reduce((acc, item) => {
    if (item.field && !acc[item.field]) acc[item.field] = item.message;
    return acc;
  }, {});
}