// Simple in-memory rate limiter for API routes
// Limits by IP address with a sliding window

const requests = new Map<string, { count: number; resetAt: number }>()

interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetAt: number
}

export function rateLimit(
  ip: string,
  options: { maxRequests: number; windowMs: number } = { maxRequests: 5, windowMs: 60_000 }
): RateLimitResult {
  const now = Date.now()
  const entry = requests.get(ip)

  if (!entry || now > entry.resetAt) {
    const resetAt = now + options.windowMs
    requests.set(ip, { count: 1, resetAt })
    return { allowed: true, remaining: options.maxRequests - 1, resetAt }
  }

  entry.count++

  if (entry.count > options.maxRequests) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt }
  }

  return { allowed: true, remaining: options.maxRequests - entry.count, resetAt: entry.resetAt }
}

// Cleanup old entries every 5 minutes
if (typeof globalThis !== 'undefined') {
  setInterval(() => {
    const now = Date.now()
    for (const [ip, entry] of requests) {
      if (now > entry.resetAt) requests.delete(ip)
    }
  }, 300_000)
}
