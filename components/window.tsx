"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { X, Minus, Square, Sun, Moon } from "lucide-react"

interface WindowProps {
  title: string
  children: React.ReactNode
  isActive: boolean
  onClose: () => void
  onFocus: () => void
  initialPosition: { x: number; y: number }
  width?: number
  height?: number
  zIndex?: number
  theme?: 'light' | 'dark'

  onSetTheme?: (theme: 'light' | 'dark') => void
  transparent?: boolean
}

export default function Window({
  title,
  children,
  isActive,
  onClose,
  onFocus,
  initialPosition,
  width = 400,
  height = 300,
  zIndex = 10,
  theme = 'light',

  onSetTheme,
  transparent = false,
}: WindowProps) {
  const [position, setPosition] = useState(initialPosition)
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const windowRef = useRef<HTMLDivElement>(null)

  const handleStart = (clientX: number, clientY: number) => {
    setIsDragging(true)
    setDragOffset({
      x: clientX - position.x,
      y: clientY - position.y,
    })
    onFocus()
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget || (e.target as HTMLElement).classList.contains("window-title")) {
      handleStart(e.clientX, e.clientY)
    }
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.target === e.currentTarget || (e.target as HTMLElement).classList.contains("window-title")) {
      const touch = e.touches[0]
      handleStart(touch.clientX, touch.clientY)
    }
  }

  useEffect(() => {
    const handleMove = (clientX: number, clientY: number) => {
      if (isDragging) {
        setPosition({
          x: Math.max(0, Math.min(window.innerWidth - width, clientX - dragOffset.x)),
          y: Math.max(0, Math.min(window.innerHeight - height - 40, clientY - dragOffset.y)),
        })
      }
    }

    const handleMouseMove = (e: MouseEvent) => handleMove(e.clientX, e.clientY)

    const handleTouchMove = (e: TouchEvent) => {
      if (isDragging) {
        e.preventDefault() // Prevent scrolling while dragging
        const touch = e.touches[0]
        handleMove(touch.clientX, touch.clientY)
      }
    }

    const handleEnd = () => setIsDragging(false)

    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleEnd)
      document.addEventListener("touchmove", handleTouchMove, { passive: false })
      document.addEventListener("touchend", handleEnd)
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleEnd)
      document.removeEventListener("touchmove", handleTouchMove)
      document.removeEventListener("touchend", handleEnd)
    }
  }, [isDragging, dragOffset, width, height])

  return (
    <div
      ref={windowRef}
      className={`absolute ${transparent ? '' : 'bg-black/20 border border-white/30'} rounded-xl overflow-hidden flex flex-col`}
      style={{
        left: position.x,
        top: position.y,
        width,
        height,
        cursor: isDragging ? "grabbing" : "default",
        zIndex: zIndex,
        boxShadow: transparent
          ? "none"
          : isActive
            ? "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
            : "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
        transition: "box-shadow 0.2s ease-in-out, width 0.2s, height 0.2s",
      }}
      onClick={onFocus}
      onTouchStart={onFocus}
    >
      {/* Title Bar */}
      <div
        className={`window-title h-8 pl-3 pr-0 flex items-center justify-between cursor-grab active:cursor-grabbing flex-none border-b ${isActive
          ? theme === 'dark'
            ? "bg-gray-800/60 text-white border-white/15"
            : "bg-blue-600/40 text-white border-white/20"
          : theme === 'dark'
            ? "bg-gray-800/40 text-gray-300 border-white/10"
            : "bg-gray-600/30 text-gray-200 border-white/10"
          }`}
        style={{}}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        <span className="text-sm font-bold truncate drop-shadow-sm">{title}</span>
        <div className="flex h-full items-center">
          {onSetTheme && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); onSetTheme('dark'); }}
                className={`w-8 h-8 flex items-center justify-center hover:bg-white/20 transition-colors duration-200 ${theme === 'dark' ? 'text-blue-300' : ''}`}
                title="Switch to Dark Mode"
              >
                <Minus className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onSetTheme('light'); }}
                className={`w-8 h-8 flex items-center justify-center hover:bg-white/20 transition-colors duration-200 ${theme === 'light' ? 'text-yellow-300' : ''}`}
                title="Switch to Light Mode"
              >
                <Square className="w-3 h-3" />
              </button>
            </>
          )}
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center hover:bg-red-600 transition-colors duration-200 pb-0.5"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className={`flex-1 w-full overflow-auto ${transparent ? 'bg-transparent' : (theme === 'dark' ? 'bg-gray-900/95' : 'bg-white/95')}`}>{children}</div>
    </div>
  )
}
