import { NextResponse } from 'next/server';
import { createClient } from '@/src/lib/supabase/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { organization_id, emails } = body;

    if (!organization_id || !emails || emails.length === 0) {
      return NextResponse.json({ error: 'organization_id and emails required' }, { status: 400 });
    }

    const supabase = await createClient();
    
    // Insert team member invitations (placeholder: in production, send emails)
    for (const email of emails) {
      await supabase.from('team_invitations').insert({
        organization_id,
        email,
        status: 'pending',
      }).catch(() => null);
    }

    return NextResponse.json({ ok: true, invited: emails.length });
  } catch (err) {
    console.error('Onboarding team invite error', err);
    return NextResponse.json({ error: 'internal' }, { status: 500 });
  }
}
