import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete('cricbid_admin_session');
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[admin logout] error', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
