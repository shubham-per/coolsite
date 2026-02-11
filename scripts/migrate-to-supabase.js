/**
 * Data Migration Script: JSON to Supabase
 * 
 * Migrates all data from local JSON files to Supabase database.
 * Run with: node scripts/migrate-to-supabase.js
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Read .env.local file manually (no external dependencies)
function loadEnvFile() {
    const envPath = path.join(__dirname, '..', '.env.local');
    if (!fs.existsSync(envPath)) {
        console.error('❌ .env.local file not found');
        process.exit(1);
    }
    const envContent = fs.readFileSync(envPath, 'utf-8');
    const envVars = {};
    for (const line of envContent.split('\n')) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#')) {
            const eqIndex = trimmed.indexOf('=');
            if (eqIndex > 0) {
                const key = trimmed.substring(0, eqIndex);
                const value = trimmed.substring(eqIndex + 1);
                envVars[key] = value;
            }
        }
    }
    return envVars;
}

const env = loadEnvFile();
const supabaseUrl = env.SUPABASE_URL;
const supabaseKey = env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing SUPABASE_URL or SUPABASE_ANON_KEY in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const DATA_DIR = path.join(__dirname, '..', 'data');

// Helper to read JSON file
function readJson(filename) {
    const filepath = path.join(DATA_DIR, filename);
    if (!fs.existsSync(filepath)) {
        console.warn(`⚠️  File not found: ${filename}`);
        return null;
    }
    return JSON.parse(fs.readFileSync(filepath, 'utf-8'));
}

// Migrate Projects
async function migrateProjects() {
    const projects = readJson('projects.json');
    if (!projects) return;

    console.log(`\n📦 Migrating ${projects.length} projects...`);

    for (const p of projects) {
        const data = {
            id: p.id,
            title: p.title,
            description: p.description || '',
            category: p.category || 'engineering',
            image_url: p.imageUrl || p.image_url || '',
            photos: Array.isArray(p.photos) ? p.photos : [],
            keywords: Array.isArray(p.keywords) ? p.keywords : [],
            project_link: p.projectLink || '',
            tags: Array.isArray(p.tags) ? p.tags : [],
            order_index: p.orderIndex || 0,
            is_active: p.isActive === true || p.isActive === 'true',
            custom_tab_key: p.customTabKey || null,
            created_at: p.createdAt || new Date().toISOString()
        };

        const { error } = await supabase
            .from('projects')
            .upsert(data, { onConflict: 'id' });

        if (error) {
            console.error(`  ❌ Project ${p.id}: ${error.message}`);
        } else {
            console.log(`  ✅ Project ${p.id}: ${p.title}`);
        }
    }
}

// Migrate Content
async function migrateContent() {
    const content = readJson('content.json');
    if (!content) return;

    console.log(`\n📝 Migrating ${content.length} content sections...`);

    for (const c of content) {
        const data = {
            id: c.id,
            section: c.section,
            title: c.title || '',
            content: c.content || '',
            image_url: c.imageUrl || ''
        };

        const { error } = await supabase
            .from('content')
            .upsert(data, { onConflict: 'id' });

        if (error) {
            console.error(`  ❌ Content ${c.section}: ${error.message}`);
        } else {
            console.log(`  ✅ Content: ${c.section}`);
        }
    }
}

// Migrate Windows
async function migrateWindows() {
    const windows = readJson('windows.json');
    if (!windows) return;

    console.log(`\n🪟 Migrating ${windows.length} windows...`);

    for (const w of windows) {
        const data = {
            id: w.id,
            key: w.key,
            label: w.label,
            type: w.type || 'builtIn',
            show_on_desktop: w.showOnDesktop !== false,
            show_in_home: w.showInHome !== false,
            order_desktop: w.orderDesktop || 0,
            order_home: w.orderHome || 0,
            is_hidden: w.isHidden === true,
            content: w.content || '',
            icon: w.icon || '',
            custom_icon_url: w.customIconUrl || '',
            layout: w.layout || 'content',
            is_archived: w.isArchived === true
        };

        const { error } = await supabase
            .from('windows')
            .upsert(data, { onConflict: 'id' });

        if (error) {
            console.error(`  ❌ Window ${w.key}: ${error.message}`);
        } else {
            console.log(`  ✅ Window: ${w.key}`);
        }
    }
}

// Migrate FAQ
async function migrateFaq() {
    const faq = readJson('faq.json');
    if (!faq) return;

    console.log(`\n❓ Migrating ${faq.length} FAQ items...`);

    for (const f of faq) {
        const data = {
            id: f.id,
            question: f.question,
            answer: f.answer,
            order: f.order || 0,
            is_active: f.isActive !== false,
            custom_tab_key: f.customTabKey || null
        };

        const { error } = await supabase
            .from('faq')
            .upsert(data, { onConflict: 'id' });

        if (error) {
            console.error(`  ❌ FAQ ${f.id}: ${error.message}`);
        } else {
            console.log(`  ✅ FAQ: ${f.question.substring(0, 30)}...`);
        }
    }
}

// Migrate Contact Links
async function migrateContactLinks() {
    const links = readJson('contact_links.json');
    if (!links) return;

    console.log(`\n🔗 Migrating ${links.length} contact links...`);

    for (const l of links) {
        const data = {
            id: l.id,
            name: l.name,
            url: l.url,
            icon_url: l.iconUrl || '',
            order: l.order || 0,
            is_active: l.isActive !== false,
            show_on_desktop: l.showOnDesktop !== false
        };

        const { error } = await supabase
            .from('contact_links')
            .upsert(data, { onConflict: 'id' });

        if (error) {
            console.error(`  ❌ Contact ${l.name}: ${error.message}`);
        } else {
            console.log(`  ✅ Contact: ${l.name}`);
        }
    }
}

// Migrate Background Settings
async function migrateBackground() {
    const bg = readJson('background.json');
    if (!bg) return;

    console.log(`\n🎨 Migrating background settings...`);

    const modes = ['desktop', 'mobile'];

    for (const mode of modes) {
        const settings = bg[mode];
        if (!settings) continue;

        const data = {
            mode: mode,
            type: settings.type || 'solid',
            color: settings.color || '#1a1a2e',
            from_color: settings.from || '#667eea',
            via_color: settings.via || '#764ba2',
            to_color: settings.to || '#f093fb',
            overlay: settings.overlay === true,
            image_url: settings.imageUrl || '',
            icon_color: settings.iconColor || '#ffffff'
        };

        const { error } = await supabase
            .from('background')
            .upsert(data, { onConflict: 'mode' });

        if (error) {
            console.error(`  ❌ Background ${mode}: ${error.message}`);
        } else {
            console.log(`  ✅ Background: ${mode}`);
        }
    }
}

// Main migration function
async function main() {
    console.log('🚀 Starting data migration to Supabase...');
    console.log(`📍 Supabase URL: ${supabaseUrl}`);
    console.log(`📁 Data directory: ${DATA_DIR}`);

    try {
        await migrateProjects();
        await migrateContent();
        await migrateWindows();
        await migrateFaq();
        await migrateContactLinks();
        await migrateBackground();

        console.log('\n✅ Migration complete!');
        console.log('💡 Verify data in Supabase Dashboard → Table Editor');
    } catch (err) {
        console.error('\n❌ Migration failed:', err.message);
        process.exit(1);
    }
}

main();
