/** API origin without /api suffix — for uploaded file URLs */
export const API_ORIGIN = (
  import.meta.env.VITE_API_URL || '/api'
).replace(/\/api\/?$/, '');

export const assetUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return `${API_ORIGIN}${path.startsWith('/') ? path : `/${path}`}`;
};
