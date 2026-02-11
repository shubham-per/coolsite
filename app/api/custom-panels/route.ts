import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { requireAuth } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const key = searchParams.get('key')

    let query = supabase
      .from('windows')
      .select('*')
      .eq('type', 'custom')

    if (key) {
      query = query.eq('key', key)
    }

    const { data, error } = await query

    if (error) {
      console.error('Custom Panels GET error:', error)
      return NextResponse.json({ error: 'Failed to fetch custom panels' }, { status: 500 })
    }

    if (key) {
      if (!data || data.length === 0) {
        return NextResponse.json({ error: 'Custom panel not found' }, { status: 404 })
      }
      const w = data[0]
      return NextResponse.json({
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
      })
    }

    const panels = (data || []).map(w => ({
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
    }))

    return NextResponse.json(panels)
  } catch (error) {
    console.error('Custom Panels GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    try {
      requireAuth(request)
    } catch {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const contentType = request.headers.get('content-type') || ''
    let body: any = {}

    if (contentType.startsWith('multipart/form-data')) {
      const formData = await request.formData()
      for (const [key, value] of formData.entries()) {
        if (value instanceof File && key === 'icon') {
          // Upload to GitHub
          const uploadFormData = new FormData()
          uploadFormData.append('file', value)
          uploadFormData.append('folder', 'panel-icons')

          const uploadResponse = await fetch(`${request.nextUrl.origin}/api/upload-github`, {
            method: 'POST',
            body: uploadFormData,
          })

          if (uploadResponse.ok) {
            const uploadResult = await uploadResponse.json()
            body.customIconUrl = uploadResult.url
          }
        } else if (typeof value === 'string') {
          body[key] = value
        }
      }
    } else {
      body = await request.json()
    }

    const key = String(body.key)
    if (!key) {
      return NextResponse.json({ error: 'Key is required' }, { status: 400 })
    }

    // Find the window by key
    const { data: existing, error: findError } = await supabase
      .from('windows')
      .select('*')
      .eq('key', key)
      .eq('type', 'custom')
      .single()

    if (findError || !existing) {
      return NextResponse.json({ error: 'Custom panel not found' }, { status: 404 })
    }

    const updateData: any = {}
    if (body.label !== undefined) updateData.label = body.label
    if (body.content !== undefined) updateData.content = body.content
    if (body.layout !== undefined) updateData.layout = body.layout
    if (body.icon !== undefined) updateData.icon = body.icon
    if (body.customIconUrl !== undefined) updateData.custom_icon_url = body.customIconUrl

    const { data: updated, error } = await supabase
      .from('windows')
      .update(updateData)
      .eq('id', existing.id)
      .select()
      .single()

    if (error) {
      console.error('Custom Panels PUT error:', error)
      return NextResponse.json({ error: 'Failed to update custom panel' }, { status: 500 })
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
    })
  } catch (error) {
    console.error('Custom Panels PUT error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
