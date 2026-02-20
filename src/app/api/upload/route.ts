/**
 * app/api/upload/route.ts
 *
 * Server-side Cloudinary upload.
 *
 * SECURITY FIX:
 * ─────────────────────────────────────────────────────────────────────────────
 * The previous implementation uploaded directly from the browser using
 * NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET. Any visitor who inspects network
 * requests can extract this preset and upload unlimited files to your
 * Cloudinary account — no auth required.
 *
 * This route keeps all Cloudinary credentials server-side (CLOUDINARY_API_SECRET
 * is never exposed to the browser). The browser POSTs a FormData with the file,
 * this route signs and uploads it, and returns the secure_url.
 *
 * Required environment variables (.env.local):
 *   CLOUDINARY_CLOUD_NAME=your_cloud_name
 *   CLOUDINARY_API_KEY=your_api_key
 *   CLOUDINARY_API_SECRET=your_api_secret   ← never prefix with NEXT_PUBLIC_
 *
 * Optional: add rate limiting or auth check here before uploading.
 */

import { v2 as cloudinary } from 'cloudinary'
import { NextResponse } from 'next/server'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function POST(req: Request) {
  try {
    const form = await req.formData()
    const file = form.get('file')

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate server-side too — never trust client-only validation
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'File must be an image' }, { status: 400 })
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File must be under 5MB' }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())

    const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: 'reviews',          // Organizes uploads in Cloudinary dashboard
          resource_type: 'image',
          transformation: [
            { width: 1200, crop: 'limit' },   // Cap resolution — saves storage
            { quality: 'auto:good' },          // Auto-compress without visible loss
          ],
        },
        (error, result) => {
          if (error || !result) reject(error ?? new Error('Upload failed'))
          else resolve(result as { secure_url: string })
        }
      ).end(buffer)
    })

    return NextResponse.json({ secure_url: result.secure_url })

  } catch (err) {
    console.error('Upload route error:', err)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}