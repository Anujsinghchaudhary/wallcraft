import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { requireAdmin } from '@/lib/auth'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    await requireAdmin()
    const { id } = await params

    const wallpaper = await prisma.wallpaper.findUnique({
      where: { id },
    })

    if (!wallpaper) {
      return NextResponse.json({ error: 'Wallpaper not found' }, { status: 404 })
    }

    return NextResponse.json({ wallpaper })
  } catch (error) {
    console.error('Get wallpaper error:', error)
    if (error instanceof Error && error.message === 'Forbidden') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    await requireAdmin()
    const { id } = await params
    const body = await request.json()

    const wallpaper = await prisma.wallpaper.update({
      where: { id },
      data: body,
    })

    return NextResponse.json({ success: true, wallpaper })
  } catch (error) {
    console.error('Update wallpaper error:', error)
    if (error instanceof Error && error.message === 'Forbidden') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    await requireAdmin()
    const { id } = await params

    await prisma.wallpaper.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete wallpaper error:', error)
    if (error instanceof Error && error.message === 'Forbidden') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
