import { NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/authCheck';
import { adminDb } from '@/lib/firestoreAdmin';
import { initialPlayers } from '@/data/players';
import { initialTeams } from '@/data/teams';

export const dynamic = 'force-dynamic';

const chunkArray = <T>(arr: T[], size: number): T[][] => {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
};

export async function POST(request: Request) {
  const isAuth = await isAdminAuthenticated();
  if (!isAuth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const forceReset = !!body.forceReset;

    const playersSnap = await adminDb.collection('players').limit(1).get();
    const teamsSnap = await adminDb.collection('teams').limit(1).get();

    // If collections are not empty and we didn't specify forceReset, do not overwrite.
    if (!playersSnap.empty && !teamsSnap.empty && !forceReset) {
      return NextResponse.json({ 
        success: true, 
        message: 'Collections already populated. Set forceReset: true to overwrite.' 
      });
    }

    // Seed Teams
    const teamsBatch = adminDb.batch();
    initialTeams.forEach((team) => {
      const docRef = adminDb.collection('teams').doc(team.id);
      teamsBatch.set(docRef, {
        id: team.id,
        name: team.name,
        shortName: team.shortName,
        color: team.color,
        secondaryColor: team.secondaryColor,
        purse: 120.0, // Start with full purse (120 Cr)
        logoUrl: team.logoUrl,
        players: [], // Start with no players assigned
      });
    });
    await teamsBatch.commit();

    // Seed Players (Chunked commits for Firestore limit of 500)
    const playersToSeed = initialPlayers.map((p) => ({
      ...p,
      status: p.status || 'pool',
      age: 25, // default age
    }));
    
    const chunks = chunkArray(playersToSeed, 300);
    for (const chunk of chunks) {
      const batch = adminDb.batch();
      chunk.forEach((player) => {
        const docRef = adminDb.collection('players').doc(player.id);
        batch.set(docRef, player);
      });
      await batch.commit();
    }

    // Initialize Auction Control Doc
    await adminDb.collection('auction_control').doc('current').set({
      status: 'idle', // 'idle' | 'bidding' | 'paused' | 'completed'
      currentPlayerId: null,
      currentBid: 0,
      currentBidderId: null,
      logs: ['Auction initialized by Admin.'],
      lastResetAt: new Date().toISOString(),
    });

    return NextResponse.json({ 
      success: true, 
      message: `Database seeded successfully. Created ${initialTeams.length} teams and ${playersToSeed.length} players.` 
    });
  } catch (err) {
    console.error('[seed db] error', err);
    return NextResponse.json({ 
      error: err instanceof Error ? err.message : 'Seeding failed' 
    }, { status: 500 });
  }
}
