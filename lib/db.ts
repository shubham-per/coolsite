import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export interface User {
  id: number
  email: string
  password_hash: string
  role: string
  created_at: string
}

export interface Content {
  id: number
  section: string
  title: string
  content: string
  updated_at: string
}

export interface Project {
  id: number
  title: string
  description: string
  category: "engineering" | "games" | "art"
  imageUrl?: string
  photos: string[]
  keywords: string[]
  projectLink?: string
  tags: string[]
  orderIndex: number
  isActive: boolean
  cardStyle?: string
  createdAt: string
  updatedAt: string
}

export interface Analytics {
  id: number
  visitor_id: string
  page: string
  action: string
  user_agent: string
  ip_address: string
  referrer?: string
  session_id: string
  timestamp: string
}

export interface DesktopIcon {
  id: number
  icon_type: string
  icon_name: string
  label: string
  window_id: string
  position_x: number
  position_y: number
  is_active: boolean
  order_index: number
  created_at: string
  updated_at: string
}

export interface HomeIcon {
  id: number
  icon_type: string
  icon_name: string
  label: string
  window_id: string
  color: string
  size: string
  is_active: boolean
  order_index: number
  created_at: string
  updated_at: string
}

export interface Wallpaper {
  id: number
  type: 'gradient' | 'image'
  name: string
  config: any
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface SocialIcon {
  id: number
  platform: string
  icon_name: string
  label: string
  url: string
  color: string
  position_x: number
  position_y: number
  is_active: boolean
  order_index: number
  created_at: string
  updated_at: string
}

// Content functions
export async function getContent(section: string): Promise<Content | null> {
  const result = await sql`SELECT * FROM content WHERE section = ${section} LIMIT 1`
  if (!result[0]) return null
  const row = result[0]
  return {
    id: row.id,
    section: row.section,
    title: row.title,
    content: row.content,
    updated_at: row.updated_at,
  }
}

export async function updateContent(section: string, title: string, content: string): Promise<void> {
  await sql`
    INSERT INTO content (section, title, content, updated_at)
    VALUES (${section}, ${title}, ${content}, NOW())
    ON CONFLICT (section) 
    DO UPDATE SET title = ${title}, content = ${content}, updated_at = NOW()
  `
}

// Project functions
export async function getProjects(category?: string): Promise<Project[]> {
  if (category) {
    const result = await sql`
      SELECT * FROM projects 
      WHERE category = ${category} AND is_active = true 
      ORDER BY order_index ASC, created_at DESC
    `
    return result.map((row: any) => ({
      id: row.id,
      title: row.title,
      description: row.description,
      category: row.category,
      imageUrl: row.image_url,
      photos: row.photos || [],
      keywords: row.keywords || [],
      projectLink: row.project_link,
      tags: row.tags || [],
      orderIndex: row.order_index,
      isActive: row.is_active,
      cardStyle: row.card_style || 'style1',
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }))
  }
  const result = await sql`
    SELECT * FROM projects 
    WHERE is_active = true 
    ORDER BY category, order_index ASC, created_at DESC
  `
  return result.map((row: any) => ({
    id: row.id,
    title: row.title,
    description: row.description,
    category: row.category,
    imageUrl: row.image_url,
    photos: row.photos || [],
    keywords: row.keywords || [],
    projectLink: row.project_link,
    tags: row.tags || [],
    orderIndex: row.order_index,
    isActive: row.is_active,
    cardStyle: row.card_style || 'style1',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }))
}

export async function createProject(project: Omit<Project, "id" | "createdAt" | "updatedAt">): Promise<Project> {
  const result = await sql`
    INSERT INTO projects (title, description, category, image_url, photos, keywords, project_link, tags, order_index, is_active, card_style)
    VALUES (${project.title}, ${project.description}, ${project.category}, ${project.imageUrl}, ${project.photos}, ${project.keywords}, ${project.projectLink}, ${project.tags}, ${project.orderIndex}, ${project.isActive}, ${project.cardStyle || 'style1'})
    RETURNING *
  `
  const row = result[0]
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    category: row.category,
    imageUrl: row.image_url,
    photos: row.photos || [],
    keywords: row.keywords || [],
    projectLink: row.project_link,
    tags: row.tags || [],
    orderIndex: row.order_index,
    isActive: row.is_active,
    cardStyle: row.card_style || 'style1',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export async function updateProject(id: number, project: Partial<Project>): Promise<void> {
  // Convert camelCase to snake_case for database columns
  const toSnakeCase = (str: string) => str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);

  await sql`
    UPDATE projects SET
      title = COALESCE(${project.title ?? null}, title),
      description = COALESCE(${project.description ?? null}, description),
      category = COALESCE(${project.category ?? null}, category),
      image_url = COALESCE(${project.imageUrl ?? null}, image_url),
      photos = COALESCE(${project.photos ? JSON.stringify(project.photos) : null}::jsonb, photos),
      keywords = COALESCE(${project.keywords ? JSON.stringify(project.keywords) : null}::jsonb, keywords),
      project_link = COALESCE(${project.projectLink ?? null}, project_link),
      tags = COALESCE(${project.tags ? JSON.stringify(project.tags) : null}::jsonb, tags),
      order_index = COALESCE(${project.orderIndex ?? null}, order_index),
      is_active = COALESCE(${project.isActive ?? null}, is_active),
      card_style = COALESCE(${project.cardStyle ?? null}, card_style),
      updated_at = NOW()
    WHERE id = ${id}
  `
}

export async function deleteProject(id: number): Promise<void> {
  await sql`UPDATE projects SET is_active = false WHERE id = ${id}`
}

// Analytics functions
export async function trackVisit(data: Omit<Analytics, "id" | "timestamp">): Promise<void> {
  await sql`
    INSERT INTO analytics (visitor_id, page, action, user_agent, ip_address, referrer, session_id)
    VALUES (${data.visitor_id}, ${data.page}, ${data.action}, ${data.user_agent}, ${data.ip_address}, ${data.referrer}, ${data.session_id})
  `
}

export async function getAnalytics(days = 30) {
  // Use parameterized interval with MAKE_INTERVAL for safety
  const pageViews = await sql`
    SELECT page, COUNT(*) as views
    FROM analytics 
    WHERE timestamp > NOW() - MAKE_INTERVAL(days => ${days})
    GROUP BY page
    ORDER BY views DESC
  `

  const dailyVisits = await sql`
    SELECT DATE(timestamp) as date, COUNT(DISTINCT visitor_id) as unique_visitors, COUNT(*) as total_views
    FROM analytics 
    WHERE timestamp > NOW() - MAKE_INTERVAL(days => ${days})
    GROUP BY DATE(timestamp)
    ORDER BY date DESC
  `

  const topReferrers = await sql`
    SELECT referrer, COUNT(*) as visits
    FROM analytics 
    WHERE timestamp > NOW() - MAKE_INTERVAL(days => ${days}) AND referrer IS NOT NULL
    GROUP BY referrer
    ORDER BY visits DESC
    LIMIT 10
  `

  return { pageViews, dailyVisits, topReferrers }
}

// User functions
export async function getUserByEmail(email: string): Promise<User | null> {
  const result = await sql`SELECT * FROM users WHERE email = ${email} LIMIT 1`
  if (!result[0]) return null
  const row = result[0]
  return {
    id: row.id,
    email: row.email,
    password_hash: row.password_hash,
    role: row.role,
    created_at: row.created_at,
  }
}

// Desktop Icons Management
export async function getDesktopIcons(): Promise<DesktopIcon[]> {
  const result = await sql`SELECT * FROM desktop_icons WHERE is_active = true ORDER BY order_index ASC`
  return result.map((row: any) => ({
    id: row.id,
    icon_type: row.icon_type,
    icon_name: row.icon_name,
    label: row.label,
    window_id: row.window_id,
    position_x: row.position_x,
    position_y: row.position_y,
    is_active: row.is_active,
    order_index: row.order_index,
    created_at: row.created_at,
    updated_at: row.updated_at,
  }))
}

export async function updateDesktopIcon(id: number, icon: Partial<DesktopIcon>): Promise<void> {
  await sql`
    UPDATE desktop_icons SET
      icon_type = COALESCE(${icon.icon_type ?? null}, icon_type),
      icon_name = COALESCE(${icon.icon_name ?? null}, icon_name),
      label = COALESCE(${icon.label ?? null}, label),
      window_id = COALESCE(${icon.window_id ?? null}, window_id),
      position_x = COALESCE(${icon.position_x ?? null}, position_x),
      position_y = COALESCE(${icon.position_y ?? null}, position_y),
      is_active = COALESCE(${icon.is_active ?? null}, is_active),
      order_index = COALESCE(${icon.order_index ?? null}, order_index),
      updated_at = NOW()
    WHERE id = ${id}
  `
}

// Home Icons Management
export async function getHomeIcons(): Promise<HomeIcon[]> {
  const result = await sql`SELECT * FROM home_icons WHERE is_active = true ORDER BY order_index ASC`
  return result.map((row: any) => ({
    id: row.id,
    icon_type: row.icon_type,
    icon_name: row.icon_name,
    label: row.label,
    window_id: row.window_id,
    color: row.color,
    size: row.size,
    is_active: row.is_active,
    order_index: row.order_index,
    created_at: row.created_at,
    updated_at: row.updated_at,
  }))
}

export async function updateHomeIcon(id: number, icon: Partial<HomeIcon>): Promise<void> {
  await sql`
    UPDATE home_icons SET
      icon_type = COALESCE(${icon.icon_type ?? null}, icon_type),
      icon_name = COALESCE(${icon.icon_name ?? null}, icon_name),
      label = COALESCE(${icon.label ?? null}, label),
      window_id = COALESCE(${icon.window_id ?? null}, window_id),
      color = COALESCE(${icon.color ?? null}, color),
      size = COALESCE(${icon.size ?? null}, size),
      is_active = COALESCE(${icon.is_active ?? null}, is_active),
      order_index = COALESCE(${icon.order_index ?? null}, order_index),
      updated_at = NOW()
    WHERE id = ${id}
  `
}

// Wallpaper Management
export async function getActiveWallpaper(): Promise<Wallpaper | null> {
  const result = await sql`SELECT * FROM wallpapers WHERE is_active = true LIMIT 1`
  if (!result[0]) return null
  const row = result[0]
  return {
    id: row.id,
    type: row.type,
    name: row.name,
    config: row.config,
    is_active: row.is_active,
    created_at: row.created_at,
    updated_at: row.updated_at,
  }
}

export async function getAllWallpapers(): Promise<Wallpaper[]> {
  const result = await sql`SELECT * FROM wallpapers ORDER BY created_at DESC`
  return result.map((row: any) => ({
    id: row.id,
    type: row.type,
    name: row.name,
    config: row.config,
    is_active: row.is_active,
    created_at: row.created_at,
    updated_at: row.updated_at,
  }))
}

export async function createWallpaper(wallpaper: Omit<Wallpaper, "id" | "created_at" | "updated_at">): Promise<Wallpaper> {
  const result = await sql`
    INSERT INTO wallpapers (type, name, config, is_active)
    VALUES (${wallpaper.type}, ${wallpaper.name}, ${JSON.stringify(wallpaper.config)}, ${wallpaper.is_active})
    RETURNING *
  `
  const row = result[0]
  return {
    id: row.id,
    type: row.type,
    name: row.name,
    config: row.config,
    is_active: row.is_active,
    created_at: row.created_at,
    updated_at: row.updated_at,
  }
}

export async function updateWallpaper(id: number, wallpaper: Partial<Wallpaper>): Promise<void> {
  await sql`
    UPDATE wallpapers SET
      type = COALESCE(${wallpaper.type ?? null}, type),
      name = COALESCE(${wallpaper.name ?? null}, name),
      config = COALESCE(${wallpaper.config ? JSON.stringify(wallpaper.config) : null}::jsonb, config),
      is_active = COALESCE(${wallpaper.is_active ?? null}, is_active),
      updated_at = NOW()
    WHERE id = ${id}
  `
}

export async function setActiveWallpaper(id: number): Promise<void> {
  // First, deactivate all wallpapers
  await sql`UPDATE wallpapers SET is_active = false`
  // Then activate the selected one
  await sql`UPDATE wallpapers SET is_active = true, updated_at = NOW() WHERE id = ${id}`
}

// Social Icons Management
export async function getSocialIcons(): Promise<SocialIcon[]> {
  const result = await sql`SELECT * FROM social_icons WHERE is_active = true ORDER BY order_index ASC`
  return result.map((row: any) => ({
    id: row.id,
    platform: row.platform,
    icon_name: row.icon_name,
    label: row.label,
    url: row.url,
    color: row.color,
    position_x: row.position_x,
    position_y: row.position_y,
    is_active: row.is_active,
    order_index: row.order_index,
    created_at: row.created_at,
    updated_at: row.updated_at,
  }))
}

export async function updateSocialIcon(id: number, icon: Partial<SocialIcon>): Promise<void> {
  await sql`
    UPDATE social_icons SET
      platform = COALESCE(${icon.platform ?? null}, platform),
      icon_name = COALESCE(${icon.icon_name ?? null}, icon_name),
      label = COALESCE(${icon.label ?? null}, label),
      url = COALESCE(${icon.url ?? null}, url),
      color = COALESCE(${icon.color ?? null}, color),
      position_x = COALESCE(${icon.position_x ?? null}, position_x),
      position_y = COALESCE(${icon.position_y ?? null}, position_y),
      is_active = COALESCE(${icon.is_active ?? null}, is_active),
      order_index = COALESCE(${icon.order_index ?? null}, order_index),
      updated_at = NOW()
    WHERE id = ${id}
  `
}
