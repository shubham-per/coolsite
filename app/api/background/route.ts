import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { requireAuth } from '@/lib/auth';

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('background')
      .select('*');

    if (error) {
      console.error('Background GET error:', error);
      return NextResponse.json({ error: 'Failed to fetch background' }, { status: 500 });
    }

    const config: any = {
      desktop: {
        type: 'solid',
        color: '#1a1a2e',
        from: '#667eea',
        via: '#764ba2',
        to: '#f093fb',
        overlay: false,
        iconColor: '#ffffff',
      },
      mobile: {
        type: 'solid',
        color: '#1a1a2e',
        from: '#667eea',
        via: '#764ba2',
        to: '#f093fb',
        overlay: false,
        iconColor: '#ffffff',
      },
    };

    for (const row of data || []) {
      const mode = row.mode as 'desktop' | 'mobile';
      if (mode === 'desktop' || mode === 'mobile') {
        config[mode] = {
          type: row.type,
          color: row.color,
          from: row.from_color,
          via: row.via_color,
          to: row.to_color,
          overlay: row.overlay,
          imageUrl: row.image_url,
          iconColor: row.icon_color,
        };
      }
    }

    return NextResponse.json(config);
  } catch (error) {
    console.error('Background GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
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
          uploadFormData.append('folder', 'backgrounds');

          const uploadResponse = await fetch(`${request.nextUrl.origin}/api/upload-github`, {
            method: 'POST',
            body: uploadFormData,
          });

          if (uploadResponse.ok) {
            const uploadResult = await uploadResponse.json();
            data.imageUrl = uploadResult.url;
          }
        }
      }
    } else {
      data = await request.json();
    }

    const mode = data.mode || 'desktop';

    const updateData = {
      mode,
      type: data.type || 'solid',
      color: data.color || '#1a1a2e',
      from_color: data.from || '#667eea',
      via_color: data.via || '#764ba2',
      to_color: data.to || '#f093fb',
      overlay: data.overlay === true || data.overlay === 'true',
      image_url: data.imageUrl || null,
      icon_color: data.iconColor || '#ffffff',
    };

    const { error } = await supabase
      .from('background')
      .upsert(updateData, { onConflict: 'mode' });

    if (error) {
      console.error('Background PUT error:', error);
      return NextResponse.json({ error: 'Failed to update background' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Background PUT error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
