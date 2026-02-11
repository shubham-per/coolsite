import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { requireAuth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const section = searchParams.get('section');

    if (section) {
      const { data, error } = await supabase
        .from('content')
        .select('*')
        .eq('section', section)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Content GET error:', error);
        return NextResponse.json({ error: 'Failed to fetch content' }, { status: 500 });
      }

      if (!data) {
        return NextResponse.json({
          section,
          title: '',
          content: '',
          imageUrl: ''
        });
      }

      return NextResponse.json({
        id: data.id,
        section: data.section,
        title: data.title,
        content: data.content,
        imageUrl: data.image_url,
      });
    }

    const { data, error } = await supabase
      .from('content')
      .select('*');

    if (error) {
      console.error('Content GET error:', error);
      return NextResponse.json({ error: 'Failed to fetch content' }, { status: 500 });
    }

    const content = (data || []).map(c => ({
      id: c.id,
      section: c.section,
      title: c.title,
      content: c.content,
      imageUrl: c.image_url,
    }));

    return NextResponse.json(content);
  } catch (error) {
    console.error('Content GET error:', error);
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
          uploadFormData.append('folder', 'content');

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

    if (!data.section) {
      return NextResponse.json({ error: 'Section is required' }, { status: 400 });
    }

    const updateData: any = {
      section: data.section,
    };
    if (data.title !== undefined) updateData.title = data.title;
    if (data.content !== undefined) updateData.content = data.content;
    if (data.imageUrl !== undefined) updateData.image_url = data.imageUrl;

    const { data: updatedContent, error } = await supabase
      .from('content')
      .upsert(updateData, { onConflict: 'section' })
      .select()
      .single();

    if (error) {
      console.error('Content PUT error:', error);
      return NextResponse.json({ error: 'Failed to update content' }, { status: 500 });
    }

    return NextResponse.json({
      id: updatedContent.id,
      section: updatedContent.section,
      title: updatedContent.title,
      content: updatedContent.content,
      imageUrl: updatedContent.image_url,
    });
  } catch (error) {
    console.error('Content PUT error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
