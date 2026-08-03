export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  (process.env.NODE_ENV === 'production' ? 'https://ecoaction-backend.onrender.com' : 'http://localhost:4000')
