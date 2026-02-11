import { NextRequest, NextResponse } from 'next/server'

// Redirect all uploads to the GitHub upload endpoint
export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData()
        const file = formData.get('image') as File

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
        }

        // Forward to GitHub upload endpoint
        const uploadFormData = new FormData()
        uploadFormData.append('file', file)
        uploadFormData.append('folder', 'uploads')

        const uploadResponse = await fetch(`${request.nextUrl.origin}/api/upload-github`, {
            method: 'POST',
            body: uploadFormData,
        })

        if (!uploadResponse.ok) {
            return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
        }

        const result = await uploadResponse.json()
        return NextResponse.json({ url: result.url })
    } catch (error) {
        console.error('Upload error:', error)
        return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
    }
}
