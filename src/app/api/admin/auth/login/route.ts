import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

export const getSessionToken = () => {
  const secret = process.env.ADMIN_PASSWORD || 'admin123';
  return crypto.createHmac('sha256', secret).update('cricbid-admin-session').digest('hex');
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { password } = body;
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

    if (password !== adminPassword) {
      return NextResponse.json({ error: 'Incorrect password' }, { status: 401 });
    }

    const token = getSessionToken();
    const cookieStore = await cookies();
    cookieStore.set('cricbid_admin_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/',
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[admin login] error', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
