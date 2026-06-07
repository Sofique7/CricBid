import { NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/authCheck';
import { adminDb } from '@/lib/firestoreAdmin';
import * as admin from 'firebase-admin';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const isAuth = await isAdminAuthenticated();
  if (!isAuth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { action } = body; // 'start' | 'pause' | 'resume' | 'end' | 'reset'

    if (!['start', 'pause', 'resume', 'end', 'reset'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    const controlRef = adminDb.collection('auction_control').doc('current');
    const controlDoc = await controlRef.get();
    if (!controlDoc.exists) {
      // Create if it doesn't exist
      await controlRef.set({
        status: 'idle',
        currentPlayerId: null,
        currentBid: 0,
        currentBidderId: null,
        logs: ['Auction control doc initialized.'],
        lastResetAt: new Date().toISOString(),
      });
    }

    const currentData = controlDoc.data() || {};
    const timestamp = new Date().toISOString();

    if (action === 'start') {
      // Pick first player in pool to make active
      const poolSnap = await adminDb.collection('players').where('status', '==', 'pool').limit(1).get();
      let activePlayerId = null;

      if (!poolSnap.empty) {
        const playerDoc = poolSnap.docs[0];
        activePlayerId = playerDoc.id;
        await playerDoc.ref.update({ status: 'active' });
      }

      await controlRef.update({
        status: 'bidding',
        currentPlayerId: activePlayerId,
        currentBid: 0,
        currentBidderId: null,
        logs: [...(currentData.logs || []), `Auction started by Admin at ${timestamp}.`],
      });
    } else if (action === 'pause') {
      await controlRef.update({
        status: 'paused',
        logs: [...(currentData.logs || []), `Auction paused by Admin at ${timestamp}.`],
      });
    } else if (action === 'resume') {
      await controlRef.update({
        status: 'bidding',
        logs: [...(currentData.logs || []), `Auction resumed by Admin at ${timestamp}.`],
      });
    } else if (action === 'end') {
      await controlRef.update({
        status: 'completed',
        logs: [...(currentData.logs || []), `Auction ended by Admin at ${timestamp}.`],
      });
    } else if (action === 'reset') {
      // 1. Reset all players to status='pool' and clear their sold price / team info
      const playersSnap = await adminDb.collection('players').get();
      const playersChunks: any[][] = [];
      let tempChunk: any[] = [];
      
      playersSnap.docs.forEach((doc) => {
        tempChunk.push(doc.ref);
        if (tempChunk.length === 400) {
          playersChunks.push(tempChunk);
          tempChunk = [];
        }
      });
      if (tempChunk.length > 0) {
        playersChunks.push(tempChunk);
      }

      for (const chunk of playersChunks) {
        const batch = adminDb.batch();
        chunk.forEach((ref) => {
          batch.update(ref, {
            status: 'pool',
            sold_to: admin.firestore.FieldValue.delete(),
            sold_price: admin.firestore.FieldValue.delete(),
          });
        });
        await batch.commit();
      }

      // 2. Reset all team budgets/purses to 120 Cr and clear their rosters
      const teamsSnap = await adminDb.collection('teams').get();
      const teamsBatch = adminDb.batch();
      teamsSnap.docs.forEach((doc) => {
        teamsBatch.update(doc.ref, {
          purse: 120.0,
          players: [],
        });
      });
      await teamsBatch.commit();

      // 3. Reset controls doc
      await controlRef.set({
        status: 'idle',
        currentPlayerId: null,
        currentBid: 0,
        currentBidderId: null,
        logs: [`Auction fully reset by Admin at ${timestamp}.`],
        lastResetAt: timestamp,
      });
    }

    const updatedDoc = await controlRef.get();
    return NextResponse.json({ success: true, state: updatedDoc.data() });
  } catch (err) {
    console.error('[admin auction controls] error', err);
    return NextResponse.json({ error: 'Failed to execute control action' }, { status: 500 });
  }
}
