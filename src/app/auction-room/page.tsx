'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AuctionRoomPage() {
  const router = useRouter();

  useEffect(() => {
    router.push('/lobby');
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6 animate-fade-in">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--accent)]"></div>
      <p className="mt-4 text-[var(--text-secondary)] font-medium">Redirecting to multiplayer lobby...</p>
    </div>
  );
}
