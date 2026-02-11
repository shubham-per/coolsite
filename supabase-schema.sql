-- Supabase Database Schema for Portfolio Site
-- Run this SQL in your Supabase SQL Editor (Database > SQL Editor)

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'engineering',
  image_url TEXT,
  photos JSONB DEFAULT '[]'::jsonb,
  keywords JSONB DEFAULT '[]'::jsonb,
  project_link TEXT,
  tags JSONB DEFAULT '[]'::jsonb,
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  custom_tab_key TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Content sections table
CREATE TABLE IF NOT EXISTS content (
  id SERIAL PRIMARY KEY,
  section TEXT UNIQUE NOT NULL,
  title TEXT,
  content TEXT,
  image_url TEXT
);

-- FAQ items table
CREATE TABLE IF NOT EXISTS faq (
  id SERIAL PRIMARY KEY,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  "order" INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  custom_tab_key TEXT
);

-- Contact links table
CREATE TABLE IF NOT EXISTS contact_links (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  icon_url TEXT,
  "order" INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  show_on_desktop BOOLEAN DEFAULT true
);

-- Windows configuration table
CREATE TABLE IF NOT EXISTS windows (
  id SERIAL PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  label TEXT NOT NULL,
  type TEXT DEFAULT 'builtIn',
  show_on_desktop BOOLEAN DEFAULT true,
  show_in_home BOOLEAN DEFAULT true,
  order_desktop INTEGER DEFAULT 0,
  order_home INTEGER DEFAULT 0,
  is_hidden BOOLEAN DEFAULT false,
  content TEXT,
  icon TEXT,
  custom_icon_url TEXT,
  layout TEXT DEFAULT 'content',
  is_archived BOOLEAN DEFAULT false
);

-- Background settings table
CREATE TABLE IF NOT EXISTS background (
  id SERIAL PRIMARY KEY,
  mode TEXT UNIQUE NOT NULL, -- 'desktop' or 'mobile'
  type TEXT DEFAULT 'solid',
  color TEXT DEFAULT '#1a1a2e',
  from_color TEXT DEFAULT '#667eea',
  via_color TEXT DEFAULT '#764ba2',
  to_color TEXT DEFAULT '#f093fb',
  overlay BOOLEAN DEFAULT false,
  image_url TEXT,
  icon_color TEXT DEFAULT '#ffffff'
);

-- Enable Row Level Security (optional but recommended)
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE content ENABLE ROW LEVEL SECURITY;
ALTER TABLE faq ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE windows ENABLE ROW LEVEL SECURITY;
ALTER TABLE background ENABLE ROW LEVEL SECURITY;

-- Create policies to allow public read access
CREATE POLICY "Allow public read access" ON projects FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON content FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON faq FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON contact_links FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON windows FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON background FOR SELECT USING (true);

-- Create policies to allow authenticated write access (for admin panel)
CREATE POLICY "Allow authenticated write access" ON projects FOR ALL USING (true);
CREATE POLICY "Allow authenticated write access" ON content FOR ALL USING (true);
CREATE POLICY "Allow authenticated write access" ON faq FOR ALL USING (true);
CREATE POLICY "Allow authenticated write access" ON contact_links FOR ALL USING (true);
CREATE POLICY "Allow authenticated write access" ON windows FOR ALL USING (true);
CREATE POLICY "Allow authenticated write access" ON background FOR ALL USING (true);

-- Insert default background settings
INSERT INTO background (mode, type, color, from_color, via_color, to_color, overlay, icon_color)
VALUES 
  ('desktop', 'solid', '#1a1a2e', '#667eea', '#764ba2', '#f093fb', false, '#ffffff'),
  ('mobile', 'solid', '#1a1a2e', '#667eea', '#764ba2', '#f093fb', false, '#ffffff')
ON CONFLICT (mode) DO NOTHING;

-- Insert default content sections
INSERT INTO content (section, title, content)
VALUES 
  ('about', 'About', 'Welcome to my portfolio!'),
  ('contact', 'Contact', 'Get in touch with me.'),
  ('faq', 'FAQ', 'Frequently asked questions.'),
  ('about_subtitle', 'Subtitle', ''),
  ('home_greeting', 'Greeting', 'hi! i''m'),
  ('home_subtitle', 'Home Subtitle', '')
ON CONFLICT (section) DO NOTHING;

-- Insert default windows
INSERT INTO windows (key, label, type, show_on_desktop, show_in_home, order_desktop, order_home)
VALUES 
  ('home', 'Home', 'builtIn', true, false, 1, 0),
  ('about', 'About', 'builtIn', true, true, 2, 1),
  ('engineering', 'Engineering', 'builtIn', true, true, 3, 2),
  ('games', 'Games', 'builtIn', true, true, 4, 3),
  ('art', 'Art', 'builtIn', true, true, 5, 4),
  ('contact', 'Contact', 'builtIn', true, true, 6, 5),
  ('faq', 'FAQ', 'builtIn', true, true, 7, 6)
ON CONFLICT (key) DO NOTHING;

-- ============================================================================
-- Performance Indexes
-- ============================================================================

-- Projects indexes for filtering and sorting
CREATE INDEX IF NOT EXISTS idx_projects_category ON projects(category);
CREATE INDEX IF NOT EXISTS idx_projects_is_active ON projects(is_active);
CREATE INDEX IF NOT EXISTS idx_projects_order_index ON projects(order_index);
CREATE INDEX IF NOT EXISTS idx_projects_custom_tab_key ON projects(custom_tab_key);

-- FAQ index for ordering
CREATE INDEX IF NOT EXISTS idx_faq_order ON faq("order");
CREATE INDEX IF NOT EXISTS idx_faq_is_active ON faq(is_active);

-- Contact links ordering
CREATE INDEX IF NOT EXISTS idx_contact_links_order ON contact_links("order");

-- Windows ordering
CREATE INDEX IF NOT EXISTS idx_windows_order_desktop ON windows(order_desktop);
CREATE INDEX IF NOT EXISTS idx_windows_order_home ON windows(order_home);

-- Add analytics table if it doesn't exist (referenced in code but not in schema)
CREATE TABLE IF NOT EXISTS analytics (
  id SERIAL PRIMARY KEY,
  visitor_id TEXT NOT NULL,
  page TEXT NOT NULL,
  action TEXT,
  user_agent TEXT,
  ip_address TEXT,
  referrer TEXT,
  session_id TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Analytics indexes for time-based queries
CREATE INDEX IF NOT EXISTS idx_analytics_timestamp ON analytics(timestamp);
CREATE INDEX IF NOT EXISTS idx_analytics_visitor_id ON analytics(visitor_id);
CREATE INDEX IF NOT EXISTS idx_analytics_page ON analytics(page);

-- Enable RLS on analytics
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "Allow public read access" ON analytics FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Allow authenticated write access" ON analytics FOR ALL USING (true);
