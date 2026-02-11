"use client"
import { createPortal } from "react-dom"

import { useState, useEffect } from "react"
import type { Project } from "@/lib/db"
import { X, ChevronLeft, ChevronRight, Play, Download } from "lucide-react"

interface ArtGalleryProps {
    projects: Project[]
}

export function ArtGallery({ projects }: ArtGalleryProps) {
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    // Filter out projects with no media
    const validProjects = projects.filter((p) => p.imageUrl || (p.photos && p.photos.length > 0))

    const isVideo = (url: string) => {
        return url.match(/\.(mp4|webm|ogg|mov)$/i)
    }

    // Check if URL is a YouTube link
    const isYouTube = (url: string) => {
        return url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)/)
    }

    // Extract YouTube video ID from various URL formats
    const getYouTubeId = (url: string): string | null => {
        const patterns = [
            /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
            /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
            /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/
        ]
        for (const pattern of patterns) {
            const match = url.match(pattern)
            if (match) return match[1]
        }
        return null
    }

    // Get YouTube thumbnail for preview
    const getYouTubeThumbnail = (videoId: string) => {
        return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
    }

    const getMediaUrl = (project: Project) => {
        return project.imageUrl || (project.photos && project.photos.length > 0 ? project.photos[0] : "")
    }

    const handleNext = () => {
        if (selectedIndex === null) return
        setSelectedIndex((prev) => (prev! + 1) % validProjects.length)
    }

    const handlePrev = () => {
        if (selectedIndex === null) return
        setSelectedIndex((prev) => (prev! - 1 + validProjects.length) % validProjects.length)
    }

    const handleKeyDown = (e: KeyboardEvent) => {
        if (selectedIndex === null) return
        if (e.key === "ArrowRight") handleNext()
        if (e.key === "ArrowLeft") handlePrev()
        if (e.key === "Escape") setSelectedIndex(null)
    }

    useEffect(() => {
        if (selectedIndex !== null) {
            document.addEventListener("keydown", handleKeyDown)
            return () => document.removeEventListener("keydown", handleKeyDown)
        }
    }, [selectedIndex])

    return (
        <>
            {/* Gallery Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pb-20">
                {validProjects.map((project, index) => {
                    const url = getMediaUrl(project)
                    const isVid = isVideo(url)
                    const isYT = isYouTube(url)
                    const ytId = isYT ? getYouTubeId(url) : null

                    return (
                        <div
                            key={project.id}
                            className="group relative aspect-square cursor-pointer overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800 shadow-sm transition-all hover:shadow-md"
                            onClick={() => setSelectedIndex(index)}
                        >
                            {isYT && ytId ? (
                                // YouTube thumbnail with play button
                                <div className="flex h-full w-full items-center justify-center bg-gray-900">
                                    <img
                                        src={getYouTubeThumbnail(ytId)}
                                        alt={project.title}
                                        className="h-full w-full object-cover opacity-80 transition-opacity group-hover:opacity-60"
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="bg-red-600 rounded-full p-3">
                                            <Play className="h-8 w-8 fill-white text-white" />
                                        </div>
                                    </div>
                                </div>
                            ) : isVid ? (
                                <div className="flex h-full w-full items-center justify-center bg-gray-900">
                                    <video
                                        src={url}
                                        muted
                                        playsInline
                                        preload="metadata"
                                        className="h-full w-full object-cover opacity-80 transition-opacity group-hover:opacity-60"
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <Play className="h-10 w-10 fill-white text-white opacity-90 shadow-sm" />
                                    </div>
                                </div>
                            ) : (
                                <img
                                    src={url || "/placeholder.svg"}
                                    alt={project.title}
                                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                                />
                            )}

                            {/* Overlay with Title */}
                            <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/60 to-transparent p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                                <span className="text-sm font-medium text-white truncate w-full">{project.title}</span>
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Lightbox Modal */}
            {mounted && selectedIndex !== null && createPortal(
                <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/95 backdrop-blur-md">
                    {/* Close Button */}
                    <button
                        className="absolute right-4 top-4 z-50 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 transition-colors"
                        onClick={() => setSelectedIndex(null)}
                    >
                        <X className="h-6 w-6" />
                    </button>

                    {/* Navigation */}
                    <button
                        className="absolute left-4 z-50 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 transition-colors hidden sm:block"
                        onClick={(e) => {
                            e.stopPropagation()
                            handlePrev()
                        }}
                    >
                        <ChevronLeft className="h-8 w-8" />
                    </button>

                    <button
                        className="absolute right-4 z-50 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 transition-colors hidden sm:block"
                        onClick={(e) => {
                            e.stopPropagation()
                            handleNext()
                        }}
                    >
                        <ChevronRight className="h-8 w-8" />
                    </button>

                    {/* Download Button */}
                    <button
                        className="absolute right-16 top-4 z-50 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 transition-colors"
                        onClick={(e) => {
                            e.stopPropagation()
                            /* Download logic helper */
                            const project = validProjects[selectedIndex]
                            const url = project.imageUrl || (project.photos && project.photos.length > 0 ? project.photos[0] : "")
                            if (url) {
                                const link = document.createElement('a')
                                link.href = url
                                link.download = project.title || 'download'
                                document.body.appendChild(link)
                                link.click()
                                document.body.removeChild(link)
                            }
                        }}
                        title="Download"
                    >
                        <Download className="h-6 w-6" />
                    </button>


                    {/* Main Media */}
                    <div className="relative h-full w-full p-4 md:p-10 flex items-center justify-center">
                        {(() => {
                            const project = validProjects[selectedIndex]
                            const url = project.imageUrl || (project.photos && project.photos.length > 0 ? project.photos[0] : "")
                            const isVid = url.match(/\.(mp4|webm|ogg|mov)$/i)
                            const isYT = isYouTube(url)
                            const ytId = isYT ? getYouTubeId(url) : null

                            return (
                                <div className="relative max-h-full max-w-full flex flex-col items-center justify-center" onClick={(e) => e.stopPropagation()}>
                                    {isYT && ytId ? (
                                        // YouTube embed - larger player
                                        <div className="w-[90vw] max-w-6xl aspect-video">
                                            <iframe
                                                src={`https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0`}
                                                title={project.title}
                                                className="w-full h-full rounded shadow-lg"
                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                allowFullScreen
                                            />
                                        </div>
                                    ) : isVid ? (
                                        <video
                                            src={url}
                                            controls
                                            autoPlay
                                            playsInline
                                            className="max-h-[85vh] max-w-full rounded shadow-lg"
                                        />
                                    ) : (
                                        <img
                                            src={url || "/placeholder.svg"}
                                            alt={project.title}
                                            className="max-h-[85vh] max-w-full rounded shadow-lg object-contain"
                                        />
                                    )}
                                    <div className="mt-4 text-center bg-black/50 p-4 rounded-xl backdrop-blur-md">
                                        <h2 className="text-xl font-bold text-white mb-2">{project.title}</h2>
                                        <p className="text-gray-300 text-sm max-w-2xl mx-auto">{project.description}</p>
                                    </div>
                                </div>
                            )
                        })()}
                    </div>
                </div>,
                document.body
            )}
        </>
    )
}
