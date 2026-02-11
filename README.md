# Portfolio Site (my-site-V2)

A Windows XP-inspired portfolio website built with Next.js 15, featuring draggable windows, customizable backgrounds, and a comprehensive admin panel.

## ✨ Features

- **Desktop Interface** - Windows XP-style UI with draggable, resizable windows
- **Mobile Responsive** - Dedicated mobile layout for smaller screens
- **Admin Panel** - Full content management at `/admin`
- **Project Portfolio** - Showcase Engineering, Games, and Art projects
- **Custom Windows** - Create custom content windows via admin
- **Analytics** - Built-in visitor tracking
- **Dynamic Backgrounds** - Customizable gradients and images for desktop/mobile

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or pnpm
- Supabase account (free tier works)

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd my-site
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   Edit `.env.local` with your values (see [Environment Variables](#environment-variables) below)

4. **Set up the database**
   - Go to your Supabase project → SQL Editor
   - Run the contents of `supabase-schema.sql`

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Access the site**
   - Main site: http://localhost:3000
   - Admin panel: http://localhost:3000/admin

## 🔐 Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | ✅ | Neon/Supabase Postgres connection string |
| `JWT_SECRET` | ✅ | Secret key for JWT tokens (min 32 chars) |
| `ADMIN_EMAIL` | ✅ | Admin login email |
| `ADMIN_PASSWORD` | ✅ | Admin login password |
| `SUPABASE_URL` | ⚪ | Supabase project URL |
| `SUPABASE_ANON_KEY` | ⚪ | Supabase anonymous key |
| `GITHUB_TOKEN` | ⚪ | GitHub token for image uploads |
| `GITHUB_OWNER` | ⚪ | GitHub username for image repo |
| `GITHUB_REPO` | ⚪ | GitHub repo name for images |

## 📁 Project Structure

```
my-site/
├── app/
│   ├── admin/          # Admin panel
│   ├── api/            # API routes
│   └── page.tsx        # Main desktop UI
├── components/
│   ├── ui/             # shadcn/ui components
│   └── ...             # Custom components
├── lib/
│   ├── db.ts           # Database functions
│   ├── types.ts        # Shared TypeScript interfaces
│   ├── auth.ts         # Authentication utilities
│   └── env-validation.ts
├── scripts/            # Setup and migration scripts
└── supabase-schema.sql # Database schema
```

## 🛠️ Admin Panel

Access at `/admin` with your configured credentials.

### Features:
- **Projects** - Add/edit/delete portfolio items
- **Content** - Edit About, Contact, FAQ sections
- **Windows** - Manage custom windows and icons
- **Backgrounds** - Configure desktop/mobile backgrounds
- **Contact Links** - Manage social/contact icons
- **Analytics** - View visitor statistics

See [ADMIN_GUIDE.md](./ADMIN_GUIDE.md) for detailed instructions.

## 🗄️ Database

The project uses PostgreSQL (Supabase/Neon). Key tables:

- `projects` - Portfolio items
- `content` - CMS content sections
- `faq` - FAQ items
- `windows` - Window configurations
- `contact_links` - Contact/social links
- `background` - Background settings
- `analytics` - Visitor tracking

## 🚢 Deployment

### Vercel (Recommended)

1. Connect your GitHub repo to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy!

### Docker

```bash
docker-compose up -d
```

## 📝 Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

## 🔒 Security Notes

- JWT_SECRET is **required** - no fallback defaults
- Admin credentials stored in environment variables
- API routes protected with JWT authentication
- SQL injection protection via parameterized queries

## 📄 License

MIT
