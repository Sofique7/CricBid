import { NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/authCheck';
import { adminDb } from '@/lib/firestoreAdmin';

export const dynamic = 'force-dynamic';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const isAuth = await isAdminAuthenticated();
  if (!isAuth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const docRef = adminDb.collection('players').doc(id);

    const doc = await docRef.get();
    if (!doc.exists) {
      return NextResponse.json({ error: 'Player not found' }, { status: 404 });
    }

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
      status,
    } = body;

    const updateData: Record<string, any> = {};
    if (name !== undefined) updateData.name = name.trim();
    if (image !== undefined) updateData.image = image.trim();
    if (nationality !== undefined) {
      updateData.nationality = nationality.trim();
      updateData.overseas = nationality.trim().toLowerCase() !== 'india';
    }
    if (role !== undefined) updateData.role = role;
    if (batting_style !== undefined) updateData.batting_style = batting_style;
    if (bowling_style !== undefined) updateData.bowling_style = bowling_style;
    if (base_price !== undefined) updateData.base_price = parseFloat(base_price);
    if (rating !== undefined) updateData.rating = parseInt(rating, 10);
    if (age !== undefined) updateData.age = parseInt(age, 10);
    if (is_wicketkeeper !== undefined) updateData.is_wicketkeeper = !!is_wicketkeeper;
    if (status !== undefined) updateData.status = status;

    await docRef.update(updateData);

    const updatedDoc = await docRef.get();
    return NextResponse.json({ success: true, player: updatedDoc.data() });
  } catch (err) {
    console.error('[admin PUT player] error', err);
    return NextResponse.json({ error: 'Failed to update player' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const isAuth = await isAdminAuthenticated();
  if (!isAuth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const { id } = await params;
    const docRef = adminDb.collection('players').doc(id);

    const doc = await docRef.get();
    if (!doc.exists) {
      return NextResponse.json({ error: 'Player not found' }, { status: 404 });
    }

    await docRef.delete();
    return NextResponse.json({ success: true, message: `Player ${id} deleted successfully` });
  } catch (err) {
    console.error('[admin DELETE player] error', err);
    return NextResponse.json({ error: 'Failed to delete player' }, { status: 500 });
  }
}
