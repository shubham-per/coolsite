"use client"

import { User, Rocket, Gamepad2, Palette, Mail, HelpCircle, FolderOpen, Youtube, MessageCircle, FileText, Settings, Image as ImageIcon } from "lucide-react"

interface WindowConfig {
    key: string
    label: string
    icon?: string
    customIconUrl?: string
}

interface WindowIconProps {
    window: WindowConfig
    variant?: "colored" | "white" | "dark"
    className?: string
}

export function WindowIcon({ window, variant = "white", className = "" }: WindowIconProps) {
    // Handle custom image uploads
    if (window.customIconUrl) {
        return (
            <img
                src={window.customIconUrl}
                alt={window.label}
                className={`${className} object-contain`}
            />
        )
    }

    // Map icon names to components
    const iconName = (window.icon || "").toLowerCase()

    // Define base colors for "colored" variant
    const getIconColor = (name: string, key: string) => {
        if (variant !== "colored") return ""

        // Key-based fallbacks for colors if specific icon is used
        if (name === "user" || key === "about") return "text-blue-600"
        if (name === "rocket" || key === "engineering") return "text-orange-600"
        if (name === "gamepad" || name === "gamepad2" || key === "games") return "text-green-600"
        if (name === "palette" || key === "art") return "text-purple-600"
        if (name === "mail" || key === "contact") return "text-cyan-600"
        if (name === "help" || name === "help-circle" || key === "faq") return "text-yellow-600"
        if (name === "youtube") return "text-red-500"
        if (name === "discord") return "text-indigo-500"

        return "text-gray-700"
    }

    const colorClass = variant === "white" ? "text-white" :
        variant === "dark" ? "text-gray-800" :
            getIconColor(iconName, window.key)

    const IconComponent = getIconComponent(iconName, window.key)

    return <IconComponent className={`${className} ${colorClass}`} />
}

function getIconComponent(iconName: string, key: string) {
    // Direct name mapping
    switch (iconName) {
        case "user": return User
        case "rocket": return Rocket
        case "gamepad":
        case "gamepad2": return Gamepad2
        case "palette": return Palette
        case "mail": return Mail
        case "help":
        case "help-circle": return HelpCircle
        case "folder": return FolderOpen
        case "youtube": return Youtube
        case "message-circle":
        case "discord": return MessageCircle
        case "file-text": return FileText
        case "settings": return Settings
        case "image": return ImageIcon
    }

    // Fallback based on key if icon name not found or empty
    // (Preserving legacy behavior but giving precedence to icon name if matched above)
    if (key === "about") return User
    if (key === "engineering") return Rocket
    if (key === "games") return Gamepad2
    if (key === "art") return Palette
    if (key === "contact") return Mail
    if (key === "faq") return HelpCircle

    return FolderOpen
}
