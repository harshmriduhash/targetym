import { NextResponse } from 'next/server';
import { createClient } from '@/src/lib/supabase/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { organization_id, company_name, company_size } = body;

    if (!organization_id) return NextResponse.json({ error: 'organization_id required' }, { status: 400 });

    const supabase = await createClient();
    await supabase.from('organizations').update({
      name: company_name,
      metadata: { company_size },
    }).eq('id', organization_id);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Onboarding company step error', err);
    return NextResponse.json({ error: 'internal' }, { status: 500 });
  }
}
