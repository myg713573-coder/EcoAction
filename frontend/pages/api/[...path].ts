import type { NextApiRequest, NextApiResponse } from 'next'
import { request as httpRequest } from 'http'
import { request as httpsRequest } from 'https'

const getBackendBaseUrl = () => {
  if (process.env.BACKEND_API_BASE_URL) {
    return process.env.BACKEND_API_BASE_URL
  }

  const publicApiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL
  if (publicApiBaseUrl && /^https?:\/\//.test(publicApiBaseUrl)) {
    return publicApiBaseUrl
  }

  if (process.env.NODE_ENV === 'production') {
    return 'https://ecoaction-backend.onrender.com'
  }

  return 'http://localhost:4000'
}

const getHeaderValue = (value: string | string[] | undefined) => {
  if (Array.isArray(value)) {
    return value[0] || ''
  }

  return value || ''
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
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

  const headers: Record<string, string> = {}
  Object.entries(req.headers).forEach(([key, value]) => {
    if (value === undefined) {
      return
    }

    if (Array.isArray(value)) {
      headers[key] = value.join(', ')
      return
    }

    headers[key] = value
  })

  headers.host = targetUrl.host
  headers['x-forwarded-host'] = getHeaderValue(req.headers.host) || targetUrl.host
  headers['x-forwarded-proto'] = getHeaderValue(req.headers['x-forwarded-proto']) || 'http'

  const method = req.method || 'GET'
  const shouldHaveBody = !['GET', 'HEAD'].includes(method.toUpperCase())
  const body = shouldHaveBody && req.body !== undefined
    ? Buffer.isBuffer(req.body)
      ? req.body
      : Buffer.from(typeof req.body === 'string' ? req.body : JSON.stringify(req.body))
    : undefined

  const request = (targetUrl.protocol === 'https:' ? httpsRequest : httpRequest)(targetUrl, {
    method,
    headers,
  }, (proxyResponse) => {
    res.status(proxyResponse.statusCode || 502)

    Object.entries(proxyResponse.headers).forEach(([key, value]) => {
      if (value !== undefined) {
        res.setHeader(key, Array.isArray(value) ? value : value)
      }
    })

    const chunks: Buffer[] = []
    proxyResponse.on('data', (chunk: Buffer | string) => {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
    })
    proxyResponse.on('end', () => {
      if (chunks.length > 0) {
        res.send(Buffer.concat(chunks))
      } else {
        res.end()
      }
    })
  })

  request.on('error', (error) => {
    console.error('API proxy error', error)
    res.status(502).json({ message: 'Unable to reach the backend service.' })
  })

  if (body) {
    request.write(body)
  }

  request.end()
}
