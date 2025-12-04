import { NextResponse } from 'next/server';
import { createClient } from '@/src/lib/supabase/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { organization_id, title, description } = body;

    if (!organization_id || !title) {
      return NextResponse.json({ error: 'organization_id and title required' }, { status: 400 });
    }

    const supabase = await createClient();
    
    // Create first goal
    const result = await supabase.from('goals').insert({
      organization_id,
      title,
      description: description || '',
      status: 'active',
    }).select();

    return NextResponse.json({ ok: true, goal: result.data?.[0] });
  } catch (err) {
    console.error('Onboarding goal creation error', err);
    return NextResponse.json({ error: 'internal' }, { status: 500 });
  }
}
