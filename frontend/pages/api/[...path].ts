import type { NextApiRequest, NextApiResponse } from 'next'

const getBackendBaseUrl = () => {
  if (process.env.BACKEND_API_BASE_URL) {
    return process.env.BACKEND_API_BASE_URL
  }

  const publicApiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL
  if (publicApiBaseUrl && /^https?:\/\//.test(publicApiBaseUrl)) {
    return publicApiBaseUrl
  }

  return 'http://localhost:4000'
}

const getHeaderValue = (value: string | string[] | undefined) => {
  if (Array.isArray(value)) {
    return value[0] || ''
  }

  return value || ''
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const backendBaseUrl = getBackendBaseUrl()
  const pathSegments = Array.isArray(req.query.path) ? req.query.path : [req.query.path].filter(Boolean)
  const path = pathSegments.length > 0 ? `/${pathSegments.join('/')}` : '/'

  const targetUrl = new URL(path, backendBaseUrl)
  const searchParams = new URLSearchParams()

  Object.entries(req.query).forEach(([key, value]) => {
    if (key === 'path') {
      return
    }

    if (Array.isArray(value)) {
      value.forEach((item) => item && searchParams.append(key, item))
      return
    }

    if (value) {
      searchParams.append(key, value)
    }
  })

  targetUrl.search = searchParams.toString()

  const headers = new Headers()
  Object.entries(req.headers).forEach(([key, value]) => {
    if (value === undefined) {
      return
    }

    if (Array.isArray(value)) {
      value.forEach((item) => headers.append(key, item))
      return
    }

    headers.set(key, value)
  })

  headers.set('host', targetUrl.host)
  headers.set('x-forwarded-host', getHeaderValue(req.headers.host) || targetUrl.host)
  headers.set('x-forwarded-proto', getHeaderValue(req.headers['x-forwarded-proto']) || 'http')

  const method = req.method || 'GET'
  const shouldHaveBody = !['GET', 'HEAD'].includes(method.toUpperCase())
  const body = shouldHaveBody && req.body !== undefined ? JSON.stringify(req.body) : undefined

  try {
    const response = await fetch(targetUrl.toString(), {
      method,
      headers,
      body,
    })

    const responseText = await response.text()

    res.status(response.status)
    response.headers.forEach((value, key) => {
      if (key.toLowerCase() !== 'content-encoding') {
        res.setHeader(key, value)
      }
    })

    if (responseText) {
      res.send(responseText)
    } else {
      res.end()
    }
  } catch (error) {
    console.error('API proxy error', error)
    res.status(502).json({ message: 'Unable to reach the backend service.' })
  }
}
