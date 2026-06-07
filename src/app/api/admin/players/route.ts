import { NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/authCheck';
import { adminDb } from '@/lib/firestoreAdmin';
import { Player } from '@/data/players';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const role = searchParams.get('role') || '';
    const status = searchParams.get('status') || '';

    let colRef: any = adminDb.collection('players');

    // Fetch players
    const snap = await colRef.get();
    let players: Player[] = snap.docs.map((doc: any) => doc.data() as Player);

    // Apply filtering
    if (role) {
      players = players.filter((p) => p.role === role);
    }
    if (status) {
      players = players.filter((p) => p.status === status);
    }
    if (search) {
      const lowerSearch = search.toLowerCase();
      players = players.filter((p) => p.name.toLowerCase().includes(lowerSearch));
    }

    // Sort: Rating High to Low, then Name
    players.sort((a, b) => {
      const ratingDiff = (b.rating || 0) - (a.rating || 0);
      if (ratingDiff !== 0) return ratingDiff;
      return a.name.localeCompare(b.name);
    });

    return NextResponse.json({ success: true, players });
  } catch (err) {
    console.error('[admin GET players] error', err);
    return NextResponse.json({ error: 'Failed to fetch players' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const isAuth = await isAdminAuthenticated();
  if (!isAuth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const {
      name,
      image,
      nationality,
      role,
      batting_style,
      bowling_style,
      base_price,
      rating,
      age,
      is_wicketkeeper,
    } = body;

    // Validate required fields
    if (!name || !role || !nationality || base_price === undefined || rating === undefined) {
      return NextResponse.json({ error: 'Missing required player fields' }, { status: 400 });
    }

    // Generate unique player ID
    const newId = `player_custom_${Date.now()}`;
    const playerDoc = {
      id: newId,
      name: name.trim(),
      image: image ? image.trim() : '/assets/player-avatars/default.png',
      nationality: nationality.trim(),
      overseas: nationality.trim().toLowerCase() !== 'india',
      role,
      batting_style: batting_style || 'Right-hand bat',
      bowling_style: bowling_style || 'Right-arm medium/pace',
      base_price: parseFloat(base_price),
      rating: parseInt(rating, 10),
      age: age ? parseInt(age, 10) : 25,
      is_wicketkeeper: !!is_wicketkeeper,
      status: 'pool', // starts in pool
    };

    await adminDb.collection('players').doc(newId).set(playerDoc);

    return NextResponse.json({ success: true, player: playerDoc });
  } catch (err) {
    console.error('[admin POST player] error', err);
    return NextResponse.json({ error: 'Failed to create player' }, { status: 500 });
  }
}
