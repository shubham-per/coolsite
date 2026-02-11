"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FaqAccordion } from "@/components/faq-accordion"
import { ArchivedManager } from "@/components/archived-manager"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts"
import {
  Settings,
  FileText,
  BarChart3,
  Plus,
  Edit,
  Trash2,
  Save,
  LogOut,
  Eye,
  Users,
  MousePointer,
  Wrench,
  Gamepad2,
  Palette,
  User,
  Mail,
  HelpCircle,
  FolderOpen,
} from "lucide-react"
import { deriveDefaultIcon } from "@/lib/icon-utils"

interface Project {
  id: number
  title: string
  description: string
  category: "engineering" | "games" | "art"
  image_url?: string
  photos: string[]
  keywords: string[]
  projectLink?: string
  tags: string[]
  order_index: number
  is_active: boolean
  customTabKey?: string // For custom tab projects
}

interface Content {
  id: number
  section: string
  title: string
  content: string
  imageUrl?: string
  customTabKey?: string
}
interface Analytics {
  pageViews: { page: string; views: number }[]
  dailyVisits: { date: string; unique_visitors: number; total_views: number }[]
  topReferrers: { referrer: string; visits: number }[]
}

interface FaqItem {
  id: number
  question: string
  answer: string
  order: number
  isActive: boolean
  customTabKey?: string
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
  isArchived?: boolean
}

interface ContactLink {
  id: number
  name: string
  url: string
  iconUrl: string
  order: number
  isActive: boolean
}

export default function AdminPanel() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loginForm, setLoginForm] = useState({ email: "", password: "" })
  const [projects, setProjects] = useState<Project[]>([])
  const [content, setContent] = useState<Record<string, Content>>({})
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [faqItems, setFaqItems] = useState<FaqItem[]>([])
  const [background, setBackground] = useState<BackgroundConfig | null>(null)
  const [windows, setWindows] = useState<WindowConfig[]>([])
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [editingContent, setEditingContent] = useState<Content | null>(null)
  const [editingFaq, setEditingFaq] = useState<FaqItem | null>(null)
  const [isProjectDialogOpen, setIsProjectDialogOpen] = useState(false)
  const [isContentDialogOpen, setIsContentDialogOpen] = useState(false)
  const [isFaqDialogOpen, setIsFaqDialogOpen] = useState(false)
  const [contactLinks, setContactLinks] = useState<ContactLink[]>([])
  const [editingContactLink, setEditingContactLink] = useState<ContactLink | null>(null)
  const [isContactLinkDialogOpen, setIsContactLinkDialogOpen] = useState(false)

  useEffect(() => {
    checkAuth()
  }, [])

  useEffect(() => {
    if (isAuthenticated) {
      loadData()
    }
  }, [isAuthenticated])

  const checkAuth = async () => {
    try {
      const response = await fetch("/api/auth/check")
      setIsAuthenticated(response.ok)
    } catch {
      setIsAuthenticated(false)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginForm),
      })

      if (response.ok) {
        setIsAuthenticated(true)
        setLoginForm({ email: "", password: "" })
      } else {
        alert("Invalid credentials")
      }
    } catch (error) {
      alert("Login failed")
    }
  }

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" })
    setIsAuthenticated(false)
  }

  const loadData = async () => {
    try {
      // Load projects
      const projectsRes = await fetch("/api/projects", { cache: "no-store" })
      const rawProjects = await projectsRes.json()
      const projectsData: Project[] = rawProjects.map((p: any) => ({
        ...p,
        photos: Array.isArray(p.photos) ? p.photos : [],
        keywords: Array.isArray(p.keywords) ? p.keywords : [],
        tags: Array.isArray(p.tags) ? p.tags : [],
      }))
      setProjects(projectsData)

      // Load content
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

      // Load analytics
      const analyticsRes = await fetch("/api/analytics", { cache: "no-store" })
      const analyticsData = await analyticsRes.json()
      setAnalytics(analyticsData)

      // Load contact links
      const linksRes = await fetch("/api/contact-links")
      if (linksRes.ok) {
        const linksData = await linksRes.json()
        setContactLinks(linksData)
      }

      // Load FAQ items
      const faqRes = await fetch("/api/faq", { cache: "no-store" })
      if (faqRes.ok) {
        const faqData = await faqRes.json()
        setFaqItems(faqData)
      }

      // Load background config
      const bgRes = await fetch("/api/background", { cache: "no-store" })
      if (bgRes.ok) {
        const bgData = await bgRes.json()
        setBackground(bgData)
      }

      // Load window config
      const winRes = await fetch("/api/windows", { cache: "no-store" })
      if (winRes.ok) {
        const winData = await winRes.json()
        setWindows(winData)
      }
    } catch (error) {
      console.error("Failed to load data:", error)
    }
  }

  const handleSaveProject = async (payload: { project: Omit<Project, "id"> & { id?: number }; mainImageFile?: File | null }) => {
    const { project, mainImageFile } = payload
    try {
      const method = project.id ? "PUT" : "POST"
      let response: Response

      if (mainImageFile) {
        const formData = new FormData()
        Object.entries(project).forEach(([key, value]) => {
          if (value === undefined || value === null) return
          // Skip id if it's 0 (new project)
          if (key === "id" && !value) return
          // Map snake_case to camelCase
          let finalKey = key
          if (key === "image_url") finalKey = "imageUrl"
          if (key === "order_index") finalKey = "orderIndex"
          if (key === "is_active") finalKey = "isActive"

          if (Array.isArray(value)) {
            formData.append(finalKey, JSON.stringify(value))
          } else {
            formData.append(finalKey, String(value))
          }
        })
        formData.append("image", mainImageFile)

        response = await fetch("/api/projects", {
          method,
          body: formData,
        })
      } else {
        // Map snake_case -> camelCase for JSON payload
        const payloadJson: any = { ...project }
        // Don't send id when creating new project (id=0 or undefined)
        if (!payloadJson.id) {
          delete payloadJson.id
        }
        if ("image_url" in payloadJson) {
          payloadJson.imageUrl = payloadJson.image_url
          delete payloadJson.image_url
        }
        if ("order_index" in payloadJson) {
          payloadJson.orderIndex = payloadJson.order_index
          delete payloadJson.order_index
        }
        if ("is_active" in payloadJson) {
          payloadJson.isActive = payloadJson.is_active
          delete payloadJson.is_active
        }
        response = await fetch("/api/projects", {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payloadJson),
        })
      }

      if (response.ok) {
        loadData()
        setIsProjectDialogOpen(false)
        setEditingProject(null)
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        alert(`Failed to save project: ${errorData.error || response.statusText}`)
      }
    } catch (error) {
      alert("Failed to save project")
    }
  }

  const handleDeleteProject = async (id: number) => {
    if (!confirm("Are you sure you want to delete this project?")) return

    try {
      const response = await fetch(`/api/projects?id=${id}`, { method: "DELETE" })
      if (response.ok) {
        loadData()
      }
    } catch (error) {
      alert("Failed to delete project")
    }
  }

  const handleSaveContent = async (content: Content) => {
    try {
      const response = await fetch("/api/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(content),
      })

      if (response.ok) {
        loadData()
        setIsContentDialogOpen(false)
        setEditingContent(null)
      } else {
        const errorData = await response.json()
        alert(`Failed to save content: ${errorData.error || response.statusText}`)
      }
    } catch (error) {
      alert("Failed to save content")
    }
  }

  const handleSaveFaq = async (item: FaqItem | Omit<FaqItem, "id"> & { id?: number }) => {
    try {
      const method = item.id ? "PUT" : "POST"
      const response = await fetch("/api/faq", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item),
      })

      if (response.ok) {
        loadData()
        setIsFaqDialogOpen(false)
        setEditingFaq(null)
      }
    } catch (error) {
      alert("Failed to save FAQ item")
    }
  }

  const handleDeleteFaq = async (id: number) => {
    if (!confirm("Are you sure you want to delete this FAQ item?")) return

    try {
      const response = await fetch(`/api/faq?id=${id}`, { method: "DELETE" })
      if (response.ok) {
        loadData()
      }
    } catch (error) {
      alert("Failed to delete FAQ item")
    }
  }

  const handleSaveContactLink = async (link: ContactLink | Omit<ContactLink, "id"> & { id?: number }) => {
    try {
      const method = link.id ? "POST" : "POST" // Always POST for our API implementation handles both

      // Need to handle file upload inside this function if it's a new icon?
      // Actually, the Form component should handle the file preparation or the API handles it.
      // Our API expects multipart/form-data for files.

      // We will implement the save logic in the form component or here.
      // Let's pass the formData directly from the form component or handle it here.
      // Easiest is to let the Form component construct the FormData and call fetch, or pass FormData up.
      // Given the pattern in this file, let's look at `handleSaveCustomFaq` or similar. They pass the item.
      // But for files we need FormData.
      // I'll define this handler to accept FormData or just refresh data.

      // Wait, let's keep the pattern. I'll define `handleSaveContactLink` to just reload data, 
      // and let the Form component handle the fetch call since it deals with files.
      // OR I can make this function accept FormData.

      loadData()
      setIsContactLinkDialogOpen(false)
      setEditingContactLink(null)
    } catch (error) {
      alert("Failed to save Contact Link")
    }
  }

  const handleDeleteContactLink = async (id: number) => {
    if (!confirm("Are you sure you want to delete this link?")) return

    try {
      const response = await fetch(`/api/contact-links?id=${id}`, { method: "DELETE" })
      if (response.ok) {
        loadData()
      }
    } catch (error) {
      alert("Failed to delete link")
    }
  }

  const getProjectsByCategory = (category: "engineering" | "games" | "art") => {
    return projects.filter(project => project.category === category && !project.customTabKey)
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="flex flex-col items-center">
            <div className="w-16 h-16 bg-gray-300 rounded mr-4 flex items-center justify-center overflow-hidden">
              {content.about?.imageUrl ? (
                <img src={content.about.imageUrl} alt="About" className="w-full h-full object-cover" />
              ) : (
                <User className="w-8 h-8 text-gray-600" />
              )}
            </div>
            <CardTitle className="text-center">Admin Login</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={loginForm.email}
                  onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                Login
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
            <Button onClick={handleLogout} variant="outline">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="analytics" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 md:grid-cols-6 lg:grid-cols-11 h-auto">
            <TabsTrigger value="analytics">Dashboard</TabsTrigger>
            <TabsTrigger value="about">About</TabsTrigger>
            <TabsTrigger value="engineering">Eng</TabsTrigger>
            <TabsTrigger value="games">Games</TabsTrigger>
            <TabsTrigger value="art">Art</TabsTrigger>
            <TabsTrigger value="contact">Contact</TabsTrigger>
            <TabsTrigger value="faq">FAQ</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="background">Bg</TabsTrigger>
            <TabsTrigger value="windows">Window</TabsTrigger>
            <TabsTrigger value="custom-panels">Panel</TabsTrigger>
            <TabsTrigger value="archived">Archived</TabsTrigger>
          </TabsList>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            {analytics && (
              <>
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Page Views</CardTitle>
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {(analytics.pageViews || []).reduce((sum, item) => sum + item.views, 0)}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Unique Visitors</CardTitle>
                      <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {(analytics.dailyVisits || []).reduce((sum, item) => sum + item.unique_visitors, 0)}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Top Page</CardTitle>
                      <MousePointer className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{(analytics.pageViews || [])[0]?.page || "N/A"}</div>
                    </CardContent>
                  </Card>
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Page Views</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={analytics.pageViews || []}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="page" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="views" fill="#3b82f6" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Daily Visitors</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={analytics.dailyVisits || []}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip />
                          <Line type="monotone" dataKey="unique_visitors" stroke="#3b82f6" />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>
              </>
            )}
          </TabsContent>

          {/* About Tab */}
          <TabsContent value="about" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>About Section</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Edit the main about text shown in the desktop “about” window on your homepage.
                </p>
                {content.about && (
                  <p className="text-sm text-gray-700 mb-4 line-clamp-3">
                    {content.about.content.substring(0, 200)}...
                  </p>
                )}
                <Button
                  onClick={() => {
                    if (!content.about) return
                    setEditingContent(content.about)
                    setIsContentDialogOpen(true)
                  }}
                  size="sm"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit About
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>About Image</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Upload an image to display in the about window (replaces the default icon).
                </p>
                {content.about?.imageUrl && (
                  <div className="mb-4">
                    <img
                      src={content.about.imageUrl}
                      alt="About"
                      className="w-16 h-16 object-cover rounded"
                    />
                  </div>
                )}
                <Input
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0]
                    if (!file || !content.about) return

                    const formData = new FormData()
                    formData.append('image', file)

                    try {
                      const uploadRes = await fetch('/api/upload', {
                        method: 'POST',
                        body: formData,
                      })

                      if (uploadRes.ok) {
                        const { url } = await uploadRes.json()
                        await handleSaveContent({ ...content.about, imageUrl: url })
                        await loadData()
                      }
                    } catch (error) {
                      console.error('Image upload error:', error)
                      alert('Failed to upload image')
                    }
                  }}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>About Subtitle</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Edit the subtitle shown below "About Me" in the window header.
                </p>
                {content.about_subtitle && (
                  <p className="text-sm text-gray-700 mb-4 font-medium">
                    {content.about_subtitle.content}
                  </p>
                )}
                <Button
                  onClick={() => {
                    setEditingContent(
                      content.about_subtitle || {
                        id: 0,
                        section: "about_subtitle",
                        title: "About Subtitle",
                        content: "Final Year Aerospace Engineering Student",
                      }
                    )
                    setIsContentDialogOpen(true)
                  }}
                  size="sm"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Subtitle
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Home Screen Greeting</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Edit the large greeting text on the desktop home screen.
                </p>
                {content.home_greeting && (
                  <div className="text-sm text-gray-700 mb-4 text-xl font-bold">
                    {content.home_greeting.content}
                  </div>
                )}
                <Button
                  onClick={() => {
                    setEditingContent(
                      content.home_greeting || {
                        id: 0,
                        section: "home_greeting",
                        title: "Home Greeting",
                        content: "hi! i'm shubham",
                      }
                    )
                    setIsContentDialogOpen(true)
                  }}
                  size="sm"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Greeting
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Home Screen Subtitle</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Edit the subtitle text shown below the greeting.
                </p>
                {content.home_subtitle && (
                  <p className="text-sm text-gray-700 mb-4">
                    {content.home_subtitle.content}
                  </p>
                )}
                <Button
                  onClick={() => {
                    setEditingContent(
                      content.home_subtitle || {
                        id: 0,
                        section: "home_subtitle",
                        title: "Home Subtitle",
                        content: "aerospace engineer, game developer, and digital artist",
                      }
                    )
                    setIsContentDialogOpen(true)
                  }}
                  size="sm"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Subtitle
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Engineering Tab */}
          <TabsContent value="engineering" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Engineering Projects</h2>
              <Button
                onClick={() => {
                  setEditingProject({
                    id: 0,
                    title: "",
                    description: "",
                    category: "engineering",
                    photos: [],
                    keywords: [],
                    projectLink: "",
                    tags: [],
                    order_index: 0,
                    is_active: true,
                  } as Project)
                  setIsProjectDialogOpen(true)
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Engineering Project
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {getProjectsByCategory("engineering").map((project) => (
                <Card key={project.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{project.title}</CardTitle>
                        <Badge variant="secondary" className="mt-1">
                          Engineering
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">{project.description}</p>
                    <div className="flex flex-wrap gap-1 mb-4">
                      {project.tags.map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => {
                          setEditingProject(project)
                          setIsProjectDialogOpen(true)
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDeleteProject(project.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Games Tab */}
          <TabsContent value="games" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Game Projects</h2>
              <Button
                onClick={() => {
                  setEditingProject({
                    id: 0,
                    title: "",
                    description: "",
                    category: "games",
                    photos: [],
                    keywords: [],
                    projectLink: "",
                    tags: [],
                    order_index: 0,
                    is_active: true,
                  } as Project)
                  setIsProjectDialogOpen(true)
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Game Project
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {getProjectsByCategory("games").map((project) => (
                <Card key={project.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{project.title}</CardTitle>
                        <Badge variant="secondary" className="mt-1">
                          Games
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">{project.description}</p>
                    <div className="flex flex-wrap gap-1 mb-4">
                      {project.tags.map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => {
                          setEditingProject(project)
                          setIsProjectDialogOpen(true)
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDeleteProject(project.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Art Tab */}
          <TabsContent value="art" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Art Projects</h2>
              <Button
                onClick={() => {
                  setEditingProject({
                    id: 0,
                    title: "",
                    description: "",
                    category: "art",
                    photos: [],
                    keywords: [],
                    projectLink: "",
                    tags: [],
                    order_index: 0,
                    is_active: true,
                  } as Project)
                  setIsProjectDialogOpen(true)
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Art Project
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {getProjectsByCategory("art").map((project) => (
                <Card key={project.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{project.title}</CardTitle>
                        <Badge variant="secondary" className="mt-1">
                          Art
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">{project.description}</p>
                    <div className="flex flex-wrap gap-1 mb-4">
                      {project.tags.map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => {
                          setEditingProject(project)
                          setIsProjectDialogOpen(true)
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDeleteProject(project.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Contact Tab */}
          <TabsContent value="contact" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Contact Links</h2>
              <Button
                onClick={() => {
                  setEditingContactLink({
                    id: 0,
                    name: "",
                    url: "",
                    iconUrl: "",
                    order: contactLinks.length + 1,
                    isActive: true,
                  })
                  setIsContactLinkDialogOpen(true)
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Link
              </Button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {contactLinks.map((link) => (
                <Card key={link.id} className="relative group">
                  <CardContent className="p-4 flex flex-col items-center text-center">
                    <div className="w-12 h-12 mb-2">
                      {link.iconUrl ? (
                        <img src={link.iconUrl} alt={link.name} className="w-full h-full object-contain" />
                      ) : (
                        <div className="w-full h-full bg-gray-200 rounded flex items-center justify-center">
                          <span className="text-xs">No Icon</span>
                        </div>
                      )}
                    </div>
                    <div className="font-semibold text-sm truncate w-full">{link.name}</div>
                    <div className="flex gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity absolute top-2 right-2 bg-white/90 rounded p-1 shadow-sm">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0"
                        onClick={() => {
                          setEditingContactLink(link)
                          setIsContactLinkDialogOpen(true)
                        }}
                      >
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleDeleteContactLink(link.id)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* FAQ Tab */}
          <TabsContent value="faq" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">FAQ Items</h2>
              <Button
                onClick={() => {
                  setEditingFaq({
                    id: 0,
                    question: "",
                    answer: "",
                    order: faqItems.length + 1,
                    isActive: true,
                  })
                  setIsFaqDialogOpen(true)
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add FAQ Item
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {faqItems.filter((item) => !item.customTabKey).map((item) => (
                <Card key={item.id}>
                  <CardHeader>
                    <CardTitle className="text-lg">{item.question}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-3">{item.answer}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">Order: {item.order}</span>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => {
                            setEditingFaq(item)
                            setIsFaqDialogOpen(true)
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDeleteFaq(item.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Site Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Site Title</Label>
                    <Input defaultValue="Shubham's Portfolio" />
                  </div>
                  <div>
                    <Label>Site Description</Label>
                    <Textarea defaultValue="Aerospace engineer, game developer, and digital artist" rows={2} />
                  </div>
                  <div>
                    <Label>Contact Email</Label>
                    <Input type="email" defaultValue="contact@shubham.dev" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Analytics Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="tracking" defaultChecked />
                    <Label htmlFor="tracking">Enable visitor tracking</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="referrers" defaultChecked />
                    <Label htmlFor="referrers">Track referrer sources</Label>
                  </div>
                  <div>
                    <Label>Data retention (days)</Label>
                    <Input type="number" defaultValue="30" min="1" max="365" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="w-4 h-4 mr-2" />
                    Export Analytics Data
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Generate Analytics Report
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Settings className="w-4 h-4 mr-2" />
                    Backup Database
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>System Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span>Database Connection</span>
                    <Badge variant="default" className="bg-green-100 text-green-800">Connected</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Analytics Tracking</span>
                    <Badge variant="default" className="bg-green-100 text-green-800">Active</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Last Backup</span>
                    <span className="text-sm text-gray-600">2 hours ago</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Total Projects</span>
                    <span className="text-sm font-medium">{projects.length}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Background Tab */}
          <TabsContent value="background" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Homepage Background</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-sm text-gray-600">
                  Choose how the desktop background looks on your homepage: solid color, gradient, or custom image.
                </p>

                <BackgroundForm
                  initialConfig={background}
                  onSaved={(cfg) => setBackground(cfg)}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Windows Tab */}
          <TabsContent value="windows" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Windows & Tabs</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600">
                  Control which windows appear on the desktop and inside the home window. You can also add custom tabs
                  with their own content.
                </p>
                <WindowsManager windows={windows} onChange={setWindows} />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Custom Panels Tab */}
          <TabsContent value="custom-panels" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Custom Panels</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Manage content and settings for each custom tab. Panels are automatically created when you add a custom tab in Windows & Tabs.
                </p>
                {windows.filter((w) => w.type === "custom").length === 0 ? (
                  <p className="text-sm text-gray-500">No custom tabs yet. Add one in the Windows & Tabs section.</p>
                ) : (
                  <div className="space-y-4">
                    {windows
                      .filter((w) => w.type === "custom" && !w.isArchived)
                      .map((window) => (
                        <CustomPanelEditor key={window.id} window={window} onUpdate={loadData} />
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Archived Tab */}
          <TabsContent value="archived" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Archived Windows</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600">
                  Restore archived windows to make them visible again in the Windows & Tabs section.
                </p>
                <ArchivedManager windows={windows} onChange={setWindows} />
              </CardContent>
            </Card>
          </TabsContent>

        </Tabs>
      </div>

      {/* Project Dialog */}
      <Dialog open={isProjectDialogOpen} onOpenChange={setIsProjectDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingProject?.id ? "Edit Project" : "Add Project"}</DialogTitle>
          </DialogHeader>
          {editingProject && (
            <ProjectForm
              project={editingProject}
              onSave={handleSaveProject}
              onCancel={() => setIsProjectDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Content Dialog */}
      <Dialog open={isContentDialogOpen} onOpenChange={setIsContentDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Content</DialogTitle>
          </DialogHeader>
          {editingContent && (
            <ContentForm
              content={editingContent}
              onSave={handleSaveContent}
              onCancel={() => setIsContentDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* FAQ Dialog */}
      <Dialog open={isFaqDialogOpen} onOpenChange={setIsFaqDialogOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>{editingFaq?.id ? "Edit FAQ Item" : "Add FAQ Item"}</DialogTitle>
          </DialogHeader>
          {editingFaq && (
            <FaqForm
              item={editingFaq}
              onSave={handleSaveFaq}
              onCancel={() => setIsFaqDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Contact Link Dialog */}
      <Dialog open={isContactLinkDialogOpen} onOpenChange={setIsContactLinkDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingContactLink?.id ? "Edit Link" : "Add Link"}</DialogTitle>
          </DialogHeader>
          {editingContactLink && (
            <ContactLinkForm
              link={editingContactLink}
              onSave={() => handleSaveContactLink(editingContactLink)}
              onCancel={() => setIsContactLinkDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div >
  )
}

// Project Form Component
function ProjectForm({
  project,
  onSave,
  onCancel,
}: {
  project: Project
  onSave: (payload: { project: Project; mainImageFile?: File | null }) => void
  onCancel: () => void
}) {
  const [formData, setFormData] = useState(project)
  const [tagInput, setTagInput] = useState("")
  const [keywordInput, setKeywordInput] = useState("")
  const [photoInput, setPhotoInput] = useState("")
  const [mainImageFile, setMainImageFile] = useState<File | null>(null)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({ project: formData, mainImageFile })
  }

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tagInput.trim()],
      })
      setTagInput("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((tag) => tag !== tagToRemove),
    })
  }

  const addKeyword = () => {
    if (keywordInput.trim() && !formData.keywords.includes(keywordInput.trim())) {
      setFormData({
        ...formData,
        keywords: [...formData.keywords, keywordInput.trim()],
      })
      setKeywordInput("")
    }
  }

  const removeKeyword = (keywordToRemove: string) => {
    setFormData({
      ...formData,
      keywords: formData.keywords.filter((keyword) => keyword !== keywordToRemove),
    })
  }

  const addPhoto = () => {
    if (photoInput.trim() && !formData.photos.includes(photoInput.trim())) {
      setFormData({
        ...formData,
        photos: [...formData.photos, photoInput.trim()],
      })
      setPhotoInput("")
    }
  }

  const removePhoto = (photoToRemove: string) => {
    setFormData({
      ...formData,
      photos: formData.photos.filter((photo) => photo !== photoToRemove),
    })
  }

  const handlePhotoFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingPhoto(true)
    try {
      const uploadFormData = new FormData()
      uploadFormData.append('file', file)
      uploadFormData.append('folder', 'photos')

      const response = await fetch('/api/upload-github', {
        method: 'POST',
        body: uploadFormData,
      })

      if (response.ok) {
        const data = await response.json()
        setFormData({
          ...formData,
          photos: [...formData.photos, data.url],
        })
      } else {
        alert('Failed to upload photo')
      }
    } catch (error) {
      console.error('Error uploading photo:', error)
      alert('Failed to upload photo')
    } finally {
      setUploadingPhoto(false)
      e.target.value = '' // Reset file input
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
        />
      </div>

      <div>
        <Label htmlFor="description">Description (optional)</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={4}
        />
      </div>

      <div>
        <Label htmlFor="category">Category</Label>
        <Select value={formData.category} onValueChange={(value: "engineering" | "games" | "art") => setFormData({ ...formData, category: value })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="engineering">Engineering</SelectItem>
            <SelectItem value="games">Games</SelectItem>
            <SelectItem value="art">Art</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="image_url">Media URL (Image, Video, or YouTube Link)</Label>

        {/* Show current image preview if exists */}
        {(formData.image_url || (formData as any).imageUrl) && (
          <div className="mt-2 mb-3">
            <p className="text-xs text-gray-600 mb-2">Current Media:</p>
            <div className="flex items-start gap-3 p-3 border rounded-lg bg-gray-50">
              <img
                src={formData.image_url || (formData as any).imageUrl}
                alt="Current media"
                className="w-24 h-16 object-cover rounded border"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-700 truncate">
                  {(formData.image_url || (formData as any).imageUrl || '').split('/').pop() || 'media file'}
                </p>
                <p className="text-xs text-gray-500 mt-1 truncate">
                  {formData.image_url || (formData as any).imageUrl}
                </p>
              </div>
            </div>
          </div>
        )}

        <Input
          id="image_url"
          type="text"
          value={formData.image_url || ""}
          onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
          placeholder="https://youtube.com/watch?v=... or https://example.com/image.jpg"
        />
        <p className="text-xs text-gray-500 mt-1">
          Supports: YouTube links, direct image URLs, or video URLs
        </p>
        <div className="mt-2">
          <Label htmlFor="main_image_file" className="text-xs text-gray-600">
            Or upload from your computer
          </Label>
          <Input
            id="main_image_file"
            type="file"
            accept="image/*,video/mp4,video/webm,video/ogg,video/quicktime"
            onChange={(e) => setMainImageFile(e.target.files?.[0] || null)}
            className="mt-1"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="projectLink">Project Link (optional)</Label>
        <Input
          id="projectLink"
          type="url"
          value={formData.projectLink || ""}
          onChange={(e) => setFormData({ ...formData, projectLink: e.target.value })}
          placeholder="https://github.com/username/project or https://example.com"
        />
      </div>

      <div>
        <Label>Additional Photos</Label>
        <p className="text-xs text-muted-foreground mb-2">Upload from your computer or paste a URL</p>

        {/* File Upload */}
        <div className="flex gap-2 mb-2">
          <Input
            type="file"
            accept="image/*"
            onChange={handlePhotoFileUpload}
            disabled={uploadingPhoto}
            className="flex-1"
          />
          {uploadingPhoto && <span className="text-sm text-muted-foreground self-center">Uploading...</span>}
        </div>

        {/* URL Input */}
        <div className="flex gap-2 mb-2">
          <Input
            value={photoInput}
            onChange={(e) => setPhotoInput(e.target.value)}
            placeholder="Or paste photo URL"
            onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addPhoto())}
          />
          <Button type="button" onClick={addPhoto} size="sm">
            Add URL
          </Button>
        </div>

        {/* Photo List */}
        <div className="grid grid-cols-4 gap-2">
          {formData.photos.map((photo, index) => (
            <div key={index} className="relative group">
              <img src={photo} alt={`Photo ${index + 1}`} className="w-full h-20 object-cover rounded border" />
              <button
                type="button"
                onClick={() => removePhoto(photo)}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
              >
                ×
              </button>
              <span className="absolute bottom-1 left-1 bg-black/50 text-white text-xs px-1 rounded">
                {index + 1}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <Label>Keywords (for SEO)</Label>
        <div className="flex gap-2 mb-2">
          <Input
            value={keywordInput}
            onChange={(e) => setKeywordInput(e.target.value)}
            placeholder="Add a keyword"
            onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addKeyword())}
          />
          <Button type="button" onClick={addKeyword} size="sm">
            Add
          </Button>
        </div>
        <div className="flex flex-wrap gap-1">
          {formData.keywords.map((keyword, index) => (
            <Badge key={index} variant="secondary" className="text-xs">
              {keyword}
              <button
                type="button"
                onClick={() => removeKeyword(keyword)}
                className="ml-1 text-red-500 hover:text-red-700"
              >
                ×
              </button>
            </Badge>
          ))}
        </div>
      </div>

      <div>
        <Label htmlFor="order_index">Display Order</Label>
        <Input
          id="order_index"
          type="number"
          value={formData.order_index}
          onChange={(e) => setFormData({ ...formData, order_index: parseInt(e.target.value) || 0 })}
        />
      </div>

      <div>
        <Label>Tags</Label>
        <div className="flex gap-2 mb-2">
          <Input
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            placeholder="Add a tag"
            onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
          />
          <Button type="button" onClick={addTag} size="sm">
            Add
          </Button>
        </div>
        <div className="flex flex-wrap gap-1">
          {formData.tags.map((tag, index) => (
            <Badge key={index} variant="outline" className="text-xs">
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="ml-1 text-red-500 hover:text-red-700"
              >
                ×
              </button>
            </Badge>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          <Save className="w-4 h-4 mr-2" />
          Save
        </Button>
      </div>
    </form>
  )
}

// Content Form Component
function ContentForm({
  content,
  onSave,
  onCancel,
}: {
  content: Content
  onSave: (content: Content) => void
  onCancel: () => void
}) {
  const [formData, setFormData] = useState(content)

  // Hide title for these specific sections as it's redundant for the user
  const hideTitle = ["about_subtitle", "home_greeting", "home_subtitle"].includes(content.section)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Ensure section is preserved and title is populated if hidden
    const payload = {
      ...formData,
      section: content.section || formData.section,
      title: hideTitle ? (content.title || "Subtitle") : formData.title
    }

    // DEBUG: Alert the payload to verify what's being sent
    // alert("Debug Payload: " + JSON.stringify(payload))

    onSave(payload)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {!hideTitle && (
        <div>
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={formData.title || ""}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />
        </div>
      )}

      <div>
        <Label htmlFor="content">Content</Label>
        <Textarea
          id="content"
          value={formData.content || ""}
          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
          required
        />
        <p className="text-xs text-gray-500 mt-1">
          Supports rich text: **bold**, *italic*, [link](url), and lists (- item).
        </p>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          <Save className="w-4 h-4 mr-2" />
          Save
        </Button>
      </div>
    </form>
  )
}

// FAQ Form Component
function FaqForm({
  item,
  onSave,
  onCancel,
}: {
  item: FaqItem
  onSave: (item: FaqItem) => void
  onCancel: () => void
}) {
  const [formData, setFormData] = useState(item)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="question">Question</Label>
        <Input
          id="question"
          value={formData.question}
          onChange={(e) => setFormData({ ...formData, question: e.target.value })}
          required
        />
      </div>

      <div>
        <Label htmlFor="answer">Answer</Label>
        <Textarea
          id="answer"
          value={formData.answer}
          onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
          required
        />
        <p className="text-xs text-gray-500 mt-1">
          Supports rich text: **bold**, *italic*, [link](url), and lists (- item).
        </p>
      </div>

      <div>
        <Label htmlFor="order">Display Order</Label>
        <Input
          id="order"
          type="number"
          value={formData.order}
          onChange={(e) =>
            setFormData({ ...formData, order: Number.isNaN(parseInt(e.target.value)) ? 0 : parseInt(e.target.value) })
          }
        />
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <input
            id="isActive"
            type="checkbox"
            checked={formData.isActive}
            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
          />
          <Label htmlFor="isActive">Visible on site</Label>
        </div>

        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">
            <Save className="w-4 h-4 mr-2" />
            Save
          </Button>
        </div>
      </div>
    </form>
  )
}

function ContactLinkForm({
  link,
  onSave,
  onCancel,
}: {
  link: ContactLink
  onSave: () => void
  onCancel: () => void
}) {
  const [formData, setFormData] = useState({ ...link })
  const [file, setFile] = useState<File | null>(null)
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const data = new FormData()
      if (link.id) data.append("id", link.id.toString())
      data.append("name", formData.name)
      data.append("url", formData.url)
      data.append("order", formData.order.toString())
      data.append("isActive", formData.isActive.toString())
      data.append("showOnDesktop", (formData.showOnDesktop !== false).toString())
      if (file) {
        data.append("icon", file)
      }

      const response = await fetch("/api/contact-links", {
        method: "POST",
        body: data,
      })

      if (response.ok) {
        onSave()
      } else {
        alert("Failed to save link")
      }
    } catch (error) {
      console.error(error)
      alert("Error saving link")
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>
      <div>
        <Label htmlFor="url">URL</Label>
        <Input
          id="url"
          value={formData.url}
          onChange={(e) => setFormData({ ...formData, url: e.target.value })}
          required
        />
      </div>
      <div>
        <Label htmlFor="order">Order</Label>
        <Input
          id="order"
          type="number"
          value={formData.order}
          onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
        />
      </div>
      <div>
        <Label>Icon</Label>
        {formData.iconUrl && (
          <div className="mb-2">
            <img src={formData.iconUrl} alt="Icon" className="w-12 h-12 object-contain bg-gray-100 rounded p-1" />
          </div>
        )}
        <Input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />
      </div>
      <div className="flex items-center space-x-2">
        <input
          id="isActive"
          type="checkbox"
          checked={formData.isActive}
          onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
        />
        <Label htmlFor="isActive">Active</Label>
      </div>
      <div className="flex items-center space-x-2">
        <input
          id="showOnDesktop"
          type="checkbox"
          checked={formData.showOnDesktop !== false} // Default to true if undefined
          onChange={(e) => setFormData({ ...formData, showOnDesktop: e.target.checked })}
        />
        <Label htmlFor="showOnDesktop">Show on Desktop</Label>
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={saving}>
          {saving ? "Saving..." : "Save"}
        </Button>
      </div>
    </form >
  )
  // Site Settings Form Component
  function SiteSettingsForm({
    onSaved,
  }: {
    onSaved: () => void
  }) {
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [config, setConfig] = useState<SiteConfig>({ title: "" })
    const [faviconFile, setFaviconFile] = useState<File | null>(null)

    useEffect(() => {
      fetch("/api/site-config")
        .then((res) => res.json())
        .then((data) => {
          setConfig(data)
          setLoading(false)
        })
        .catch((err) => {
          console.error(err)
          setLoading(false)
        })
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault()
      setSaving(true)

      try {
        const formData = new FormData()
        formData.append("title", config.title)
        if (faviconFile) {
          formData.append("favicon", faviconFile)
        }

        const response = await fetch("/api/site-config", {
          method: "POST",
          body: formData,
        })

        if (response.ok) {
          const data = await response.json()
          setConfig(data.config)
          setFaviconFile(null)
          onSaved()
          alert("Settings saved successfully! You may need to refresh the page to see changes.")
        } else {
          alert("Failed to save settings")
        }
      } catch (error) {
        console.error(error)
        alert("Error saving settings")
      } finally {
        setSaving(false)
      }
    }

    if (loading) return <div>Loading settings...</div>

    return (
      <div className="max-w-2xl">
        <h2 className="text-2xl font-bold mb-6">Site Settings</h2>
        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="siteTitle">Site Title</Label>
              <Input
                id="siteTitle"
                value={config.title}
                onChange={(e) => setConfig({ ...config, title: e.target.value })}
                placeholder="e.g. My Portfolio"
                required
                className="mt-1"
              />
              <p className="text-sm text-gray-500 mt-1">
                This appears in the browser tab and search results.
              </p>
            </div>

            <div>
              <Label>Favicon</Label>
              <div className="flex items-start gap-4 mt-2">
                <div className="flex-shrink-0">
                  {config.faviconUrl ? (
                    <div className="border rounded p-2 bg-gray-50">
                      <img
                        src={config.faviconUrl}
                        alt="Current Favicon"
                        className="w-8 h-8 object-contain"
                      />
                    </div>
                  ) : (
                    <div className="w-12 h-12 border rounded bg-gray-100 flex items-center justify-center text-gray-400">
                      No Icon
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <Input
                    type="file"
                    accept="image/x-icon,image/png,image/svg+xml,image/jpeg"
                    onChange={(e) => setFaviconFile(e.target.files?.[0] || null)}
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Upload a new favicon (ICO, PNG, SVG, JPG). Recommended size: 32x32 or larger.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button type="submit" disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    )
  }
}

// Background Form Component
function BackgroundForm({
  initialConfig,
  onSaved,
}: {
  initialConfig: BackgroundConfig | null
  onSaved: (config: BackgroundConfig) => void
}) {
  const [mode, setMode] = useState<"desktop" | "mobile">("desktop")

  const getStyle = (config: BackgroundConfig | null, m: "desktop" | "mobile"): BackgroundStyle => {
    if (!config) return { type: "gradient", color: "#2563eb", from: "#60a5fa", via: "#3b82f6", to: "#2563eb", overlay: true }
    return config[m] || { type: "gradient", color: "#2563eb", from: "#60a5fa", via: "#3b82f6", to: "#2563eb", overlay: true }
  }

  const currentStyle = getStyle(initialConfig, mode)

  const [type, setType] = useState<BackgroundStyle["type"]>(currentStyle.type)
  const [solidColor, setSolidColor] = useState(
    currentStyle.type === "solid" ? currentStyle.color : "#2563eb",
  )
  const [from, setFrom] = useState(
    currentStyle.type === "gradient" ? currentStyle.from : "#60a5fa",
  )
  const [via, setVia] = useState(
    currentStyle.type === "gradient" ? currentStyle.via || "#3b82f6" : "#3b82f6",
  )
  const [to, setTo] = useState(currentStyle.type === "gradient" ? currentStyle.to : "#2563eb")
  const [overlay, setOverlay] = useState(
    currentStyle.type === "image" ? currentStyle.overlay ?? true : true,
  )
  const [iconColor, setIconColor] = useState(currentStyle.iconColor || "#ffffff")

  // Sync state on mode change
  useEffect(() => {
    const style = getStyle(initialConfig, mode)
    setType(style.type)
    if (style.type === "solid") {
      setSolidColor(style.color)
    } else if (style.type === "gradient") {
      setFrom(style.from)
      setVia(style.via)
      setTo(style.to)
    } else if (style.type === "image") {
      setOverlay(style.overlay ?? true)
    }
    setIconColor(style.iconColor || "#ffffff")
    setImageFile(null)
  }, [mode, initialConfig])
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      let body: BodyInit
      let headers: HeadersInit | undefined

      if (type === "image") {
        const formData = new FormData()
        formData.append("type", "image")
        if (imageFile) {
          formData.append("image", imageFile)
        }
        formData.append("overlay", overlay ? "true" : "false")
        formData.append("iconColor", iconColor)
        body = formData
        headers = undefined
      } else if (type === "solid") {
        const style = { type: "solid", color: solidColor, iconColor }
        body = JSON.stringify(style)
        headers = { "Content-Type": "application/json" }
      } else {
        const style = { type: "gradient", from, via, to, iconColor }
        body = JSON.stringify(style)
        headers = { "Content-Type": "application/json" }
      }

      const res = await fetch(`/api/background?mode=${mode}`, {
        method: "POST",
        body,
        headers,
      })

      if (!res.ok) {
        alert("Failed to save background")
        return
      }

      const saved = (await res.json()) as BackgroundConfig
      onSaved(saved)
      setImageFile(null)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex border-b">
        <button
          type="button"
          className={`px-4 py-2 text-sm font-medium ${mode === "desktop" ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-500"}`}
          onClick={() => setMode("desktop")}
        >
          Desktop Background
        </button>
        <button
          type="button"
          className={`px-4 py-2 text-sm font-medium ${mode === "mobile" ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-500"}`}
          onClick={() => setMode("mobile")}
        >
          Mobile Background
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 pt-4">
        <div>
          <Label>Background Type</Label>
          <div className="flex gap-4 mt-2">
            <button
              type="button"
              onClick={() => setType("solid")}
              className={`px-3 py-1 text-sm rounded border ${type === "solid" ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-700"
                }`}
            >
              Solid
            </button>
            <button
              type="button"
              onClick={() => setType("gradient")}
              className={`px-3 py-1 text-sm rounded border ${type === "gradient" ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-700"
                }`}
            >
              Gradient
            </button>
            <button
              type="button"
              onClick={() => setType("image")}
              className={`px-3 py-1 text-sm rounded border ${type === "image" ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-700"
                }`}
            >
              Image
            </button>
          </div>
        </div>

        {type === "solid" && (
          <div className="space-y-2">
            <Label>Color</Label>
            <div className="flex items-center gap-3">
              <Input
                type="color"
                value={solidColor}
                onChange={(e) => setSolidColor(e.target.value)}
                className="w-16 p-1"
              />
              <Input value={solidColor} onChange={(e) => setSolidColor(e.target.value)} className="flex-1" />
            </div>
          </div>
        )}

        {type === "gradient" && (
          <div className="space-y-4">
            <div>
              <Label>From</Label>
              <div className="flex items-center gap-3 mt-1">
                <Input type="color" value={from} onChange={(e) => setFrom(e.target.value)} className="w-16 p-1" />
                <Input value={from} onChange={(e) => setFrom(e.target.value)} className="flex-1" />
              </div>
            </div>
            <div>
              <Label>Via (optional)</Label>
              <div className="flex items-center gap-3 mt-1">
                <Input type="color" value={via} onChange={(e) => setVia(e.target.value)} className="w-16 p-1" />
                <Input value={via} onChange={(e) => setVia(e.target.value)} className="flex-1" />
              </div>
            </div>
            <div>
              <Label>To</Label>
              <div className="flex items-center gap-3 mt-1">
                <Input type="color" value={to} onChange={(e) => setTo(e.target.value)} className="w-16 p-1" />
                <Input value={to} onChange={(e) => setTo(e.target.value)} className="flex-1" />
              </div>
            </div>
          </div>
        )}

        {type === "image" && (
          <div className="space-y-3">
            {/* Show current image if set */}
            {currentStyle.type === "image" && currentStyle.imageUrl && (
              <div className="space-y-2">
                <Label>Current Image</Label>
                <div className="flex items-start gap-3 p-3 border rounded-lg bg-gray-50">
                  <img
                    src={currentStyle.imageUrl}
                    alt="Current background"
                    className="w-24 h-16 object-cover rounded border"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-700 truncate">
                      {currentStyle.imageUrl.split('/').pop() || 'background.jpg'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Currently in use
                    </p>
                  </div>
                </div>
              </div>
            )}
            <div>
              <Label>{currentStyle.imageUrl ? "Upload New Image" : "Upload Image"}</Label>
              <Input
                key={mode}
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                className="mt-1"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                id="overlay"
                type="checkbox"
                checked={overlay}
                onChange={(e) => setOverlay(e.target.checked)}
              />
              <Label htmlFor="overlay">Add subtle overlay for readability</Label>
            </div>
          </div>
        )}



        <div className="space-y-2 pt-4 border-t">
          <Label>Icon Text Color</Label>
          <div className="flex items-center gap-3">
            <Input
              type="color"
              value={iconColor}
              onChange={(e) => setIconColor(e.target.value)}
              className="w-16 p-1"
            />
            <Input value={iconColor} onChange={(e) => setIconColor(e.target.value)} className="flex-1" />
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={saving}>
            <Save className="w-4 h-4 mr-2" />
            {saving ? "Saving..." : "Save Background"}
          </Button>
        </div>
      </form>
    </div>
  )
}

// Windows Manager Component
function WindowsManager({
  windows,
  onChange,
}: {
  windows: WindowConfig[]
  onChange: (windows: WindowConfig[]) => void
}) {
  const [savingId, setSavingId] = useState<number | null>(null)
  const [creating, setCreating] = useState(false)
  const [iconFiles, setIconFiles] = useState<Record<number, File>>({})
  const [iconPreviews, setIconPreviews] = useState<Record<number, string>>({})
  const builtIn = windows.filter((w) => w.type === "builtIn" && !w.isArchived)
  const custom = windows.filter((w) => w.type === "custom" && !w.isArchived)

  const handleIconFileChange = (windowId: number, file: File | null) => {
    if (file) {
      setIconFiles(prev => ({ ...prev, [windowId]: file }))
      const reader = new FileReader()
      reader.onloadend = () => {
        setIconPreviews(prev => ({ ...prev, [windowId]: reader.result as string }))
      }
      reader.readAsDataURL(file)
    } else {
      const newFiles = { ...iconFiles }
      delete newFiles[windowId]
      setIconFiles(newFiles)
      const newPreviews = { ...iconPreviews }
      delete newPreviews[windowId]
      setIconPreviews(newPreviews)
    }
  }

  const updateWindowLocal = (id: number, patch: Partial<WindowConfig>) => {
    onChange(
      windows.map((w) =>
        w.id === id
          ? {
            ...w,
            ...patch,
          }
          : w,
      ),
    )
  }

  const saveWindow = async (window: WindowConfig) => {
    setSavingId(window.id)
    try {
      const iconFile = iconFiles[window.id]
      if (iconFile) {
        const formData = new FormData()
        formData.append("id", String(window.id))
        formData.append("key", window.key)
        formData.append("label", window.label)
        formData.append("content", window.content || "")
        formData.append("layout", window.layout || "content")
        formData.append("icon", window.icon || "folder")
        formData.append("showOnDesktop", String(window.showOnDesktop))
        formData.append("showInHome", String(window.showInHome))
        formData.append("orderDesktop", String(window.orderDesktop))
        formData.append("orderHome", String(window.orderHome))
        formData.append("isHidden", String(window.isHidden))
        formData.append("icon", iconFile)

        const res = await fetch("/api/windows", {
          method: "PUT",
          body: formData,
        })
        if (!res.ok) {
          alert("Failed to save window")
          return
        }
        const updated = (await res.json()) as WindowConfig
        onChange(windows.map((w) => (w.id === updated.id ? updated : w)))
        // Clear icon file after successful save
        const newIconFiles = { ...iconFiles }
        delete newIconFiles[window.id]
        setIconFiles(newIconFiles)
        const newIconPreviews = { ...iconPreviews }
        delete newIconPreviews[window.id]
        setIconPreviews(newIconPreviews)
      } else {
        const res = await fetch("/api/windows", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(window),
        })
        if (!res.ok) {
          alert("Failed to save window")
          return
        }
        const updated = (await res.json()) as WindowConfig
        onChange(windows.map((w) => (w.id === updated.id ? updated : w)))
      }
    } finally {
      setSavingId(null)
    }
  }

  const deleteWindow = async (id: number) => {
    if (!confirm("Delete this custom window?")) return
    setSavingId(id)
    try {
      const res = await fetch(`/api/windows?id=${id}`, { method: "DELETE" })
      if (!res.ok) {
        alert("Failed to delete window")
        return
      }
      onChange(windows.filter((w) => w.id !== id))
    } finally {
      setSavingId(null)
    }
  }

  const createWindow = async () => {
    setCreating(true)
    try {
      const res = await fetch("/api/windows", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: "",
          label: "New tab",
          showOnDesktop: false,
          showInHome: true,
          content: "",
        }),
      })
      if (!res.ok) {
        alert("Failed to create window")
        return
      }
      const created = (await res.json()) as WindowConfig
      onChange([...windows, created])
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-lg">Built-in Windows</h3>
      </div>
      <div className="space-y-3">
        {builtIn.map((w) => (
          <div
            key={w.id}
            className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 p-3 border rounded bg-white"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-medium capitalize">{w.label}</span>
                <span className="text-xs text-gray-500">({w.key})</span>
              </div>
              <div className="flex flex-wrap gap-3 text-xs text-gray-600">
                <label className="flex items-center gap-1">
                  <input
                    type="checkbox"
                    checked={w.showOnDesktop}
                    onChange={(e) => updateWindowLocal(w.id, { showOnDesktop: e.target.checked })}
                  />
                  Show on desktop
                </label>
                <label className="flex items-center gap-1">
                  <input
                    type="checkbox"
                    checked={w.showInHome}
                    onChange={(e) => updateWindowLocal(w.id, { showInHome: e.target.checked })}
                  />
                  Show in home grid
                </label>
                <label className="flex items-center gap-1">
                  <input
                    type="checkbox"
                    checked={w.isHidden}
                    onChange={(e) => updateWindowLocal(w.id, { isHidden: e.target.checked })}
                  />
                  Hidden
                </label>
                <label className="flex items-center gap-1 text-red-600">
                  <input
                    type="checkbox"
                    checked={w.isArchived}
                    onChange={(e) => {
                      if (confirm("Are you sure you want to archive this window?")) {
                        saveWindow({ ...w, isArchived: e.target.checked })
                      }
                    }}
                  />
                  Move to archive
                </label>
              </div>
            </div>

            <div className="mt-2 text-xs">
              <Label className="text-xs mb-1 block">Icon</Label>
              <div className="flex gap-2 items-center">


                <div className="flex-1 flex gap-2 items-center">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleIconFileChange(w.id, e.target.files?.[0] || null)}
                    className="h-8 text-xs py-1"
                  />
                  {(iconPreviews[w.id] || w.customIconUrl) && (
                    <div className="w-8 h-8 relative border rounded overflow-hidden bg-gray-50 flex-none">
                      <img
                        src={iconPreviews[w.id] || w.customIconUrl}
                        alt="Icon"
                        className="w-full h-full object-contain"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 text-xs">
              <div>
                <Label className="text-xs">Desktop order</Label>
                <Input
                  type="number"
                  value={w.orderDesktop}
                  onChange={(e) => updateWindowLocal(w.id, { orderDesktop: parseInt(e.target.value) || 0 })}
                  className="w-20 h-8 text-xs"
                />
              </div>
              <div>
                <Label className="text-xs">Home order</Label>
                <Input
                  type="number"
                  value={w.orderHome}
                  onChange={(e) => updateWindowLocal(w.id, { orderHome: parseInt(e.target.value) || 0 })}
                  className="w-20 h-8 text-xs"
                />
              </div>
              <Button size="sm" onClick={() => saveWindow(w)} disabled={savingId === w.id}>
                <Save className="w-3 h-3 mr-1" />
                Save
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-between items-center mt-6">
        <h3 className="font-semibold text-lg">Custom Windows</h3>
        <Button size="sm" onClick={createWindow} disabled={creating}>
          <Plus className="w-4 h-4 mr-1" />
          Add Custom Window
        </Button>
      </div>

      <div className="space-y-3">
        {custom.length === 0 && <p className="text-sm text-gray-500">No custom windows yet.</p>}
        {custom.map((w) => (
          <div key={w.id} className="p-3 border rounded bg-white space-y-3">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div className="space-y-1 flex-1">
                <div className="flex gap-3">
                  <div className="flex-1">
                    <Label className="text-xs">Label</Label>
                    <Input
                      value={w.label}
                      onChange={(e) => updateWindowLocal(w.id, { label: e.target.value })}
                      className="h-8 text-sm"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Key</Label>
                    <Input
                      value={w.key}
                      onChange={(e) => updateWindowLocal(w.id, { key: e.target.value })}
                      className="h-8 text-sm w-32"
                    />
                  </div>
                </div>
                <div className="flex flex-wrap gap-3 text-xs text-gray-600 mt-1">
                  <label className="flex items-center gap-1">
                    <input
                      type="checkbox"
                      checked={w.showOnDesktop}
                      onChange={(e) => updateWindowLocal(w.id, { showOnDesktop: e.target.checked })}
                    />
                    Show on desktop
                  </label>
                  <label className="flex items-center gap-1">
                    <input
                      type="checkbox"
                      checked={w.showInHome}
                      onChange={(e) => updateWindowLocal(w.id, { showInHome: e.target.checked })}
                    />
                    Show in home grid
                  </label>
                  <label className="flex items-center gap-1">
                    <input
                      type="checkbox"
                      checked={w.isHidden}
                      onChange={(e) => updateWindowLocal(w.id, { isHidden: e.target.checked })}
                    />
                    Hidden
                  </label>
                  <label className="flex items-center gap-1 text-red-600">
                    <input
                      type="checkbox"
                      checked={w.isArchived}
                      onChange={(e) => {
                        if (confirm("Are you sure you want to archive this window?")) {
                          saveWindow({ ...w, isArchived: e.target.checked })
                        }
                      }}
                    />
                    Move to archive
                  </label>
                </div>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <div>
                  <Label className="text-xs">Desktop order</Label>
                  <Input
                    type="number"
                    value={w.orderDesktop}
                    onChange={(e) => updateWindowLocal(w.id, { orderDesktop: parseInt(e.target.value) || 0 })}
                    className="w-20 h-8 text-xs"
                  />
                </div>
                <div>
                  <Label className="text-xs">Home order</Label>
                  <Input
                    type="number"
                    value={w.orderHome}
                    onChange={(e) => updateWindowLocal(w.id, { orderHome: parseInt(e.target.value) || 0 })}
                    className="w-20 h-8 text-xs"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-3">
              <Button size="sm" variant="outline" onClick={() => deleteWindow(w.id)} disabled={savingId === w.id}>
                <Trash2 className="w-3 h-3 mr-1" />
                Delete
              </Button>
              <Button size="sm" onClick={() => saveWindow(w)} disabled={savingId === w.id}>
                <Save className="w-3 h-3 mr-1" />
                Save
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div >
  )
}

// Custom Panel Editor Component
function CustomPanelEditor({
  window,
  onUpdate,
}: {
  window: WindowConfig
  onUpdate: () => void
}) {
  const [formData, setFormData] = useState(window)
  const [iconFile, setIconFile] = useState<File | null>(null)
  const [iconPreview, setIconPreview] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [customProjects, setCustomProjects] = useState<Project[]>([])
  const [editingCustomProject, setEditingCustomProject] = useState<Project | null>(null)
  const [isCustomProjectDialogOpen, setIsCustomProjectDialogOpen] = useState(false)
  const [customFaqItems, setCustomFaqItems] = useState<FaqItem[]>([])
  const [editingCustomFaq, setEditingCustomFaq] = useState<FaqItem | null>(null)
  const [isCustomFaqDialogOpen, setIsCustomFaqDialogOpen] = useState(false)

  useEffect(() => {
    setFormData(window)
    // Load custom projects for this tab if layout is projects or gallery
    if (window.layout === "projects" || window.layout === "gallery") {
      loadCustomProjects()
    }
    // Load custom FAQ items for this tab if layout is faq
    if (window.layout === "faq") {
      loadCustomFaqItems()
    }
  }, [window])

  const loadCustomProjects = async () => {
    try {
      const res = await fetch("/api/projects")
      const rawProjects = await res.json()
      const allProjects: Project[] = rawProjects.map((p: any) => ({
        ...p,
        photos: Array.isArray(p.photos) ? p.photos : [],
        keywords: Array.isArray(p.keywords) ? p.keywords : [],
        tags: Array.isArray(p.tags) ? p.tags : [],
      }))
      // Filter projects for this custom tab
      const filtered = allProjects.filter((p) => p.customTabKey === window.key)
      setCustomProjects(filtered)
    } catch (error) {
      console.error("Failed to load custom projects:", error)
    }
  }

  const handleSaveCustomProject = async ({ project, mainImageFile }: { project: Project; mainImageFile?: File | null }) => {
    try {
      const projectData = {
        ...project,
        customTabKey: window.key,
        category: "engineering" as const, // Default category for custom projects
      }

      const method = projectData.id ? "PUT" : "POST"
      let response: Response

      if (mainImageFile) {
        const formData = new FormData()
        Object.entries(projectData).forEach(([key, value]) => {
          if (value === undefined || value === null) return
          const finalKey = key === "image_url" ? "imageUrl" : key === "order_index" ? "orderIndex" : key === "is_active" ? "isActive" : key
          if (Array.isArray(value)) {
            formData.append(finalKey, JSON.stringify(value))
          } else {
            formData.append(finalKey, String(value))
          }
        })
        formData.append("image", mainImageFile)

        response = await fetch("/api/projects", {
          method,
          body: formData,
        })
      } else {
        // Map fields for JSON payload
        const payloadJson: any = { ...projectData }
        if ("image_url" in payloadJson) {
          payloadJson.imageUrl = payloadJson.image_url
          delete payloadJson.image_url
        }
        if ("order_index" in payloadJson) {
          payloadJson.orderIndex = payloadJson.order_index
          delete payloadJson.order_index
        }
        if ("is_active" in payloadJson) {
          payloadJson.isActive = payloadJson.is_active
          delete payloadJson.is_active
        }
        response = await fetch("/api/projects", {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payloadJson),
        })
      }

      if (response.ok) {
        await loadCustomProjects()
        setIsCustomProjectDialogOpen(false)
        setEditingCustomProject(null)
      } else {
        alert("Failed to save project")
      }
    } catch (error) {
      alert("Failed to save project")
    }
  }

  const handleDeleteCustomProject = async (id: number) => {
    if (!confirm("Delete this project?")) return
    try {
      const res = await fetch(`/api/projects?id=${id}`, { method: "DELETE" })
      if (!res.ok) {
        alert("Failed to delete project")
        return
      }
      await loadCustomProjects()
    } catch (error) {
      alert("Failed to delete project")
    }
  }

  const loadCustomFaqItems = async () => {
    try {
      const res = await fetch("/api/faq")
      const allFaqItems = await res.json()
      // Filter FAQ items for this custom tab
      const filtered = allFaqItems.filter((item: FaqItem) => item.customTabKey === window.key)
      setCustomFaqItems(filtered)
    } catch (error) {
      console.error("Failed to load custom FAQ items:", error)
    }
  }

  const handleSaveCustomFaq = async (item: FaqItem | Omit<FaqItem, "id"> & { id?: number }) => {
    try {
      const faqData = {
        ...item,
        customTabKey: window.key,
      }

      const method = item.id ? "PUT" : "POST"
      const res = await fetch("/api/faq", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(faqData),
      })

      if (!res.ok) {
        alert("Failed to save FAQ item")
        return
      }

      await loadCustomFaqItems()
      setIsCustomFaqDialogOpen(false)
      setEditingCustomFaq(null)
    } catch (error) {
      alert("Failed to save FAQ item")
    }
  }

  const handleDeleteCustomFaq = async (id: number) => {
    if (!confirm("Delete this FAQ item?")) return
    try {
      const res = await fetch(`/api/faq?id=${id}`, { method: "DELETE" })
      if (!res.ok) {
        alert("Failed to delete FAQ item")
        return
      }
      await loadCustomFaqItems()
    } catch (error) {
      alert("Failed to delete FAQ item")
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      if (iconFile) {
        const formDataObj = new FormData()
        formDataObj.append("key", formData.key)
        formDataObj.append("label", formData.label)
        formDataObj.append("content", formData.content || "")
        formDataObj.append("layout", formData.layout || "content")
        formDataObj.append("icon", formData.icon || "folder")
        formDataObj.append("icon", iconFile)

        const res = await fetch("/api/custom-panels", {
          method: "PUT",
          body: formDataObj,
        })
        if (!res.ok) {
          alert("Failed to save panel")
          return
        }
      } else {
        const res = await fetch("/api/custom-panels", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            key: formData.key,
            label: formData.label,
            content: formData.content,
            layout: formData.layout,
            icon: formData.icon,
          }),
        })
        if (!res.ok) {
          alert("Failed to save panel")
          return
        }
      }

      onUpdate()
      setIconFile(null)
      setIconPreview(null)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{formData.label || "Unnamed Panel"}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>Panel Label</Label>
          <Input
            value={formData.label}
            onChange={(e) => setFormData({ ...formData, label: e.target.value })}
            placeholder="Panel name"
          />
        </div>

        <div>
          <Label>Layout Type</Label>
          <Select
            value={formData.layout || "content"}
            onValueChange={(value: "content" | "projects" | "faq") =>
              setFormData({ ...formData, layout: value })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="content">Simple Content (like About)</SelectItem>
              <SelectItem value="projects">Projects List (like Engineering/Games)</SelectItem>
              <SelectItem value="gallery">Gallery Style (like Art)</SelectItem>
              <SelectItem value="faq">FAQ Style</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Icon</Label>
          <div className="space-y-2">
            <Select
              value={formData.icon || "folder"}
              onValueChange={(value) => setFormData({ ...formData, icon: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="rocket">Rocket</SelectItem>
                <SelectItem value="gamepad">Gamepad</SelectItem>
                <SelectItem value="palette">Palette</SelectItem>
                <SelectItem value="mail">Mail</SelectItem>
                <SelectItem value="help">Help</SelectItem>
                <SelectItem value="folder">Folder</SelectItem>
              </SelectContent>
            </Select>
            <div>
              <Label className="text-xs text-gray-600">Or upload custom icon image</Label>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null
                  setIconFile(file)
                  if (file) {
                    const reader = new FileReader()
                    reader.onloadend = () => {
                      setIconPreview(reader.result as string)
                    }
                    reader.readAsDataURL(file)
                  } else {
                    setIconPreview(null)
                  }
                }}
                className="mt-1"
              />
              {(iconPreview || formData.customIconUrl) && (
                <div className="mt-2 flex items-center gap-2">
                  <img
                    src={iconPreview || formData.customIconUrl || ""}
                    alt="Custom icon preview"
                    className="w-16 h-16 object-contain border rounded p-1"
                  />
                  <span className="text-xs text-gray-500">
                    {iconFile ? `New: ${iconFile.name}` : "Current icon"}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {(formData.layout === "projects" || formData.layout === "gallery") ? (
          // Projects/Gallery Layout - Show project management interface
          <div>
            <div className="flex justify-between items-center mb-4">
              <Label className="text-lg font-semibold">Projects for this tab</Label>
              <Button
                size="sm"
                onClick={() => {
                  setEditingCustomProject({
                    id: 0,
                    title: "",
                    description: "",
                    category: "engineering",
                    photos: [],
                    keywords: [],
                    projectLink: "",
                    tags: [],
                    order_index: customProjects.length + 1,
                    is_active: true,
                    customTabKey: window.key,
                  })
                  setIsCustomProjectDialogOpen(true)
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Project
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {customProjects.length === 0 ? (
                <p className="text-sm text-gray-500 col-span-full">No projects yet. Click "Add Project" to get started.</p>
              ) : (
                customProjects.map((project) => (
                  <Card key={project.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{project.title}</CardTitle>
                          <Badge variant="secondary" className="mt-1">
                            {formData.label}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">{project.description}</p>
                      <div className="flex flex-wrap gap-1 mb-4">
                        {project.tags.map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => {
                            setEditingCustomProject(project)
                            setIsCustomProjectDialogOpen(true)
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDeleteCustomProject(project.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        ) : formData.layout === "faq" ? (
          // FAQ Layout - Show FAQ management interface
          <div>
            <div className="flex justify-between items-center mb-4">
              <Label className="text-lg font-semibold">FAQ Items for this tab</Label>
              <Button
                size="sm"
                onClick={() => {
                  setEditingCustomFaq({
                    id: 0,
                    question: "",
                    answer: "",
                    order: customFaqItems.length + 1,
                    isActive: true,
                    customTabKey: window.key,
                  })
                  setIsCustomFaqDialogOpen(true)
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add FAQ Item
              </Button>
            </div>
            <div className="grid grid-cols-1 gap-6">
              {customFaqItems.length === 0 ? (
                <p className="text-sm text-gray-500 col-span-full">No FAQ items yet. Click "Add FAQ Item" to get started.</p>
              ) : (
                <div className="space-y-2">
                  {customFaqItems.map((item) => (
                    <div key={item.id} className="group relative">
                      <div className="pr-20">
                        <FaqAccordion items={[item]} />
                      </div>
                      <div className="absolute top-4 right-2 flex gap-2 opacity-100 transition-opacity">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => {
                            setEditingCustomFaq(item)
                            setIsCustomFaqDialogOpen(true)
                          }}
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDeleteCustomFaq(item.id)}>
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          // Content Layout - Show textarea
          <div>
            <Label>Content</Label>
            <Textarea
              value={formData.content || ""}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              rows={8}
              placeholder="Enter content for this panel..."
            />
            <p className="text-xs text-gray-500 mt-1">
              Supports rich text: **bold**, *italic*, [link](url), [text](#color), and lists (- item).
            </p>
          </div>
        )}

        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={saving}>
            <Save className="w-4 h-4 mr-2" />
            {saving ? "Saving..." : "Save Panel"}
          </Button>
        </div>
      </CardContent>

      {/* Custom Project Dialog */}
      <Dialog open={isCustomProjectDialogOpen} onOpenChange={setIsCustomProjectDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingCustomProject?.id ? "Edit Project" : "Add Project"}</DialogTitle>
          </DialogHeader>
          {editingCustomProject && (
            <ProjectForm
              project={editingCustomProject}
              onSave={handleSaveCustomProject}
              onCancel={() => {
                setIsCustomProjectDialogOpen(false)
                setEditingCustomProject(null)
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Custom FAQ Dialog */}
      <Dialog open={isCustomFaqDialogOpen} onOpenChange={setIsCustomFaqDialogOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>{editingCustomFaq?.id ? "Edit FAQ Item" : "Add FAQ Item"}</DialogTitle>
          </DialogHeader>
          {editingCustomFaq && (
            <FaqForm
              item={editingCustomFaq}
              onSave={handleSaveCustomFaq}
              onCancel={() => {
                setIsCustomFaqDialogOpen(false)
                setEditingCustomFaq(null)
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </Card>
  )
}



