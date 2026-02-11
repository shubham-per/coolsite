import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { requireAuth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    let query = supabase
      .from('projects')
      .select('*')
      .eq('is_active', true)
      .order('order_index', { ascending: true });

    if (category) {
      query = query.eq('category', category);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Projects GET error:', error);
      return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 });
    }

    // Transform snake_case to camelCase for frontend compatibility
    const projects = (data || []).map(p => ({
      id: p.id,
      title: p.title,
      description: p.description,
      category: p.category,
      imageUrl: p.image_url,
      photos: p.photos || [],
      keywords: p.keywords || [],
      projectLink: p.project_link,
      tags: p.tags || [],
      orderIndex: p.order_index,
      isActive: p.is_active,
      customTabKey: p.custom_tab_key,
      createdAt: p.created_at,
    }));

    return NextResponse.json(projects);
  } catch (error) {
    console.error('Projects GET error:', error);
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
          uploadFormData.append('folder', 'projects');

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
      ['tags', 'keywords', 'photos'].forEach((arrKey) => {
        if (data[arrKey] && typeof data[arrKey] === 'string') {
          try { data[arrKey] = JSON.parse(data[arrKey]); } catch { data[arrKey] = [data[arrKey]]; }
        }
      });
      if (data.orderIndex) data.orderIndex = parseInt(data.orderIndex);
    } else {
      data = await request.json();
    }

    if (!data.title || !data.category) {
      return NextResponse.json({ error: 'Title and category are required' }, { status: 400 });
    }

    const { data: newProject, error } = await supabase
      .from('projects')
      .insert({
        title: data.title,
        description: data.description,
        category: data.category,
        image_url: data.imageUrl || '',
        photos: data.photos || [],
        keywords: data.keywords || [],
        project_link: data.projectLink || '',
        tags: data.tags || [],
        order_index: data.orderIndex || 0,
        is_active: true,
        custom_tab_key: data.customTabKey || null,
      })
      .select()
      .single();

    if (error) {
      console.error('Projects POST error:', error);
      return NextResponse.json({ error: `Failed to create project: ${error.message}` }, { status: 500 });
    }

    return NextResponse.json({
      id: newProject.id,
      title: newProject.title,
      description: newProject.description,
      category: newProject.category,
      imageUrl: newProject.image_url,
      photos: newProject.photos,
      keywords: newProject.keywords,
      projectLink: newProject.project_link,
      tags: newProject.tags,
      orderIndex: newProject.order_index,
      isActive: newProject.is_active,
      customTabKey: newProject.custom_tab_key,
    }, { status: 201 });
  } catch (error) {
    console.error('Projects POST error:', error);
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
          uploadFormData.append('folder', 'projects');

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
      ['tags', 'keywords', 'photos'].forEach((arrKey) => {
        if (data[arrKey] && typeof data[arrKey] === 'string') {
          try { data[arrKey] = JSON.parse(data[arrKey]); } catch { data[arrKey] = [data[arrKey]]; }
        }
      });
      if (data.orderIndex) data.orderIndex = parseInt(data.orderIndex);
      if (data.id) data.id = parseInt(data.id);
    } else {
      data = await request.json();
    }

    if (!data.id) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
    }

    const updateData: any = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.category !== undefined) updateData.category = data.category;
    if (data.imageUrl !== undefined) updateData.image_url = data.imageUrl;
    if (data.photos !== undefined) updateData.photos = data.photos;
    if (data.keywords !== undefined) updateData.keywords = data.keywords;
    if (data.projectLink !== undefined) updateData.project_link = data.projectLink;
    if (data.tags !== undefined) updateData.tags = data.tags;
    if (data.orderIndex !== undefined) updateData.order_index = data.orderIndex;
    if (data.isActive !== undefined) updateData.is_active = data.isActive;
    if (data.customTabKey !== undefined) updateData.custom_tab_key = data.customTabKey;

    const { data: updatedProject, error } = await supabase
      .from('projects')
      .update(updateData)
      .eq('id', data.id)
      .select()
      .single();

    if (error) {
      console.error('Projects PUT error:', error);
      return NextResponse.json({ error: 'Failed to update project' }, { status: 500 });
    }

    return NextResponse.json({
      id: updatedProject.id,
      title: updatedProject.title,
      description: updatedProject.description,
      category: updatedProject.category,
      imageUrl: updatedProject.image_url,
      photos: updatedProject.photos,
      keywords: updatedProject.keywords,
      projectLink: updatedProject.project_link,
      tags: updatedProject.tags,
      orderIndex: updatedProject.order_index,
      isActive: updatedProject.is_active,
      customTabKey: updatedProject.custom_tab_key,
    });
  } catch (error) {
    console.error('Projects PUT error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
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
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('projects')
      .update({ is_active: false })
      .eq('id', parseInt(id));

    if (error) {
      console.error('Projects DELETE error:', error);
      return NextResponse.json({ error: 'Failed to delete project' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Projects DELETE error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
