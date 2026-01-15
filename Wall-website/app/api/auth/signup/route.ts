import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { hashPassword, setSession } from '@/lib/auth'
import { signupSchema } from '@/lib/validations'
import { sendWelcomeEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const result = signupSchema.safeParse(body)
    if (!result.success) {
      const errors: Record<string, string> = {}
      result.error.issues.forEach((issue) => {
        const path = issue.path[0] as string
        errors[path] = issue.message
      })
      return NextResponse.json({ errors }, { status: 400 })
    }

    const { email, password, name } = result.data

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    })

    if (existingUser) {
      return NextResponse.json(
        { errors: { email: 'An account with this email already exists' } },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Create user
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        password: hashedPassword,
        name,
      },
    })

    // Set session
    await setSession({
      userId: user.id,
      email: user.email,
      role: user.role as 'USER' | 'ADMIN',
    })

    // Send welcome email (don't await to avoid blocking response)
    sendWelcomeEmail({
      to: user.email,
      name: user.name || 'there',
    }).catch(console.error)

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    })
  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
