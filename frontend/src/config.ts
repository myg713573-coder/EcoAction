const getDefaultApiBaseUrl = () => {
  if (process.env.NEXT_PUBLIC_API_BASE_URL) {
    return process.env.NEXT_PUBLIC_API_BASE_URL
  }

  return '/api'
}

export const API_BASE_URL = getDefaultApiBaseUrl()
