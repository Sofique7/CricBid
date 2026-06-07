import { NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/authCheck';
import { adminDb } from '@/lib/firestoreAdmin';
import * as admin from 'firebase-admin';
import { Team } from '@/data/teams';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const snap = await adminDb.collection('teams').get();
    const teams: Team[] = snap.docs.map((doc: any) => doc.data() as Team);
    
    // Sort teams by short name or full name
    teams.sort((a, b) => a.name.localeCompare(b.name));

    return NextResponse.json({ success: true, teams });
  } catch (err) {
    console.error('[admin GET teams] error', err);
    return NextResponse.json({ error: 'Failed to fetch teams' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const isAuth = await isAdminAuthenticated();
  if (!isAuth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { action } = body; // 'reset_squads' | 'reset_purses'

    if (!['reset_squads', 'reset_purses'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    const teamsSnap = await adminDb.collection('teams').get();

    if (action === 'reset_squads') {
      // 1. Release all sold players from teams
      const playersSnap = await adminDb.collection('players').where('status', '==', 'sold').get();
      const playersBatch = adminDb.batch();
      playersSnap.docs.forEach((doc) => {
        playersBatch.update(doc.ref, {
          status: 'pool',
          sold_to: admin.firestore.FieldValue.delete(),
          sold_price: admin.firestore.FieldValue.delete(),
        });
      });
      await playersBatch.commit();

      // Also set any 'active' players to 'pool'
      const activePlayersSnap = await adminDb.collection('players').where('status', '==', 'active').get();
      const activeBatch = adminDb.batch();
      activePlayersSnap.docs.forEach((doc) => {
        activeBatch.update(doc.ref, { status: 'pool' });
      });
      await activeBatch.commit();

      // 2. Clear player arrays in teams
      const teamsBatch = adminDb.batch();
      teamsSnap.docs.forEach((doc) => {
        teamsBatch.update(doc.ref, { players: [] });
      });
      await teamsBatch.commit();

    } else if (action === 'reset_purses') {
      // Reset all team purses to 120.0 Cr
      const teamsBatch = adminDb.batch();
      teamsSnap.docs.forEach((doc) => {
        teamsBatch.update(doc.ref, { purse: 120.0 });
      });
      await teamsBatch.commit();
    }

    const updatedTeamsSnap = await adminDb.collection('teams').get();
    const teams: Team[] = updatedTeamsSnap.docs.map((doc: any) => doc.data() as Team);

    return NextResponse.json({ success: true, teams });
  } catch (err) {
    console.error('[admin POST teams] error', err);
    return NextResponse.json({ error: 'Failed to reset team data' }, { status: 500 });
  }
}
