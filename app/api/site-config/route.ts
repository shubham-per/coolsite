import { NextRequest, NextResponse } from "next/server"
import fs from "fs"
import path from "path"
import { getSiteConfig, saveSiteConfig } from "@/lib/data"
import { requireAuth } from "@/lib/auth"

const UPLOADS_DIR = path.join(process.cwd(), "public", "uploads")

if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true })
}

function isAllowedImageType(filename: string) {
    const ext = filename.split(".").pop()?.toLowerCase()
    return ext === "jpg" || ext === "jpeg" || ext === "png" || ext === "gif" || ext === "svg" || ext === "webp" || ext === "ico"
}

export async function GET() {
    try {
        const config = getSiteConfig()
        return NextResponse.json(config)
    } catch (error) {
        console.error("Site Config GET error:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        try {
            requireAuth(request)
        } catch {
            return NextResponse.json({ error: "Authentication required" }, { status: 401 })
        }

        const contentType = request.headers.get("content-type") || ""
        let data: any = {}

        if (contentType.startsWith("multipart/form-data")) {
            // @ts-ignore
            const formData = await request.formData()
            for (const [key, value] of formData.entries()) {
                if (typeof value === "string") {
                    data[key] = value
                } else if (value instanceof File && isAllowedImageType(value.name)) {
                    const arrayBuffer = await value.arrayBuffer()
                    const buffer = Buffer.from(arrayBuffer)
                    const filename = `favicon-${Date.now()}-${value.name.replace(/[^a-zA-Z0-9.]/g, "_")}`
                    const filePath = path.join(UPLOADS_DIR, filename)
                    fs.writeFileSync(filePath, buffer)
                    data.faviconUrl = `/uploads/${filename}`
                }
            }
        } else {
            data = await request.json()
        }

        const currentConfig = getSiteConfig()
        const newConfig = {
            ...currentConfig,
            title: data.title || currentConfig.title,
            faviconUrl: data.faviconUrl || currentConfig.faviconUrl,
        }

        saveSiteConfig(newConfig)
        return NextResponse.json({ success: true, config: newConfig })
    } catch (error) {
        console.error("Site Config POST error:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
