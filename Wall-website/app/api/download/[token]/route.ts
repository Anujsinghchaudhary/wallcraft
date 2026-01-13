import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { isExpired } from '@/lib/utils'

interface RouteParams {
  params: Promise<{ token: string }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { token } = await params

    // Find download record
    const download = await prisma.download.findUnique({
      where: { downloadToken: token },
      include: {
        wallpaper: true,
        user: true,
      },
    })

    if (!download) {
      return NextResponse.json(
        { error: 'Invalid download link' },
        { status: 404 }
      )
    }

    // Check if expired
    if (isExpired(download.expiresAt)) {
      return NextResponse.json(
        { error: 'Download link has expired' },
        { status: 410 }
      )
    }

    // Check download limit
    if (download.downloadCount >= download.maxDownloads) {
      return NextResponse.json(
        { error: 'Download limit reached' },
        { status: 429 }
      )
    }

    // Update download count
    await prisma.download.update({
      where: { id: download.id },
      data: {
        downloadCount: { increment: 1 },
        lastDownloadAt: new Date(),
        ipAddress: request.headers.get('x-forwarded-for') || request.ip,
        userAgent: request.headers.get('user-agent'),
      },
    })

    // Get the file URL
    const fileUrl = download.wallpaper.fileUrl

    // If the file is an external URL, redirect to it
    if (fileUrl.startsWith('http')) {
      return NextResponse.redirect(fileUrl)
    }

    // For local files, you would serve them here
    // In production, use a CDN or cloud storage with signed URLs
    
    // For now, redirect to a placeholder or the file location
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    
    // In production, generate a signed URL from your storage provider
    // For example, with AWS S3:
    // const signedUrl = await s3.getSignedUrlPromise('getObject', {
    //   Bucket: 'your-bucket',
    //   Key: fileUrl.replace('/protected/', ''),
    //   Expires: 3600, // 1 hour
    // })
    
    return NextResponse.json({
      success: true,
      message: 'Download started',
      fileName: `${download.wallpaper.title}.mov`,
      // In production, return the signed URL
      // url: signedUrl,
    })
  } catch (error) {
    console.error('Download error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
