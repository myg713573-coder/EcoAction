const getDefaultApiBaseUrl = () => {
  if (typeof window !== 'undefined') {
    if (process.env.NEXT_PUBLIC_API_BASE_URL) {
      return process.env.NEXT_PUBLIC_API_BASE_URL
    }

    const hostname = window.location.hostname
    if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname.endsWith('.local')) {
      return 'http://localhost:4000'
    }
  }

  return '/api'
}

export const API_BASE_URL = getDefaultApiBaseUrl()
