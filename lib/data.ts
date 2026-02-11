
import fs from "fs"
import path from "path"

export interface WindowConfig {
  id: number
  key: string
  label: string
  type: "builtIn" | "custom"
  content?: string
  layout?: "content" | "projects" | "gallery" | "faq"
  showOnDesktop: boolean
  showInHome: boolean
  orderDesktop: number
  orderHome: number
  isHidden: boolean
  icon?: string
  customIconUrl?: string
  isArchived?: boolean
}

export interface Project {
  id: number
  title: string
  description: string
  category: "engineering" | "games" | "art"
  imageUrl?: string
  projectLink?: string
  tags: string[]
  photos: string[]
  keywords: string[]
  orderIndex: number
  isActive: boolean
  customTabKey?: string
}

export interface SiteConfig {
  title: string
  faviconUrl?: string
}

export function getSiteConfig(): SiteConfig {
  const defaultConfig: SiteConfig = {
    title: "Shubu",
  }
  return readJsonFile<SiteConfig>("site-config.json", defaultConfig)
}

export function saveSiteConfig(config: SiteConfig): void {
  writeJsonFile("site-config.json", config)
}

export interface Content {
  section: string
  title: string
  content: string
  imageUrl?: string
}

export interface ContentEntry {
  section: string
  title: string
  content: string
  imageUrl?: string
}

export interface FaqItem {
  id: number
  question: string
  answer: string
  order: number
  isActive: boolean
  customTabKey?: string
}

export interface BackgroundStyle {
  type: "solid" | "gradient" | "image"
  color: string
  from: string
  via: string
  to: string
  overlay?: boolean
  imageUrl?: string
  iconColor?: string
}

export interface BackgroundConfig {
  desktop: BackgroundStyle
  mobile: BackgroundStyle
}

// Default data functions
export const defaultWindows = (): WindowConfig[] => [
  {
    id: 1,
    key: "about",
    label: "about",
    type: "builtIn",
    showOnDesktop: false,
    showInHome: true,
    orderDesktop: 1,
    orderHome: 1,
    isHidden: false,
    icon: "user",
  },
  {
    id: 2,
    key: "engineering",
    label: "engineering",
    type: "builtIn",
    showOnDesktop: true,
    showInHome: true,
    orderDesktop: 2,
    orderHome: 2,
    isHidden: false,
    icon: "rocket",
    layout: "projects",
  },
  {
    id: 3,
    key: "games",
    label: "games",
    type: "builtIn",
    showOnDesktop: true,
    showInHome: true,
    orderDesktop: 3,
    orderHome: 3,
    isHidden: false,
    icon: "gamepad2",
    layout: "projects",
  },
  {
    id: 4,
    key: "art",
    label: "art",
    type: "builtIn",
    showOnDesktop: true,
    showInHome: true,
    orderDesktop: 4,
    orderHome: 4,
    isHidden: false,
    icon: "palette",
    layout: "gallery",
  },
  {
    id: 5,
    key: "contact",
    label: "contact",
    type: "builtIn",
    showOnDesktop: false,
    showInHome: true,
    orderDesktop: 5,
    orderHome: 5,
    isHidden: false,
    icon: "mail",
  },
  {
    id: 6,
    key: "faq",
    label: "faq",
    type: "builtIn",
    showOnDesktop: false,
    showInHome: true,
    orderDesktop: 6,
    orderHome: 6,
    isHidden: false,
    icon: "help-circle",
    layout: "faq",
  },
]

// Data Access Layer

const DATA_DIR = path.join(process.cwd(), "data")

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true })
  }
}

function readJsonFile<T>(filename: string, defaultValue: T): T {
  ensureDataDir()
  const filePath = path.join(DATA_DIR, filename)
  if (!fs.existsSync(filePath)) {
    return defaultValue
  }
  try {
    const data = fs.readFileSync(filePath, "utf-8")
    return JSON.parse(data) as T
  } catch (error) {
    console.error(`Error reading ${filename}:`, error)
    return defaultValue
  }
}

function writeJsonFile<T>(filename: string, data: T): void {
  ensureDataDir()
  const filePath = path.join(DATA_DIR, filename)
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8")
  } catch (error) {
    console.error(`Error writing ${filename}:`, error)
  }
}

// Windows
export function getWindows(): WindowConfig[] {
  const windows = readJsonFile<WindowConfig[]>("windows.json", [])
  if (windows.length === 0) {
    return defaultWindows()
  }
  return windows
}

export function saveWindows(windows: WindowConfig[]): void {
  writeJsonFile("windows.json", windows)
}

// Projects
export function getProjects(): Project[] {
  return readJsonFile<Project[]>("projects.json", [])
}

export function saveProjects(projects: Project[]): void {
  writeJsonFile("projects.json", projects)
}

// Content
export function getContent(section?: string): Record<string, Content> | Content | null {
  const allContentArray = readJsonFile<ContentEntry[]>("content.json", [])
  if (section) {
    const entry = allContentArray.find(c => c.section === section)
    return entry || null
  }
  const contentMap: Record<string, Content> = {}
  allContentArray.forEach(entry => {
    contentMap[entry.section] = entry
  })
  return contentMap
}

export function saveContent(contentEntry: Content): void {
  const allContentArray = readJsonFile<ContentEntry[]>("content.json", [])
  const index = allContentArray.findIndex(c => c.section === contentEntry.section)
  if (index !== -1) {
    allContentArray[index] = { ...allContentArray[index], ...contentEntry }
  } else {
    allContentArray.push(contentEntry)
  }
  writeJsonFile("content.json", allContentArray)
}

// Alias for API compatibility
export const updateContent = (section: string, title: string, content: string, imageUrl?: string) => {
  const entry: Content = { section, title, content, imageUrl }
  saveContent(entry)
}


// FAQ
export function getFaqItems(): FaqItem[] {
  return readJsonFile<FaqItem[]>("faq.json", [])
}

export interface FaqItem {
  id: number
  question: string
  answer: string
  order: number
  isActive: boolean
  customTabKey?: string
}

export interface ContactLink {
  id: number
  name: string
  url: string
  iconUrl: string
  order: number
  isActive: boolean
  showOnDesktop?: boolean
}

// ... (existing code)

export function saveFaqItems(items: FaqItem[]): void {
  writeJsonFile("faq.json", items)
}

// Contact Links
export function getContactLinks(): ContactLink[] {
  return readJsonFile<ContactLink[]>("contact_links.json", [])
}

export function saveContactLinks(links: ContactLink[]): void {
  writeJsonFile("contact_links.json", links)
}

// Background
export function getBackground(): BackgroundConfig {
  const data = readJsonFile<any>("background.json", null)

  const defaultStyle: BackgroundStyle = {
    type: "gradient",
    color: "#2563eb",
    from: "#60a5fa",
    via: "#3b82f6",
    to: "#2563eb",
    overlay: true
  }

  if (!data) {
    return {
      desktop: defaultStyle,
      mobile: defaultStyle
    }
  }

  // Migration: If it's the old format (has 'type' at root), move it to desktop and copy to mobile
  if (data.type && typeof data.type === 'string') {
    return {
      desktop: data as BackgroundStyle,
      mobile: data as BackgroundStyle
    }
  }

  // New format
  return {
    desktop: data.desktop || defaultStyle,
    mobile: data.mobile || defaultStyle
  }
}

export function saveBackground(config: BackgroundConfig): void {
  writeJsonFile("background.json", config)
}

// Alias for API
export const updateBackground = saveBackground;
