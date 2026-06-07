import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getSessionToken } from '../login/route';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('cricbid_admin_session');
    
    if (!sessionCookie) {
      return NextResponse.json({ isAdmin: false });
    }

    const expectedToken = getSessionToken();
    if (sessionCookie.value !== expectedToken) {
      return NextResponse.json({ isAdmin: false });
    }

    return NextResponse.json({ isAdmin: true });
  } catch (err) {
    console.error('[admin check] error', err);
    return NextResponse.json({ isAdmin: false });
  }
}
