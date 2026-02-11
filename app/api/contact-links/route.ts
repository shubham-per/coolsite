import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { requireAuth } from '@/lib/auth';

export async function GET() {
    try {
        const { data, error } = await supabase
            .from('contact_links')
            .select('*')
            .order('order', { ascending: true });

        if (error) {
            console.error('Contact links GET error:', error);
            return NextResponse.json({ error: 'Failed to fetch contact links' }, { status: 500 });
        }

        const links = (data || []).map(l => ({
            id: l.id,
            name: l.name,
            url: l.url,
            iconUrl: l.icon_url,
            order: l.order,
            isActive: l.is_active,
            showOnDesktop: l.show_on_desktop,
        }));

        return NextResponse.json(links);
    } catch (error) {
        console.error('Contact links GET error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        try {
            requireAuth(request);
        } catch {
            return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
        }

        const contentType = request.headers.get('content-type') || '';
        let data: any = {};

        if (contentType.startsWith('multipart/form-data')) {
            const formData = await request.formData();
            for (const [key, value] of formData.entries()) {
                if (typeof value === 'string') {
                    data[key] = value;
                } else if (value instanceof File) {
                    // Upload to GitHub
                    const uploadFormData = new FormData();
                    uploadFormData.append('file', value);
                    uploadFormData.append('folder', 'icons');

                    const uploadResponse = await fetch(`${request.nextUrl.origin}/api/upload-github`, {
                        method: 'POST',
                        body: uploadFormData,
                    });

                    if (uploadResponse.ok) {
                        const uploadResult = await uploadResponse.json();
                        data.iconUrl = uploadResult.url;
                    }
                }
            }
        } else {
            data = await request.json();
        }

        if (!data.name || !data.url) {
            return NextResponse.json({ error: 'Name and URL are required' }, { status: 400 });
        }

        // Check if updating existing or creating new
        if (data.id) {
            const updateData: any = {};
            if (data.name !== undefined) updateData.name = data.name;
            if (data.url !== undefined) updateData.url = data.url;
            if (data.iconUrl !== undefined) updateData.icon_url = data.iconUrl;
            if (data.order !== undefined) updateData.order = parseInt(data.order);
            if (data.isActive !== undefined) updateData.is_active = data.isActive === 'true' || data.isActive === true;
            if (data.showOnDesktop !== undefined) updateData.show_on_desktop = data.showOnDesktop === 'true' || data.showOnDesktop === true;

            const { data: updated, error } = await supabase
                .from('contact_links')
                .update(updateData)
                .eq('id', parseInt(data.id))
                .select()
                .single();

            if (error) {
                console.error('Contact links PUT error:', error);
                return NextResponse.json({ error: 'Failed to update contact link' }, { status: 500 });
            }

            return NextResponse.json({
                id: updated.id,
                name: updated.name,
                url: updated.url,
                iconUrl: updated.icon_url,
                order: updated.order,
                isActive: updated.is_active,
                showOnDesktop: updated.show_on_desktop,
            });
        } else {
            const { data: newLink, error } = await supabase
                .from('contact_links')
                .insert({
                    name: data.name,
                    url: data.url,
                    icon_url: data.iconUrl || '',
                    order: parseInt(data.order) || 0,
                    is_active: data.isActive !== 'false' && data.isActive !== false,
                    show_on_desktop: data.showOnDesktop !== 'false' && data.showOnDesktop !== false,
                })
                .select()
                .single();

            if (error) {
                console.error('Contact links POST error:', error);
                return NextResponse.json({ error: 'Failed to create contact link' }, { status: 500 });
            }

            return NextResponse.json({
                id: newLink.id,
                name: newLink.name,
                url: newLink.url,
                iconUrl: newLink.icon_url,
                order: newLink.order,
                isActive: newLink.is_active,
                showOnDesktop: newLink.show_on_desktop,
            }, { status: 201 });
        }
    } catch (error) {
        console.error('Contact links POST error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function PUT(request: NextRequest) {
    // Redirect to POST for updates
    return POST(request);
}

export async function DELETE(request: NextRequest) {
    try {
        try {
            requireAuth(request);
        } catch {
            return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Contact link ID is required' }, { status: 400 });
        }

        const { error } = await supabase
            .from('contact_links')
            .delete()
            .eq('id', parseInt(id));

        if (error) {
            console.error('Contact links DELETE error:', error);
            return NextResponse.json({ error: 'Failed to delete contact link' }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Contact links DELETE error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
