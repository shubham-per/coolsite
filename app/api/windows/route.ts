import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { requireAuth } from '@/lib/auth';

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('windows')
      .select('*')
      .order('order_desktop', { ascending: true });

    if (error) {
      console.error('Windows GET error:', error);
      return NextResponse.json({ error: 'Failed to fetch windows' }, { status: 500 });
    }

    const windows = (data || []).map(w => ({
      id: w.id,
      key: w.key,
      label: w.label,
      type: w.type,
      showOnDesktop: w.show_on_desktop,
      showInHome: w.show_in_home,
      orderDesktop: w.order_desktop,
      orderHome: w.order_home,
      isHidden: w.is_hidden,
      content: w.content,
      icon: w.icon,
      customIconUrl: w.custom_icon_url,
      layout: w.layout,
      isArchived: w.is_archived,
    }));

    return NextResponse.json(windows);
  } catch (error) {
    console.error('Windows GET error:', error);
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

    const data = await request.json();

    const { data: newWindow, error } = await supabase
      .from('windows')
      .insert({
        key: data.key || `custom-${Date.now()}`,
        label: data.label || 'New Window',
        type: data.type || 'custom',
        show_on_desktop: data.showOnDesktop !== false,
        show_in_home: data.showInHome !== false,
        order_desktop: data.orderDesktop || 99,
        order_home: data.orderHome || 99,
        is_hidden: data.isHidden || false,
        content: data.content || '',
        icon: data.icon || 'folder',
        layout: data.layout || 'content',
        is_archived: false,
      })
      .select()
      .single();

    if (error) {
      console.error('Windows POST error:', error);
      return NextResponse.json({ error: 'Failed to create window' }, { status: 500 });
    }

    return NextResponse.json({
      id: newWindow.id,
      key: newWindow.key,
      label: newWindow.label,
      type: newWindow.type,
      showOnDesktop: newWindow.show_on_desktop,
      showInHome: newWindow.show_in_home,
      orderDesktop: newWindow.order_desktop,
      orderHome: newWindow.order_home,
      isHidden: newWindow.is_hidden,
      content: newWindow.content,
      icon: newWindow.icon,
      customIconUrl: newWindow.custom_icon_url,
      layout: newWindow.layout,
      isArchived: newWindow.is_archived,
    }, { status: 201 });
  } catch (error) {
    console.error('Windows POST error:', error);
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
          uploadFormData.append('folder', 'window-icons');

          const uploadResponse = await fetch(`${request.nextUrl.origin}/api/upload-github`, {
            method: 'POST',
            body: uploadFormData,
          });

          if (uploadResponse.ok) {
            const uploadResult = await uploadResponse.json();
            data.customIconUrl = uploadResult.url;
          }
        }
      }
      // Parse numeric and boolean fields
      if (data.id) data.id = parseInt(data.id);
      if (data.orderDesktop) data.orderDesktop = parseInt(data.orderDesktop);
      if (data.orderHome) data.orderHome = parseInt(data.orderHome);
      ['showOnDesktop', 'showInHome', 'isHidden', 'isArchived'].forEach(key => {
        if (data[key] !== undefined) {
          data[key] = data[key] === 'true' || data[key] === true;
        }
      });
    } else {
      data = await request.json();
    }

    if (!data.id) {
      return NextResponse.json({ error: 'Window ID is required' }, { status: 400 });
    }

    const updateData: any = {};
    if (data.key !== undefined) updateData.key = data.key;
    if (data.label !== undefined) updateData.label = data.label;
    if (data.showOnDesktop !== undefined) updateData.show_on_desktop = data.showOnDesktop;
    if (data.showInHome !== undefined) updateData.show_in_home = data.showInHome;
    if (data.orderDesktop !== undefined) updateData.order_desktop = data.orderDesktop;
    if (data.orderHome !== undefined) updateData.order_home = data.orderHome;
    if (data.isHidden !== undefined) updateData.is_hidden = data.isHidden;
    if (data.content !== undefined) updateData.content = data.content;
    if (data.icon !== undefined) updateData.icon = data.icon;
    if (data.customIconUrl !== undefined) updateData.custom_icon_url = data.customIconUrl;
    if (data.layout !== undefined) updateData.layout = data.layout;
    if (data.isArchived !== undefined) updateData.is_archived = data.isArchived;

    const { data: updated, error } = await supabase
      .from('windows')
      .update(updateData)
      .eq('id', data.id)
      .select()
      .single();

    if (error) {
      console.error('Windows PUT error:', error);
      return NextResponse.json({ error: 'Failed to update window' }, { status: 500 });
    }

    return NextResponse.json({
      id: updated.id,
      key: updated.key,
      label: updated.label,
      type: updated.type,
      showOnDesktop: updated.show_on_desktop,
      showInHome: updated.show_in_home,
      orderDesktop: updated.order_desktop,
      orderHome: updated.order_home,
      isHidden: updated.is_hidden,
      content: updated.content,
      icon: updated.icon,
      customIconUrl: updated.custom_icon_url,
      layout: updated.layout,
      isArchived: updated.is_archived,
    });
  } catch (error) {
    console.error('Windows PUT error:', error);
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
      return NextResponse.json({ error: 'Window ID is required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('windows')
      .delete()
      .eq('id', parseInt(id));

    if (error) {
      console.error('Windows DELETE error:', error);
      return NextResponse.json({ error: 'Failed to delete window' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Windows DELETE error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
