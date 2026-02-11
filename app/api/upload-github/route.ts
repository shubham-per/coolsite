import { NextRequest, NextResponse } from 'next/server'

// GitHub API endpoint for uploading files
const GITHUB_API = 'https://api.github.com'

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData()
        const file = formData.get('file') as File
        const folder = formData.get('folder') as string || 'uploads'

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 })
        }

        const token = process.env.GITHUB_TOKEN
        const owner = process.env.GITHUB_OWNER
        const repo = process.env.GITHUB_REPO

        if (!token || !owner || !repo) {
            console.error('GitHub configuration missing in environment variables')
            return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
        }

        // Generate unique filename
        const timestamp = Date.now()
        const ext = file.name.split('.').pop()
        const filename = `${timestamp}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
        const filePath = `${folder}/${filename}`

        // Convert file to base64
        const bytes = await file.arrayBuffer()
        const base64Content = Buffer.from(bytes).toString('base64')

        // Upload to GitHub
        const response = await fetch(`${GITHUB_API}/repos/${owner}/${repo}/contents/${filePath}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'Accept': 'application/vnd.github.v3+json',
            },
            body: JSON.stringify({
                message: `Upload ${filename}`,
                content: base64Content,
                branch: 'main'
            })
        })

        if (!response.ok) {
            const errorData = await response.json()
            console.error('GitHub API error:', errorData)
            return NextResponse.json({ error: 'Failed to upload to GitHub' }, { status: 500 })
        }

        const data = await response.json()

        // Return the raw URL for the uploaded file
        const rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/main/${filePath}`

        return NextResponse.json({
            success: true,
            url: rawUrl,
            path: filePath
        })

    } catch (error) {
        console.error('Upload error:', error)
        return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
    }
}
