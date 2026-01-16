import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { verifyPassword, setSession } from '@/lib/auth'
import { loginSchema } from '@/lib/validations'
import {
  checkRateLimit,
  RATE_LIMITS,
  isAccountLocked,
  recordFailedLogin,
  clearFailedLogins
} from '@/lib/rate-limit'

// Helper to get client IP
function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const ip = forwarded ? forwarded.split(',')[0].trim() : 'unknown'
  return ip
}

export async function POST(request: NextRequest) {
  try {
    const clientIp = getClientIp(request)

    // Check rate limit
    const rateLimit = checkRateLimit(`login:${clientIp}`, RATE_LIMITS.AUTH)
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: `Too many login attempts. Please try again in ${Math.ceil(rateLimit.resetIn / 1000)} seconds.` },
        {
          status: 429,
          headers: {
            'Retry-After': Math.ceil(rateLimit.resetIn / 1000).toString(),
            'X-RateLimit-Remaining': '0',
          }
        }
      )
    }

    const body = await request.json()

    // Validate input
    const result = loginSchema.safeParse(body)
    if (!result.success) {
      const errors: Record<string, string> = {}
      result.error.issues.forEach((issue) => {
        const path = issue.path[0] as string
        errors[path] = issue.message
      })
      return NextResponse.json({ errors }, { status: 400 })
    }

    const { email, password } = result.data
    const normalizedEmail = email.toLowerCase()

    // Check if account is locked
    const lockStatus = isAccountLocked(normalizedEmail)
    if (lockStatus.locked) {
      const remainingMinutes = Math.ceil(lockStatus.remainingMs / 60000)
      return NextResponse.json(
        { error: `Account temporarily locked. Please try again in ${remainingMinutes} minute(s).` },
        { status: 423 }
      )
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    })

    if (!user) {
      recordFailedLogin(normalizedEmail)
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Verify password
    const isValid = await verifyPassword(password, user.password)
    if (!isValid) {
      recordFailedLogin(normalizedEmail)
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Clear failed login attempts on successful login
    clearFailedLogins(normalizedEmail)

    // Set session
    await setSession({
      userId: user.id,
      email: user.email,
      role: user.role as 'USER' | 'ADMIN',
    })

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
