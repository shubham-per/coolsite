"use client"

import { useState, useEffect } from "react"
import Window from "@/components/window"
import DesktopIcon from "@/components/desktop-icon"
import { WindowIcon } from "@/components/window-icon"
import MobileLayout from "@/components/mobile-layout"
import AnalyticsTracker from "@/components/analytics-tracker"
import { ArtGallery } from "@/components/art-gallery"
import { FaqAccordion } from "@/components/faq-accordion"
import { Project } from "@/lib/db"
import { User, Youtube, MessageCircle, HelpCircle, Mail, Rocket, Gamepad2, Palette } from "lucide-react"
import { formatText } from "@/lib/format"


interface Content {
  id: number
  section: string
  title: string
  content: string
  imageUrl?: string
  customTabKey?: string
}

interface ExtendedProject extends Project {
  customTabKey?: string
}

interface WindowConfig {
  id: number
  key: string
  label: string
  type: "builtIn" | "custom"
  showOnDesktop: boolean
  showInHome: boolean
  orderDesktop: number
  orderHome: number
  isHidden: boolean
  content?: string
  icon?: string
  customIconUrl?: string
  layout?: "content" | "projects" | "faq" | "gallery"
}

interface BackgroundStyle {
  type: "solid" | "gradient" | "image"
  color: string
  from: string
  via: string
  to: string
  overlay?: boolean
  imageUrl?: string
  iconColor?: string
}

interface BackgroundConfig {
  desktop: BackgroundStyle
  mobile: BackgroundStyle
}

interface ContactLink {
  id: number
  name: string
  url: string
  iconUrl: string
  order: number
  isActive: boolean
  showOnDesktop?: boolean
}

export default function Page() {
  const [openWindows, setOpenWindows] = useState<string[]>(["home"])
  const [activeWindow, setActiveWindow] = useState("home")
  const [windowDimensions, setWindowDimensions] = useState({ width: 1200, height: 800 })
  const [windowZIndex, setWindowZIndex] = useState<Record<string, number>>({})
  const [nextZIndex, setNextZIndex] = useState(100)
  const [isMobile, setIsMobile] = useState(false)

  const [content, setContent] = useState<Record<string, Content>>({})
  const [projects, setProjects] = useState<ExtendedProject[]>([])
  const [faqItems, setFaqItems] = useState<Array<{ id: number; question: string; answer: string; order: number; isActive: boolean; customTabKey?: string }>>([])
  const [loading, setLoading] = useState(true)
  const [background, setBackground] = useState<BackgroundConfig | null>(null)
  const [windows, setWindows] = useState<WindowConfig[]>([])
  const [contactLinks, setContactLinks] = useState<ContactLink[]>([])
  // Easter egg: track which image is shown for each project
  const [projectImageIndex, setProjectImageIndex] = useState<Record<number, number>>({})
  // Theme state - default to dark
  const [theme, setTheme] = useState<'light' | 'dark'>('dark')

  // Load theme preference on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('shubu-theme') as 'light' | 'dark' | null
    if (savedTheme) {
      setTheme(savedTheme)
    } else {
      // Default: Dark for desktop, Light for mobile
      const isMobileWidth = window.innerWidth < 768
      setTheme(isMobileWidth ? 'light' : 'dark')
    }
  }, [])

  // Save theme preference on change
  useEffect(() => {
    localStorage.setItem('shubu-theme', theme)
  }, [theme])

  useEffect(() => {
    const updateDimensions = () => {
      setWindowDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      })
      setIsMobile(window.innerWidth < 768)
    }

    updateDimensions()
    window.addEventListener("resize", updateDimensions)
    return () => window.removeEventListener("resize", updateDimensions)
  }, [])

  // Load and persist theme
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null
    if (savedTheme) {
      setTheme(savedTheme)
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('theme', theme)
  }, [theme])

  useEffect(() => {
    const loadContent = async () => {
      try {
        const sections = ["about", "contact", "faq", "about_subtitle", "home_greeting", "home_subtitle"]
        const contentData: Record<string, Content> = {}

        for (const section of sections) {
          const res = await fetch(`/api/content?section=${section}`, { cache: "no-store" })
          if (res.ok) {
            const data = await res.json()
            contentData[section] = data
          }
        }
        setContent(contentData)

        const projectsRes = await fetch("/api/projects", { cache: "no-store" })
        const rawProjects = await projectsRes.json()
        const projectsData: Project[] = rawProjects.map((p: any) => ({
          ...p,
          photos: Array.isArray(p.photos) ? p.photos : [],
          keywords: Array.isArray(p.keywords) ? p.keywords : [],
          tags: Array.isArray(p.tags) ? p.tags : [],
        }))
        setProjects(projectsData)

        const faqRes = await fetch("/api/faq")
        const faqData = await faqRes.json()
        setFaqItems(faqData)

        const bgRes = await fetch("/api/background")
        if (bgRes.ok) {
          const bgData = await bgRes.json()
          setBackground(bgData)
        }

        const winRes = await fetch("/api/windows")
        if (winRes.ok) {
          const winData = await winRes.json()
          setWindows(winData)
        }

        const linksRes = await fetch("/api/contact-links", { cache: "no-store" })
        if (linksRes.ok) {
          const linksData = await linksRes.json()
          setContactLinks(linksData)
        }

        setLoading(false)
      } catch (error) {
        console.error("Failed to load content:", error)
        setLoading(false)
      }
    }

    loadContent()
  }, [])

  // Inject SEO meta tags dynamically based on project keywords
  useEffect(() => {
    if (projects.length === 0) return

    // Collect all unique keywords from active projects
    const allKeywords = new Set<string>()
    projects.forEach(project => {
      if (project.isActive && project.keywords) {
        project.keywords.forEach(keyword => allKeywords.add(keyword))
      }
    })

    const keywordsString = Array.from(allKeywords).join(', ')

    if (keywordsString) {
      // Update or create keywords meta tag
      let keywordsMeta = document.querySelector('meta[name="keywords"]') as HTMLMetaElement
      if (!keywordsMeta) {
        keywordsMeta = document.createElement('meta')
        keywordsMeta.name = 'keywords'
        document.head.appendChild(keywordsMeta)
      }
      keywordsMeta.content = keywordsString

      // Update description to include portfolio context
      let descMeta = document.querySelector('meta[name="description"]') as HTMLMetaElement
      if (!descMeta) {
        descMeta = document.createElement('meta')
        descMeta.name = 'description'
        document.head.appendChild(descMeta)
      }
      descMeta.content = `Portfolio featuring projects in ${Array.from(allKeywords).slice(0, 5).join(', ')} and more.`

      // Add Open Graph tags for social sharing
      let ogTitle = document.querySelector('meta[property="og:title"]') as HTMLMetaElement
      if (!ogTitle) {
        ogTitle = document.createElement('meta')
        ogTitle.setAttribute('property', 'og:title')
        document.head.appendChild(ogTitle)
      }
      ogTitle.content = document.title || 'Shubu Portfolio'

      let ogDescription = document.querySelector('meta[property="og:description"]') as HTMLMetaElement
      if (!ogDescription) {
        ogDescription = document.createElement('meta')
        ogDescription.setAttribute('property', 'og:description')
        document.head.appendChild(ogDescription)
      }
      ogDescription.content = descMeta.content
    }
  }, [projects])

  const openWindow = (windowId: string) => {
    if (!openWindows.includes(windowId)) {
      setOpenWindows([...openWindows, windowId])
    }
    setWindowZIndex((prev) => ({ ...prev, [windowId]: nextZIndex }))
    setNextZIndex((prev) => prev + 1)
    setActiveWindow(windowId)
  }

  const closeWindow = (windowId: string) => {
    setOpenWindows(openWindows.filter((id) => id !== windowId))
    setWindowZIndex((prev) => {
      const newZIndex = { ...prev }
      delete newZIndex[windowId]
      return newZIndex
    })
    if (activeWindow === windowId) {
      setActiveWindow(openWindows.filter((id) => id !== windowId)[0] || "")
    }
  }

  const focusWindow = (windowId: string) => {
    setWindowZIndex((prev) => ({ ...prev, [windowId]: nextZIndex }))
    setNextZIndex((prev) => prev + 1)
    setActiveWindow(windowId)
  }

  /* Removed toggleTheme as we now use direct setters */

  const getResponsivePosition = (baseX: number, baseY: number) => ({
    x: Math.min(baseX, windowDimensions.width * 0.1),
    y: Math.min(baseY, windowDimensions.height * 0.1),
  })

  const getCenteredPosition = (width: number, height: number) => ({
    x: Math.max(0, (windowDimensions.width - width) / 2),
    y: Math.max(0, (windowDimensions.height - height) / 2),
  })

  const getResponsiveSize = (baseWidth: number, baseHeight: number) => ({
    width: Math.min(baseWidth, windowDimensions.width * 0.9),
    height: Math.min(baseHeight, windowDimensions.height * 0.8),
  })

  const getWindowZIndex = (windowId: string) => {
    return windowZIndex[windowId] || 10
  }

  const openExternalLink = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer")
  }

  const getProjectsByCategory = (category: "engineering" | "games" | "art") => {
    return projects.filter(project => project.category === category)
  }

  // Easter egg: cycle through project images when title is clicked
  const cycleProjectImage = (projectId: number, totalImages: number) => {
    if (totalImages <= 1) return // No additional photos to cycle
    setProjectImageIndex(prev => ({
      ...prev,
      [projectId]: ((prev[projectId] || 0) + 1) % totalImages
    }))
  }

  // Get the current image URL for a project (main + additional photos)
  const getProjectImage = (project: ExtendedProject): string => {
    const allImages = [project.imageUrl, ...(project.photos || [])].filter(Boolean) as string[]
    if (allImages.length === 0) return "/placeholder.jpg"
    const currentIndex = projectImageIndex[project.id] || 0
    return allImages[currentIndex] || allImages[0]
  }

  // Check if a project has multiple images (for easter egg hint)
  const hasMultipleImages = (project: ExtendedProject): boolean => {
    const allImages = [project.imageUrl, ...(project.photos || [])].filter(Boolean)
    return allImages.length > 1
  }

  const getBackgroundClass = () => {
    if (!background) {
      return { style: {} as React.CSSProperties, className: "", iconColor: "white" }
    }

    // Use desktop background for this component
    const bg = background.desktop || { type: "gradient", color: "#2563eb", from: "#60a5fa", via: "#3b82f6", to: "#2563eb", overlay: true };
    const iconColor = bg.iconColor || "white";

    if (bg.type === "solid") {
      return { style: { backgroundColor: bg.color } as React.CSSProperties, className: "", iconColor }
    }
    if (bg.type === "gradient") {
      const from = bg.from || "#60a5fa"
      const via = bg.via || "#3b82f6"
      const to = bg.to || "#2563eb"
      return {
        style: {
          backgroundImage: `linear-gradient(to bottom, ${from}, ${via}, ${to})`,
        } as React.CSSProperties,
        className: "",
        iconColor
      }
    }
    return {
      style: {
        backgroundImage: `url(${bg.imageUrl})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      } as React.CSSProperties,
      className: "",
      iconColor
    }
  }

  /* renderIcon removed - using WindowIcon component */

  if (isMobile) {
    return <MobileLayout theme={theme} onSetTheme={setTheme} />
  }

  if (loading || !background || windows.length === 0) {
    return (
      <div className="h-screen w-screen bg-gradient-to-b from-blue-400 via-blue-500 to-blue-600 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    )
  }

  const bgProps = getBackgroundClass()

  return (
    <div>
      <AnalyticsTracker page="home" />
      <div className={`h-screen w-screen relative overflow-hidden ${bgProps.className || ""} ${theme === 'dark' ? 'dark' : ''}`} style={bgProps.style}>
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1)_0%,transparent_50%)]"></div>
        </div>

        <div className="absolute top-4 sm:top-6 left-4 sm:left-6 space-y-2 sm:space-y-4">
          {windows
            .filter((w) => !w.isHidden && w.showOnDesktop)
            .sort((a, b) => a.orderDesktop - b.orderDesktop)
            .map((w) => (
              <DesktopIcon
                key={w.id}
                icon={<WindowIcon window={w} variant="white" className="w-6 h-6" />}
                label={w.label}
                onDoubleClick={() => openWindow(w.key)}
                textColor={background.desktop.iconColor || "white"}
              />
            ))}
        </div>

        <div className="absolute bottom-16 sm:bottom-20 right-4 sm:right-6 flex flex-col space-y-2 sm:space-y-4">
          {contactLinks
            .filter(link => link.isActive && link.showOnDesktop !== false)
            .sort((a, b) => a.order - b.order)
            .map((link) => (
              <DesktopIcon
                key={link.id}
                icon={
                  link.iconUrl ? (
                    <img src={link.iconUrl} alt={link.name} className="w-6 h-6 object-contain" />
                  ) : (
                    <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold text-gray-500">{link.name[0]}</span>
                    </div>
                  )
                }
                label={link.name}
                onDoubleClick={() => openExternalLink(link.url)}
                textColor={bgProps.iconColor}
              />
            ))}
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-10 sm:h-12 bg-black/30 backdrop-blur-md border-t border-white/20 flex items-center px-2 sm:px-4 space-x-1 sm:space-x-2">
          <button
            onClick={() => openWindow("home")}
            className="bg-white/20 backdrop-blur-sm px-4 py-2 text-sm font-medium border border-white/30 rounded hover:bg-white/30 text-white transition-all duration-200 flex items-center space-x-2"
          >
            <div className="w-4 h-4 bg-gradient-to-br from-green-400 to-blue-500 rounded-sm"></div>
            <span>Start</span>
          </button>
          {openWindows.map((windowId) => (
            <button
              key={windowId}
              onClick={() => focusWindow(windowId)}
              className={`px-4 py-2 text-sm border rounded transition-all duration-200 ${activeWindow === windowId
                ? "bg-white/30 backdrop-blur-sm border-white/40 text-white"
                : "bg-white/10 backdrop-blur-sm border-white/20 text-white/80 hover:bg-white/20"
                }`}
            >
              {windowId}
            </button>
          ))}
        </div>

        {openWindows.includes("home") && (
          <Window
            title="home"
            isActive={activeWindow === "home"}
            onClose={() => closeWindow("home")}
            onFocus={() => focusWindow("home")}
            initialPosition={getCenteredPosition(getResponsiveSize(600, 500).width, getResponsiveSize(600, 500).height)}
            width={getResponsiveSize(600, 500).width}
            height={getResponsiveSize(600, 500).height}
            zIndex={getWindowZIndex("home")}
            theme={theme}
            onSetTheme={setTheme}
          >
            <div className="flex flex-col items-center justify-center min-h-full p-8">
              <div className="text-center mb-8">
                <h1 className={`text-4xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                  {content.home_greeting ? (
                    <span dangerouslySetInnerHTML={{ __html: formatText(content.home_greeting.content) }} />
                  ) : (
                    <>hi! i'm <span className="text-blue-600">shubham</span></>
                  )}
                </h1>
                <div className={`text-lg ${theme === 'dark' ? 'text-gray-200' : 'text-gray-600'}`}>
                  {content.home_subtitle ? (
                    <span dangerouslySetInnerHTML={{ __html: formatText(content.home_subtitle.content) }} />
                  ) : (
                    "aerospace engineer, game developer, and digital artist"
                  )}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 sm:gap-6">
                {windows
                  .filter((w) => !w.isHidden && w.showInHome)
                  .sort((a, b) => a.orderHome - b.orderHome)
                  .map((w) => (
                    <DesktopIcon
                      key={w.id}
                      icon={<WindowIcon window={w} variant="colored" className="w-8 h-8" />}
                      label={w.label}
                      onDoubleClick={() => openWindow(w.key)}
                      size="large"
                      textColor={theme === 'dark' ? '#f3f4f6' : '#1f2937'}
                    />
                  ))}
              </div>
            </div>
          </Window>
        )}

        {openWindows.includes("about") && (
          <Window
            title="About"
            isActive={activeWindow === "about"}
            onClose={() => closeWindow("about")}
            onFocus={() => focusWindow("about")}
            initialPosition={getResponsivePosition(350, 150)}
            width={getResponsiveSize(600, 500).width}
            height={getResponsiveSize(600, 500).height}
            zIndex={getWindowZIndex("about")}
            theme={theme}
            onSetTheme={setTheme}
          >
            <div className="p-6 h-full overflow-auto">
              <div className="flex items-center mb-4">
                <div className="w-16 h-16 bg-gray-300 rounded mr-4 flex items-center justify-center overflow-hidden">
                  {content.about?.imageUrl ? (
                    <img src={content.about.imageUrl} alt="About" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-8 h-8 text-gray-600" />
                  )}
                </div>
                <div>
                  <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>{content.about?.title || "About Me"}</h2>
                  <div className={`${theme === 'dark' ? 'text-gray-200' : 'text-gray-600'}`}>
                    {content.about_subtitle ? (
                      <span dangerouslySetInnerHTML={{ __html: formatText(content.about_subtitle.content) }} />
                    ) : (
                      "Final Year Aerospace Engineering Student"
                    )}
                  </div>
                </div>
              </div>
              <div className={`space-y-4 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                {content.about ? (
                  <div dangerouslySetInnerHTML={{ __html: formatText(content.about.content) }} />
                ) : (
                  <div className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} italic`}>Loading content...</div>
                )}
              </div>
            </div>
          </Window>
        )}

        {openWindows.includes("faq") && (
          <Window
            title="FAQ"
            isActive={activeWindow === "faq"}
            onClose={() => closeWindow("faq")}
            onFocus={() => focusWindow("faq")}
            initialPosition={getResponsivePosition(600, 400)}
            width={getResponsiveSize(600, 500).width}
            height={getResponsiveSize(600, 500).height}
            zIndex={getWindowZIndex("faq")}
            theme={theme}
            onSetTheme={setTheme}
          >
            <div className="p-6 h-full overflow-auto">
              <div className="flex items-center mb-6">
                <HelpCircle className="w-8 h-8 text-yellow-600 mr-3" />
                <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>{content.faq?.title || "FAQ"}</h2>
              </div>
              <div className="h-full overflow-y-auto pr-2 pb-4">
                <FaqAccordion items={faqItems.filter((item) => !item.customTabKey)} />
              </div>
            </div>
          </Window>
        )}

        {openWindows.includes("contact") && (
          <Window
            title="Contact"
            isActive={activeWindow === "contact"}
            onClose={() => closeWindow("contact")}
            onFocus={() => focusWindow("contact")}
            initialPosition={getResponsivePosition(450, 300)}
            width={getResponsiveSize(600, 500).width}
            height={getResponsiveSize(600, 500).height}
            zIndex={getWindowZIndex("contact")}
            theme={theme}
            onSetTheme={setTheme}
          >
            <div className="p-6 h-full overflow-auto">
              <div className="flex items-center mb-6">
                <Mail className="w-8 h-8 text-cyan-600 mr-3" />
                <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>Contact</h2>
              </div>

              {contactLinks.length > 0 ? (
                <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 gap-4">
                  {contactLinks.map((link) => (
                    <a
                      key={link.id}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex flex-col items-center p-3 rounded-lg transition-colors group text-center ${theme === 'dark' ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
                    >
                      <div className="w-12 h-12 mb-2 flex items-center justify-center transition-transform group-hover:scale-110">
                        {link.iconUrl ? (
                          <img src={link.iconUrl} alt={link.name} className="w-full h-full object-contain drop-shadow-sm" />
                        ) : (
                          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                            <span className={`text-xs font-bold ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{link.name[0]}</span>
                          </div>
                        )}
                      </div>
                      <span className={`text-sm font-medium group-hover:${theme === 'dark' ? 'text-white' : 'text-gray-900'} ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{link.name}</span>
                    </a>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 italic">No contact links added yet.</p>
              )}
            </div>
          </Window>
        )}

        {openWindows.includes("engineering") && (
          <Window
            title="Engineering"
            isActive={activeWindow === "engineering"}
            onClose={() => closeWindow("engineering")}
            onFocus={() => focusWindow("engineering")}
            initialPosition={getResponsivePosition(200, 100)}
            width={getResponsiveSize(600, 500).width}
            height={getResponsiveSize(600, 500).height}
            zIndex={getWindowZIndex("engineering")}
            theme={theme}
            onSetTheme={setTheme}
          >
            <div className="p-6 h-full overflow-auto">
              <div className="flex items-center mb-6">
                <Rocket className="w-8 h-8 text-orange-600 mr-3" />
                <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>Engineering Projects</h2>
              </div>
              <div className="grid grid-cols-1 gap-6">
                {getProjectsByCategory("engineering").map((project) => (
                  <div key={project.id} className={`backdrop-blur-sm border rounded-lg p-4 mb-4 ${theme === 'dark' ? 'bg-gray-800/50 border-white/10' : 'bg-white/50 border-white/30'}`}>
                    <div className="flex gap-4">
                      <div className="w-32 h-32 flex-shrink-0 relative">
                        <img
                          src={getProjectImage(project)}
                          alt={project.title}
                          className="w-full h-full object-cover rounded border transition-all duration-300"
                        />
                        {/* Show photo count indicator for easter egg */}
                        {hasMultipleImages(project) && (
                          <div className="absolute bottom-1 right-1 bg-black/60 text-white text-xs px-1.5 py-0.5 rounded">
                            {(projectImageIndex[project.id] || 0) + 1}/{[project.imageUrl, ...(project.photos || [])].filter(Boolean).length}
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        {/* Easter egg: Click title to cycle through images */}
                        <h4
                          className={`font-bold text-lg mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'} ${hasMultipleImages(project) ? 'cursor-pointer hover:text-orange-600 transition-colors' : ''}`}
                          onClick={() => {
                            const allImages = [project.imageUrl, ...(project.photos || [])].filter(Boolean)
                            cycleProjectImage(project.id, allImages.length)
                          }}
                          title={hasMultipleImages(project) ? "Click to see more images!" : undefined}
                        >
                          {project.title}
                        </h4>
                        <p className={`text-sm mb-3 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{project.description}</p>
                        {project.projectLink && (
                          <div className="mb-3">
                            <a
                              href={project.projectLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 text-sm underline"
                            >
                              🔗 View Project
                            </a>
                          </div>
                        )}
                        {project.keywords && project.keywords.length > 0 && (
                          <div className="mb-3">
                            <p className={`text-xs mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Keywords:</p>
                            <div className="flex flex-wrap gap-1">
                              {project.keywords.map((keyword, index) => (
                                <span key={index} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                                  {keyword}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        <div className="flex flex-wrap gap-2">
                          {project.tags.map((tag, index) => (
                            <span key={index} className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Window>
        )}

        {openWindows.includes("games") && (
          <Window
            title="Games"
            isActive={activeWindow === "games"}
            onClose={() => closeWindow("games")}
            onFocus={() => focusWindow("games")}
            initialPosition={getResponsivePosition(300, 200)}
            width={getResponsiveSize(600, 500).width}
            height={getResponsiveSize(600, 500).height}
            zIndex={getWindowZIndex("games")}
            theme={theme}
            onSetTheme={setTheme}
          >
            <div className="p-6 h-full overflow-auto">
              <div className="flex items-center mb-6">
                <Gamepad2 className="w-8 h-8 text-green-600 mr-3" />
                <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>Game Projects</h2>
              </div>
              <div className="grid grid-cols-1 gap-6">
                {getProjectsByCategory("games").map((project) => (
                  <div key={project.id} className={`backdrop-blur-sm border rounded-lg p-4 mb-4 ${theme === 'dark' ? 'bg-gray-800/50 border-white/10' : 'bg-white/50 border-white/30'}`}>
                    <div className="flex gap-4">
                      <div className="w-32 h-32 flex-shrink-0 relative">
                        <img
                          src={getProjectImage(project)}
                          alt={project.title}
                          className="w-full h-full object-cover rounded border transition-all duration-300"
                        />
                        {hasMultipleImages(project) && (
                          <div className="absolute bottom-1 right-1 bg-black/60 text-white text-xs px-1.5 py-0.5 rounded">
                            {(projectImageIndex[project.id] || 0) + 1}/{[project.imageUrl, ...(project.photos || [])].filter(Boolean).length}
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h4
                          className={`font-bold text-lg mb-2 ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'} ${hasMultipleImages(project) ? 'cursor-pointer hover:text-green-600 transition-colors' : ''}`}
                          onClick={() => {
                            const allImages = [project.imageUrl, ...(project.photos || [])].filter(Boolean)
                            cycleProjectImage(project.id, allImages.length)
                          }}
                          title={hasMultipleImages(project) ? "Click to see more images!" : undefined}
                        >
                          {project.title}
                        </h4>
                        <p className={`text-sm mb-3 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{project.description}</p>
                        {project.projectLink && (
                          <div className="mb-3">
                            <a
                              href={project.projectLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 text-sm underline"
                            >
                              🔗 View Project
                            </a>
                          </div>
                        )}
                        {project.keywords && project.keywords.length > 0 && (
                          <div className="mb-3">
                            <p className={`text-xs mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Keywords:</p>
                            <div className="flex flex-wrap gap-1">
                              {project.keywords.map((keyword, index) => (
                                <span key={index} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                                  {keyword}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        <div className="flex flex-wrap gap-2">
                          {project.tags.map((tag, index) => (
                            <span key={index} className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Window>
        )}

        {openWindows.includes("art") && (
          <Window
            title="Art"
            isActive={activeWindow === "art"}
            onClose={() => closeWindow("art")}
            onFocus={() => focusWindow("art")}
            initialPosition={getResponsivePosition(400, 250)}
            width={getResponsiveSize(600, 500).width}
            height={getResponsiveSize(600, 500).height}
            zIndex={getWindowZIndex("art")}
            theme={theme}
            onSetTheme={setTheme}
          >
            <div className="p-6 h-full overflow-hidden flex flex-col">
              <div className="flex items-center mb-6 flex-none">
                <Palette className="w-8 h-8 text-purple-600 mr-3" />
                <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>Art Gallery</h2>
              </div>
              <div className="flex-1 overflow-auto pr-2">
                <ArtGallery projects={getProjectsByCategory("art")} />
              </div>
            </div>
          </Window>
        )}

        {windows
          .filter((w) => w.type === "custom")
          .map((w) =>
            openWindows.includes(w.key) ? (
              <Window
                key={w.key}
                title={w.label}
                isActive={activeWindow === w.key}
                onClose={() => closeWindow(w.key)}
                onFocus={() => focusWindow(w.key)}
                initialPosition={getResponsivePosition(300, 200)}
                width={getResponsiveSize(w.layout === "projects" || w.layout === "gallery" ? 600 : 500, w.layout === "projects" || w.layout === "gallery" ? 500 : 400).width}
                height={getResponsiveSize(w.layout === "projects" || w.layout === "gallery" ? 600 : 500, w.layout === "projects" || w.layout === "gallery" ? 500 : 400).height}
                zIndex={getWindowZIndex(w.key)}
                theme={theme}
                onSetTheme={setTheme}
              >
                {w.layout === "gallery" ? (
                  <div className="p-6 h-full overflow-hidden flex flex-col">
                    <div className="flex items-center mb-6 flex-none">
                      {w.customIconUrl ? (
                        <img src={w.customIconUrl} alt={w.label} className="w-8 h-8 mr-3 object-contain" />
                      ) : (
                        <WindowIcon window={w} variant="colored" className="w-8 h-8 mr-3" />
                      )}
                      <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}>{w.label}</h2>
                    </div>
                    <div className="flex-1 overflow-auto pr-2">
                      <ArtGallery
                        projects={projects
                          .filter((p) => p.isActive && p.customTabKey === w.key)
                          .sort((a, b) => a.orderIndex - b.orderIndex)
                        }
                      />
                    </div>
                  </div>
                ) : w.layout === "projects" ? (
                  <div className="p-6 h-full overflow-auto">
                    <div className="flex items-center mb-6">
                      {w.customIconUrl ? (
                        <img src={w.customIconUrl} alt={w.label} className="w-8 h-8 mr-3 object-contain" />
                      ) : (
                        <WindowIcon window={w} variant="colored" className="w-8 h-8 mr-3" />
                      )}
                      <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}>{w.label}</h2>
                    </div>
                    <div className="grid grid-cols-1 gap-6">
                      {projects
                        .filter((p) => p.isActive && p.customTabKey === w.key)
                        .sort((a, b) => a.orderIndex - b.orderIndex)
                        .map((project) => (
                          <div key={project.id} className={`backdrop-blur-sm border rounded-lg p-4 mb-4 ${theme === 'dark' ? 'bg-gray-800/50 border-white/10' : 'bg-white/50 border-white/30'}`}>
                            <div className="flex gap-4">
                              <div className="w-32 h-32 flex-shrink-0">
                                <img
                                  src={project.imageUrl || "/placeholder.jpg"}
                                  alt={project.title}
                                  className="w-full h-full object-cover rounded border"
                                />
                              </div>
                              <div className="flex-1">
                                <h4 className={`font-bold text-lg mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>{project.title}</h4>
                                <p className={`text-sm mb-3 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{project.description}</p>
                                {project.projectLink && (
                                  <div className="mb-3">
                                    <a
                                      href={project.projectLink}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-blue-600 hover:text-blue-800 text-sm underline"
                                    >
                                      🔗 View Project
                                    </a>
                                  </div>
                                )}
                                {project.keywords && project.keywords.length > 0 && (
                                  <div className="mb-3">
                                    <p className={`text-xs mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Keywords:</p>
                                    <div className="flex flex-wrap gap-1">
                                      {project.keywords.map((keyword, index) => (
                                        <span key={index} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                                          {keyword}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                <div className="flex flex-wrap gap-2">
                                  {project.tags.map((tag, index) => (
                                    <span key={index} className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                              </div>
                              {project.photos && project.photos.length > 0 && (
                                <div className="w-32 space-y-2">
                                  <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Photos:</p>
                                  <div className="space-y-2">
                                    {project.photos.slice(0, 3).map((photo, index) => (
                                      <img
                                        key={index}
                                        src={photo}
                                        alt={`${project.title} photo ${index + 1}`}
                                        className="w-full h-20 object-cover rounded border"
                                      />
                                    ))}
                                    {project.photos.length > 3 && (
                                      <div className={`text-xs text-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                        +{project.photos.length - 3} more
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      {projects.filter((p) => p.isActive && p.customTabKey === w.key).length === 0 && (
                        <div className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} italic`}>No projects available.</div>
                      )}
                    </div>
                  </div>
                ) : w.layout === "faq" ? (
                  <div className="p-6 h-full overflow-hidden flex flex-col">
                    <div className="flex items-center mb-6 flex-none">
                      {w.customIconUrl ? (
                        <img src={w.customIconUrl} alt={w.label} className="w-8 h-8 mr-3 object-contain" />
                      ) : (
                        <WindowIcon window={w} variant="colored" className="w-8 h-8 mr-3" />
                      )}
                      <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}>{w.label}</h2>
                    </div>
                    <div className="flex-1 overflow-y-auto pr-2 pb-4">
                      <FaqAccordion items={faqItems.filter((item) => item.customTabKey === w.key)} />
                    </div>
                  </div>
                ) : (
                  <div className="p-6 h-full overflow-auto">
                    <div className="flex items-center mb-6">
                      {w.customIconUrl ? (
                        <img src={w.customIconUrl} alt={w.label} className="w-8 h-8 mr-3 object-contain" />
                      ) : (
                        <WindowIcon window={w} variant="colored" className="w-8 h-8 mr-3" />
                      )}
                      <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}>{w.label}</h2>
                    </div>
                    <div className={`text-sm space-y-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {w.content ? (
                        <div dangerouslySetInnerHTML={{ __html: formatText(w.content) }} />
                      ) : (
                        <p className={`italic ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>No content set yet for this window.</p>
                      )}
                    </div>
                  </div>
                )}
              </Window>
            ) : null
          )}
      </div>
    </div>
  )
}
