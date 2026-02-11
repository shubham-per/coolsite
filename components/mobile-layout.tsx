"use client"

import { useState, useEffect } from "react"
import { User, Rocket, Gamepad2, Palette, Mail, HelpCircle, FolderOpen, MessageCircle, Youtube, Sun, Moon } from "lucide-react"
import { WindowIcon } from "@/components/window-icon"
import AnalyticsTracker from "@/components/analytics-tracker"
import { ArtGallery } from "@/components/art-gallery"
import { FaqAccordion, FaqItem } from "@/components/faq-accordion"
import { Project } from "@/lib/db"
import { formatText } from "@/lib/format"

interface Content {
  id: number
  section: string
  title: string
  content: string
  imageUrl?: string
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
}

interface MobileLayoutProps {
  theme?: 'light' | 'dark'
  onSetTheme?: (theme: 'light' | 'dark') => void
}

export default function MobileLayout({ theme = 'light', onSetTheme }: MobileLayoutProps) {
  const [activeSection, setActiveSection] = useState<string | null>(null)
  const [content, setContent] = useState<Record<string, Content>>({})
  const [projects, setProjects] = useState<ExtendedProject[]>([])
  const [faqItems, setFaqItems] = useState<FaqItem[]>([])
  const [windows, setWindows] = useState<WindowConfig[]>([])
  const [background, setBackground] = useState<BackgroundConfig | null>(null)
  const [contactLinks, setContactLinks] = useState<ContactLink[]>([])
  const [loading, setLoading] = useState(true)

  // Load content from admin panel
  useEffect(() => {
    const loadContent = async () => {
      try {
        // Load content sections
        const sections = ["about", "contact", "faq", "home_greeting", "home_subtitle"]
        const contentData: Record<string, Content> = {}

        for (const section of sections) {
          const res = await fetch(`/api/content?section=${section}`, { cache: "no-store" })
          const data = await res.json()
          if (data) contentData[section] = data
        }
        setContent(contentData)

        // Load projects
        const projectsRes = await fetch("/api/projects", { cache: "no-store" })
        const projectsData = await projectsRes.json()
        setProjects(projectsData)

        // Load FAQ
        const faqRes = await fetch("/api/faq", { cache: "no-store" })
        if (faqRes.ok) {
          const faqData = await faqRes.json()
          setFaqItems(faqData)
        }

        // Load windows
        const winRes = await fetch("/api/windows", { cache: "no-store" })
        if (winRes.ok) {
          const winData = await winRes.json()
          setWindows(winData)
        }

        // Load background
        const bgRes = await fetch("/api/background", { cache: "no-store" })
        if (bgRes.ok) {
          const bgData = await bgRes.json()
          setBackground(bgData)
        }

        // Load contact links
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

  const handleIconClick = (section: string) => {
    setActiveSection(section)
  }

  const handleBack = () => {
    setActiveSection(null)
  }

  const getProjectsByCategory = (category: "engineering" | "games" | "art") => {
    return projects.filter(project => project.category === category)
  }

  const getBackgroundStyle = () => {
    // Default fallback
    const defaultStyle = {
      background: "linear-gradient(to bottom, #60a5fa, #3b82f6, #2563eb)",
    }

    if (!background) return { style: defaultStyle, className: "", iconColor: "white" }

    const mobileBg = background.mobile || { type: "gradient", color: "#2563eb", from: "#60a5fa", via: "#3b82f6", to: "#2563eb", overlay: true };
    const iconColor = mobileBg.iconColor || "white";

    if (mobileBg.type === "solid") {
      return { style: { backgroundColor: mobileBg.color }, className: "", iconColor }
    }
    if (mobileBg.type === "gradient") {
      const from = mobileBg.from || "#60a5fa"
      const via = mobileBg.via || "#3b82f6"
      const to = mobileBg.to || "#2563eb"
      return {
        style: { backgroundImage: `linear-gradient(to bottom, ${from}, ${via}, ${to})` },
        className: "",
        iconColor
      }
    }
    // Image
    return {
      style: {
        backgroundImage: `url(${mobileBg.imageUrl})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      },
      className: "",
      iconColor
    }
  }

  const bgProps = getBackgroundStyle()

  /* renderIcon removed - using WindowIcon component */

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-400 via-blue-500 to-blue-600 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    )
  }

  if (activeSection) {
    return (
      <div
        className={`min-h-screen relative overflow-y-auto flex flex-col ${bgProps.className} ${theme === 'dark' ? 'dark' : ''}`}
        style={bgProps.style}
      >
        <AnalyticsTracker page={activeSection} />
        {/* Windows 7 style background pattern */}
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1)_0%,transparent_50%)]"></div>
        </div>

        {/* Header */}
        <div className="bg-black/20 backdrop-blur-md border-b border-white/20 p-4 flex items-center sticky top-0 z-20">
          <button
            onClick={handleBack}
            className="text-white mr-4 bg-white/20 backdrop-blur-sm px-3 py-1 rounded border border-white/30 hover:bg-white/30 transition-all duration-200"
          >
            ← Back
          </button>
          <h1 className="text-lg font-semibold capitalize text-white drop-shadow-sm flex-1">
            {windows.find(w => w.key === activeSection)?.label || activeSection}
          </h1>
          {onSetTheme && (
            <button
              onClick={() => onSetTheme(theme === 'dark' ? 'light' : 'dark')}
              className="ml-2 bg-white/20 backdrop-blur-sm p-2 rounded border border-white/30 hover:bg-white/30 transition-all duration-200 text-white"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 p-4">
          {activeSection === "about" && content.about && (
            <div className="space-y-4">
              <div className="bg-white/90 dark:bg-gray-900/95 backdrop-blur-sm rounded-lg p-6 border border-white/30 dark:border-white/10 shadow-lg">
                <div className="flex items-center mb-4">
                  <div className="w-16 h-16 bg-white/20 dark:bg-white/10 backdrop-blur-sm rounded mr-4 flex items-center justify-center border border-white/30 dark:border-white/10 overflow-hidden">
                    {content.about.imageUrl ? (
                      <img src={content.about.imageUrl} alt={content.about.title} className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-8 h-8 text-gray-700 dark:text-gray-300" />
                    )}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white">{content.about.title}</h2>
                    <p className="text-gray-600 dark:text-gray-300">Final Year Aerospace Engineering Student</p>
                  </div>
                </div>
                <div className="text-sm text-gray-700 dark:text-gray-100 leading-relaxed" dangerouslySetInnerHTML={{ __html: formatText(content.about.content) }} />
              </div>
            </div>
          )}

          {activeSection === "contact" && (
            <div className="space-y-4">
              <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg p-6 border border-white/30 shadow-lg">
                <div className="flex items-center mb-4">
                  <Mail className="w-8 h-8 text-cyan-600 mr-3" />
                  <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Contact</h2>
                </div>

                {/* Contact Links from Admin Panel */}
                {contactLinks.length > 0 ? (
                  <div className="grid grid-cols-3 gap-4">
                    {contactLinks
                      .sort((a, b) => a.order - b.order)
                      .map((link) => (
                        <a
                          key={link.id}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex flex-col items-center p-3 rounded-lg hover:bg-gray-100 transition-colors group text-center"
                        >
                          <div className="w-12 h-12 mb-2 flex items-center justify-center transition-transform group-hover:scale-110">
                            {link.iconUrl ? (
                              <img src={link.iconUrl} alt={link.name} className="w-full h-full object-contain drop-shadow-sm" />
                            ) : (
                              <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                                <span className="text-xs font-bold text-gray-500 dark:text-gray-400">{link.name[0]}</span>
                              </div>
                            )}
                          </div>
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-200 group-hover:text-gray-900 dark:group-hover:text-white">{link.name}</span>
                        </a>
                      ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 italic">No contact links added yet.</p>
                )}
              </div>
            </div>
          )}

          {activeSection === "faq" && content.faq && (
            <div className="space-y-4">
              <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg p-6 border border-white/30 shadow-lg">
                <div className="flex items-center mb-4">
                  <HelpCircle className="w-8 h-8 text-yellow-600 mr-3" />
                  <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">{content.faq.title}</h2>
                </div>
                <FaqAccordion items={faqItems.filter((item) => !item.customTabKey)} />
              </div>
            </div>
          )}

          {activeSection === "engineering" && (
            <div className="space-y-4">
              <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg p-4 border border-white/30 shadow-lg">
                <div className="flex items-center mb-4">
                  <Rocket className="w-8 h-8 text-orange-600 mr-3" />
                  <h3 className="font-semibold text-gray-800 dark:text-gray-100">Engineering Projects</h3>
                </div>
                <div className="space-y-4">
                  {getProjectsByCategory("engineering").map((project) => (
                    <div key={project.id} className="bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm border border-white/30 rounded-lg p-4">
                      {/* Project Image */}
                      {project.imageUrl && (
                        <div className="mb-3 rounded-lg overflow-hidden">
                          <img
                            src={project.imageUrl}
                            alt={project.title}
                            className="w-full h-40 object-cover"
                          />
                        </div>
                      )}
                      <h4 className="font-bold text-lg mb-2 text-gray-800 dark:text-gray-100">{project.title}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">{project.description}</p>

                      {/* Project link */}
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

                      {/* Keywords */}
                      {project.keywords && project.keywords.length > 0 && (
                        <div className="mb-3">
                          <p className="text-xs text-gray-500 mb-1">Keywords:</p>
                          <div className="flex flex-wrap gap-1">
                            {project.keywords.map((keyword, index) => (
                              <span key={index} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                                {keyword}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Tags */}
                      <div className="flex flex-wrap gap-2">
                        {project.tags.map((tag, index) => (
                          <span key={index} className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeSection === "games" && (
            <div className="space-y-4">
              <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg p-4 border border-white/30 shadow-lg">
                <div className="flex items-center mb-4">
                  <Gamepad2 className="w-8 h-8 text-green-600 mr-3" />
                  <h3 className="font-semibold text-gray-800 dark:text-gray-100">Game Projects</h3>
                </div>
                <div className="space-y-4">
                  {getProjectsByCategory("games").map((project) => (
                    <div key={project.id} className="bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm border border-white/30 rounded-lg p-4">
                      {/* Project Image */}
                      {project.imageUrl && (
                        <div className="mb-3 rounded-lg overflow-hidden">
                          <img
                            src={project.imageUrl}
                            alt={project.title}
                            className="w-full h-40 object-cover"
                          />
                        </div>
                      )}
                      <h4 className="font-bold text-lg mb-2 text-gray-800 dark:text-gray-100">{project.title}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">{project.description}</p>

                      {/* Project link */}
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

                      {/* Keywords */}
                      {project.keywords && project.keywords.length > 0 && (
                        <div className="mb-3">
                          <p className="text-xs text-gray-500 mb-1">Keywords:</p>
                          <div className="flex flex-wrap gap-1">
                            {project.keywords.map((keyword, index) => (
                              <span key={index} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                                {keyword}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Tags */}
                      <div className="flex flex-wrap gap-2">
                        {project.tags.map((tag, index) => (
                          <span key={index} className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeSection === "art" && (
            <div className="space-y-4">
              <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg p-4 border border-white/30 shadow-lg">
                <div className="flex items-center mb-4">
                  <Palette className="w-8 h-8 text-purple-600 mr-3" />
                  <h3 className="font-semibold text-gray-800 dark:text-gray-100">Art Gallery</h3>
                </div>
                <ArtGallery projects={getProjectsByCategory("art")} />
              </div>
            </div>
          )}

          {/* Dynamic Content Rendering for Custom Tabs */}
          {windows.find(w => w.key === activeSection && w.type === 'custom') && (
            (() => {
              const w = windows.find(w => w.key === activeSection)!
              return (
                <div className="space-y-4">
                  <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg p-6 border border-white/30 shadow-lg">
                    <div className="flex items-center mb-4">
                      {w.customIconUrl ? (
                        <img src={w.customIconUrl} alt={w.label} className="w-8 h-8 mr-3 object-contain" />
                      ) : (
                        <WindowIcon window={w} variant="colored" className="w-8 h-8 mr-3" />
                      )}
                      <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">{w.label}</h2>
                    </div>

                    {w.layout === 'gallery' ? (
                      <ArtGallery
                        projects={projects
                          .filter((p) => p.isActive && p.customTabKey === w.key)
                          .sort((a, b) => a.orderIndex - b.orderIndex)
                        }
                      />
                    ) : w.layout === 'projects' ? (
                      <div className="space-y-4">
                        {projects.filter((p) => p.isActive && p.customTabKey === w.key).map((project) => (
                          <div key={project.id} className="bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm border border-white/30 rounded-lg p-4">
                            {/* Project Image */}
                            {project.imageUrl && (
                              <div className="mb-3 rounded-lg overflow-hidden">
                                <img
                                  src={project.imageUrl}
                                  alt={project.title}
                                  className="w-full h-40 object-cover"
                                />
                              </div>
                            )}
                            <h4 className="font-bold text-lg mb-2 text-gray-800 dark:text-gray-100">{project.title}</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">{project.description}</p>
                            {project.projectLink && (
                              <div className="mb-3">
                                <a href={project.projectLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 text-sm underline">🔗 View Project</a>
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
                        ))}
                        {projects.filter((p) => p.isActive && p.customTabKey === w.key).length === 0 && (
                          <div className="text-gray-500 italic">No projects available.</div>
                        )}
                      </div>
                    ) : w.layout === 'faq' ? (
                      <div className="space-y-4">
                        <FaqAccordion items={faqItems.filter((item) => item.customTabKey === w.key)} />
                      </div>
                    ) : (
                      <div className="text-sm text-gray-700 dark:text-gray-200" dangerouslySetInnerHTML={{ __html: formatText(w.content || "") }} />
                    )}
                  </div>
                </div>
              )
            })()
          )}
        </div>
      </div>
    )
  }



  return (
    <div
      className={`min-h-screen relative overflow-y-auto ${bgProps.className} ${theme === 'dark' ? 'dark' : ''}`}
      style={bgProps.style}
    >
      <AnalyticsTracker page="home" />
      {/* Windows 7 style background pattern */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1)_0%,transparent_50%)]"></div>
      </div>

      {/* Header */}
      <div className="relative z-10 p-6 pt-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2 drop-shadow-sm">
            {content.home_greeting ? (
              <span dangerouslySetInnerHTML={{ __html: formatText(content.home_greeting.content) }} />
            ) : (
              <>hi! i'm <span className="text-blue-200">shubham</span></>
            )}
          </h1>
          <div className="text-blue-100 text-lg drop-shadow-sm">
            {content.home_subtitle ? (
              <span dangerouslySetInnerHTML={{ __html: formatText(content.home_subtitle.content) }} />
            ) : (
              "aerospace engineer, game developer, and digital artist"
            )}
          </div>
        </div>

        {/* Theme Toggle in Home Header */}
        <div className="absolute top-4 right-4">
          {onSetTheme && (
            <button
              onClick={() => onSetTheme(theme === 'dark' ? 'light' : 'dark')}
              className="bg-white/20 backdrop-blur-sm p-2 rounded-full border border-white/30 hover:bg-white/30 transition-all duration-200 text-white"
            >
              {theme === 'dark' ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
            </button>
          )}
        </div>

        {/* Grid of sections */}
        <div className="grid grid-cols-2 gap-4">
          {/* Default/Built-in items that should always show if they are in the windows list. 
              The windows list comes from the DB which includes built-ins.
              So we just map the windows list. */}
          {windows
            .filter((w) => !w.isHidden && w.showInHome)
            .sort((a, b) => a.orderHome - b.orderHome)
            .map((w) => (
              <button
                key={w.id}
                onClick={() => handleIconClick(w.key)}
                className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg p-6 hover:bg-white/30 transition-all duration-200 flex flex-col items-center"
              >
                <WindowIcon window={w} variant="white" className="w-12 h-12 mb-3" />
                <span className="font-medium" style={{ color: bgProps.iconColor || "white" }}>{w.label}</span>
              </button>
            ))}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-white/80 text-sm">© {new Date().getFullYear()} Shubham Ranabhat</p>
        </div>
      </div>
    </div>
  )
}
