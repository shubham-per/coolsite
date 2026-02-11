import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { requireAuth } from '@/lib/auth';

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('faq')
      .select('*')
      .eq('is_active', true)
      .order('order', { ascending: true });

    if (error) {
      console.error('FAQ GET error:', error);
      return NextResponse.json({ error: 'Failed to fetch FAQ' }, { status: 500 });
    }

    const faqItems = (data || []).map(f => ({
      id: f.id,
      question: f.question,
      answer: f.answer,
      order: f.order,
      isActive: f.is_active,
      customTabKey: f.custom_tab_key,
    }));

    return NextResponse.json(faqItems);
  } catch (error) {
    console.error('FAQ GET error:', error);
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

    if (!data.question || !data.answer) {
      return NextResponse.json({ error: 'Question and answer are required' }, { status: 400 });
    }

    // Check if updating existing or creating new
    if (data.id) {
      const { data: updated, error } = await supabase
        .from('faq')
        .update({
          question: data.question,
          answer: data.answer,
          order: data.order || 0,
          is_active: data.isActive !== false,
          custom_tab_key: data.customTabKey || null,
        })
        .eq('id', data.id)
        .select()
        .single();

      if (error) {
        console.error('FAQ PUT error:', error);
        return NextResponse.json({ error: 'Failed to update FAQ' }, { status: 500 });
      }

      return NextResponse.json({
        id: updated.id,
        question: updated.question,
        answer: updated.answer,
        order: updated.order,
        isActive: updated.is_active,
        customTabKey: updated.custom_tab_key,
      });
    } else {
      const { data: newFaq, error } = await supabase
        .from('faq')
        .insert({
          question: data.question,
          answer: data.answer,
          order: data.order || 0,
          is_active: true,
          custom_tab_key: data.customTabKey || null,
        })
        .select()
        .single();

      if (error) {
        console.error('FAQ POST error:', error);
        return NextResponse.json({ error: 'Failed to create FAQ' }, { status: 500 });
      }

      return NextResponse.json({
        id: newFaq.id,
        question: newFaq.question,
        answer: newFaq.answer,
        order: newFaq.order,
        isActive: newFaq.is_active,
        customTabKey: newFaq.custom_tab_key,
      }, { status: 201 });
    }
  } catch (error) {
    console.error('FAQ POST error:', error);
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
      return NextResponse.json({ error: 'FAQ ID is required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('faq')
      .update({ is_active: false })
      .eq('id', parseInt(id));

    if (error) {
      console.error('FAQ DELETE error:', error);
      return NextResponse.json({ error: 'Failed to delete FAQ' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('FAQ DELETE error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
