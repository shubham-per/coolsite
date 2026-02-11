import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// This endpoint ensures default builtIn windows exist (like FAQ)
// GET /api/init-windows - adds missing default windows
export async function GET() {
    try {
        const defaultWindows = [
            { key: 'faq', label: 'FAQ', type: 'builtIn', show_on_desktop: true, show_in_home: true, order_desktop: 7, order_home: 6 },
        ];

        const results = [];

        for (const win of defaultWindows) {
            // Check if window already exists
            const { data: existing } = await supabase
                .from('windows')
                .select('id')
                .eq('key', win.key)
                .single();

            if (!existing) {
                // Insert the window
                const { data, error } = await supabase
                    .from('windows')
                    .insert({
                        ...win,
                        is_hidden: false,
                        is_archived: false,
                        content: '',
                        icon: win.key === 'faq' ? 'help-circle' : 'folder',
                        layout: win.key === 'faq' ? 'faq' : 'content',
                    })
                    .select()
                    .single();

                if (error) {
                    results.push({ key: win.key, status: 'error', error: error.message });
                } else {
                    results.push({ key: win.key, status: 'created', id: data.id });
                }
            } else {
                results.push({ key: win.key, status: 'exists', id: existing.id });
            }
        }

        return NextResponse.json({
            success: true,
            message: 'Default windows initialized',
            results
        });
    } catch (error) {
        console.error('Init windows error:', error);
        return NextResponse.json({ error: 'Failed to initialize windows' }, { status: 500 });
    }
}
