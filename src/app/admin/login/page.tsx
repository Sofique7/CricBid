'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if already logged in, redirect immediately
  useEffect(() => {
    fetch('/api/admin/auth/check')
      .then((res) => res.json())
      .then((data) => {
        if (data.isAdmin) {
          router.push('/admin');
        }
      })
      .catch((err) => console.error('Auth check error', err));
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Login failed');
      }

      router.push('/admin');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Incorrect password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col justify-center items-center py-12 px-4 select-none">
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat animate-slow-zoom pointer-events-none opacity-20"
        style={{ backgroundImage: "url('/front_bg.png')", filter: 'blur(10px)' }}
      />
      
      <div className="w-full max-w-md glass glass-elevated p-8 relative z-10 space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 mb-2 px-3 py-1 rounded-full bg-white/10 border border-white/20">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-[10px] font-bold tracking-widest uppercase text-white/80">
              CricBid Secure Portal
            </span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white" style={{ letterSpacing: '-0.025em' }}>
            Admin Login
          </h1>
          <p className="text-sm text-white/60">
            Enter the admin password to access the auction control room.
          </p>
        </div>

        {error && (
          <div 
            className="text-xs font-semibold p-3.5 rounded-xl text-center border bg-red-500/10 border-red-500/30 text-red-400"
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="section-label block text-white/50">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              className="form-input text-center tracking-widest text-lg font-mono focus:border-white/40"
              style={{ background: 'rgba(255, 255, 255, 0.08)' }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-4 text-sm font-bold flex justify-center items-center gap-2"
            style={{ borderRadius: '14px' }}
          >
            {loading ? 'Authenticating…' : 'Access Dashboard'}
          </button>
        </form>
      </div>
    </div>
  );
}
