/**
 * Shared TypeScript Interfaces
 * Centralized type definitions used across the application
 */

// ============================================================================
// Content Types
// ============================================================================

export interface Content {
    id: number;
    section: string;
    title: string;
    content: string;
    imageUrl?: string;
    customTabKey?: string;
    updated_at?: string;
}

// ============================================================================
// Project Types
// ============================================================================

export interface Project {
    id: number;
    title: string;
    description: string;
    category: 'engineering' | 'games' | 'art';
    imageUrl?: string;
    photos: string[];
    keywords: string[];
    projectLink?: string;
    tags: string[];
    orderIndex: number;
    isActive: boolean;
    cardStyle?: string;
    customTabKey?: string;
    createdAt?: string;
    updatedAt?: string;
}

export type ProjectCategory = Project['category'];

// ============================================================================
// FAQ Types
// ============================================================================

export interface FaqItem {
    id: number;
    question: string;
    answer: string;
    order: number;
    isActive: boolean;
    customTabKey?: string;
}

// ============================================================================
// Window Configuration Types
// ============================================================================

export type WindowLayout = 'content' | 'projects' | 'faq' | 'gallery';
export type WindowType = 'builtIn' | 'custom';

export interface WindowConfig {
    id: number;
    key: string;
    label: string;
    type: WindowType;
    showOnDesktop: boolean;
    showInHome: boolean;
    orderDesktop: number;
    orderHome: number;
    isHidden: boolean;
    content?: string;
    icon?: string;
    customIconUrl?: string;
    layout?: WindowLayout;
    isArchived?: boolean;
}

// ============================================================================
// Background Types
// ============================================================================

export type BackgroundType = 'solid' | 'gradient' | 'image';

export interface BackgroundStyle {
    type: BackgroundType;
    color: string;
    from: string;
    via: string;
    to: string;
    overlay?: boolean;
    imageUrl?: string;
    iconColor?: string;
}

export interface BackgroundConfig {
    desktop: BackgroundStyle;
    mobile: BackgroundStyle;
}

// ============================================================================
// Contact Types
// ============================================================================

export interface ContactLink {
    id: number;
    name: string;
    url: string;
    iconUrl: string;
    order: number;
    isActive: boolean;
    showOnDesktop?: boolean;
}

// ============================================================================
// User & Auth Types
// ============================================================================

export interface User {
    id: number;
    email: string;
    password_hash: string;
    role: string;
    created_at: string;
}

export interface AuthUser {
    id: number;
    email: string;
    role: string;
}

// ============================================================================
// Analytics Types
// ============================================================================

export interface Analytics {
    id: number;
    visitor_id: string;
    page: string;
    action: string;
    user_agent: string;
    ip_address: string;
    referrer?: string;
    session_id: string;
    timestamp: string;
}

export interface AnalyticsSummary {
    pageViews: { page: string; views: number }[];
    dailyVisits: { date: string; unique_visitors: number; total_views: number }[];
    topReferrers: { referrer: string; visits: number }[];
}

// ============================================================================
// Icon Types
// ============================================================================

export interface DesktopIcon {
    id: number;
    icon_type: string;
    icon_name: string;
    label: string;
    window_id: string;
    position_x: number;
    position_y: number;
    is_active: boolean;
    order_index: number;
    created_at: string;
    updated_at: string;
}

export interface HomeIcon {
    id: number;
    icon_type: string;
    icon_name: string;
    label: string;
    window_id: string;
    color: string;
    size: string;
    is_active: boolean;
    order_index: number;
    created_at: string;
    updated_at: string;
}

export interface SocialIcon {
    id: number;
    platform: string;
    icon_name: string;
    label: string;
    url: string;
    color: string;
    position_x: number;
    position_y: number;
    is_active: boolean;
    order_index: number;
    created_at: string;
    updated_at: string;
}

// ============================================================================
// Wallpaper Types
// ============================================================================

export interface Wallpaper {
    id: number;
    type: 'gradient' | 'image';
    name: string;
    config: Record<string, unknown>;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}
