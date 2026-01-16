/**
 * In-memory rate limiter for API routes
 * Uses IP-based tracking with automatic cleanup
 */

interface RateLimitEntry {
    count: number
    resetTime: number
}

interface RateLimitConfig {
    maxRequests: number
    windowMs: number
}

// Store rate limit data in memory
const rateLimitStore = new Map<string, RateLimitEntry>()

// Login attempt tracking for account lockout
interface LoginAttempt {
    failedCount: number
    lockedUntil: number | null
}

const loginAttemptStore = new Map<string, LoginAttempt>()

// Cleanup old entries every 5 minutes
const CLEANUP_INTERVAL = 5 * 60 * 1000
let lastCleanup = Date.now()

function cleanup() {
    const now = Date.now()
    if (now - lastCleanup < CLEANUP_INTERVAL) return

    lastCleanup = now

    // Clean rate limit entries
    Array.from(rateLimitStore.entries()).forEach(([key, entry]) => {
        if (now > entry.resetTime) {
            rateLimitStore.delete(key)
        }
    })

    // Clean login attempt entries (keep for 24 hours after lockout expires)
    Array.from(loginAttemptStore.entries()).forEach(([key, entry]) => {
        if (entry.lockedUntil && now > entry.lockedUntil + 24 * 60 * 60 * 1000) {
            loginAttemptStore.delete(key)
        }
    })
}

/**
 * Check if a request should be rate limited
 * @param identifier - Unique identifier (usually IP address)
 * @param config - Rate limit configuration
 * @returns Object with allowed status and remaining requests
 */
export function checkRateLimit(
    identifier: string,
    config: RateLimitConfig
): { allowed: boolean; remaining: number; resetIn: number } {
    cleanup()

    const now = Date.now()
    const entry = rateLimitStore.get(identifier)

    if (!entry || now > entry.resetTime) {
        // First request or window expired
        rateLimitStore.set(identifier, {
            count: 1,
            resetTime: now + config.windowMs,
        })
        return {
            allowed: true,
            remaining: config.maxRequests - 1,
            resetIn: config.windowMs,
        }
    }

    // Within the same window
    if (entry.count >= config.maxRequests) {
        return {
            allowed: false,
            remaining: 0,
            resetIn: entry.resetTime - now,
        }
    }

    entry.count++
    return {
        allowed: true,
        remaining: config.maxRequests - entry.count,
        resetIn: entry.resetTime - now,
    }
}

/**
 * Record a failed login attempt
 * @param email - User email
 */
export function recordFailedLogin(email: string): void {
    const entry = loginAttemptStore.get(email) || { failedCount: 0, lockedUntil: null }

    // If account is locked and lockout has expired, reset
    if (entry.lockedUntil && Date.now() > entry.lockedUntil) {
        entry.failedCount = 0
        entry.lockedUntil = null
    }

    entry.failedCount++

    // Lock account after 5 failed attempts for 15 minutes
    if (entry.failedCount >= 5) {
        entry.lockedUntil = Date.now() + 15 * 60 * 1000 // 15 minutes
    }

    loginAttemptStore.set(email, entry)
}

/**
 * Clear failed login attempts on successful login
 * @param email - User email
 */
export function clearFailedLogins(email: string): void {
    loginAttemptStore.delete(email)
}

/**
 * Check if account is locked
 * @param email - User email
 * @returns Object with locked status and time remaining
 */
export function isAccountLocked(email: string): { locked: boolean; remainingMs: number } {
    const entry = loginAttemptStore.get(email)

    if (!entry || !entry.lockedUntil) {
        return { locked: false, remainingMs: 0 }
    }

    const now = Date.now()
    if (now > entry.lockedUntil) {
        // Lockout expired
        entry.lockedUntil = null
        entry.failedCount = 0
        return { locked: false, remainingMs: 0 }
    }

    return { locked: true, remainingMs: entry.lockedUntil - now }
}

// Preset configurations for common use cases
export const RATE_LIMITS = {
    AUTH: { maxRequests: 5, windowMs: 60 * 1000 }, // 5 per minute
    API: { maxRequests: 30, windowMs: 60 * 1000 }, // 30 per minute
    SIGNUP: { maxRequests: 3, windowMs: 60 * 1000 }, // 3 per minute
} as const
