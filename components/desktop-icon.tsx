"use client"

import type React from "react"

import { useState } from "react"

interface DesktopIconProps {
  icon: React.ReactNode | string
  label: string
  onDoubleClick: () => void
  size?: "small" | "large"
  textColor?: string
}

export default function DesktopIcon({
  icon,
  label,
  onDoubleClick,
  size = "small",
  textColor = "#ffffff",
}: DesktopIconProps) {
  const [isSelected, setIsSelected] = useState(false)

  const handleClick = () => {
    setIsSelected(true)
    setTimeout(() => setIsSelected(false), 200)
  }

  const iconSize = size === "large" ? "w-16 h-16" : "w-12 h-12"
  const textSize = size === "large" ? "text-sm" : "text-xs"

  return (
    <div
      className={`flex flex-col items-center cursor-pointer select-none ${size === "large" ? "p-3" : "p-2"
        } rounded-lg ${isSelected ? "bg-white/20 backdrop-blur-sm" : ""} hover:bg-white/10 transition-all duration-200`}
      onClick={(e) => {
        handleClick()
        // Allow single click to open for better touch support & web usability
        if (onDoubleClick) onDoubleClick()
      }}
    >
      <div
        className={`${iconSize} bg-white/20 backdrop-blur-md rounded-xl border border-white/30 flex items-center justify-center mb-2 shadow-lg hover:bg-white/30 hover:scale-105 transition-all duration-200`}
        style={{
          boxShadow: '0 4px 12px 0 rgba(31, 38, 135, 0.15)',
        }}
      >
        {typeof icon === "string" ? (
          <span className="text-2xl">{icon}</span>
        ) : (
          <div className="text-white">{icon}</div>
        )}
      </div>
      <span
        className={`${textSize} text-center font-medium max-w-16 leading-tight drop-shadow-sm`}
        style={{ color: textColor }}
      >
        {label}
      </span>
    </div>
  )
}
