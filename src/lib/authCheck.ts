import { cookies } from 'next/headers';
import crypto from 'crypto';

export async function isAdminAuthenticated(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('cricbid_admin_session');
    
    if (!sessionCookie) {
      return false;
    }

    const secret = process.env.ADMIN_PASSWORD || 'admin123';
    const expectedToken = crypto
      .createHmac('sha256', secret)
      .update('cricbid-admin-session')
      .digest('hex');

    return sessionCookie.value === expectedToken;
  } catch (err) {
    console.error('[isAdminAuthenticated] error', err);
    return false;
  }
}
