export const handleError = (error) => {
  console.error('API Error:', error);
  if (error.response?.data?.message) {
    throw new Error(error.response.data.message);
  }
  throw new Error(error.message || 'An error occurred');
};