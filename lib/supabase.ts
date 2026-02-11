import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Type definitions for our database tables
export interface DbProject {
    id: number
    title: string
    description: string
    category: 'engineering' | 'games' | 'art'
    image_url?: string
    photos: string[]
    keywords: string[]
    project_link?: string
    tags: string[]
    order_index: number
    is_active: boolean
    custom_tab_key?: string
    created_at?: string
}

export interface DbContent {
    id: number
    section: string
    title: string
    content: string
    image_url?: string
}

export interface DbFaq {
    id: number
    question: string
    answer: string
    order: number
    is_active: boolean
    custom_tab_key?: string
}

export interface DbContactLink {
    id: number
    name: string
    url: string
    icon_url: string
    order: number
    is_active: boolean
    show_on_desktop: boolean
}

export interface DbWindow {
    id: number
    key: string
    label: string
    type: 'builtIn' | 'custom'
    show_on_desktop: boolean
    show_in_home: boolean
    order_desktop: number
    order_home: number
    is_hidden: boolean
    content?: string
    icon?: string
    custom_icon_url?: string
    layout?: 'content' | 'projects' | 'faq' | 'gallery'
    is_archived: boolean
}

export interface DbBackground {
    id: number
    mode: 'desktop' | 'mobile'
    type: 'solid' | 'gradient' | 'image'
    color: string
    from_color: string
    via_color: string
    to_color: string
    overlay: boolean
    image_url?: string
    icon_color?: string
}
