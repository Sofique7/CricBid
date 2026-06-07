'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Player {
  id: string;
  name: string;
  role: string;
  batting_style: string;
  bowling_style: string;
  nationality: string;
  overseas: boolean;
  base_price: number;
  rating: number;
  age: number;
  image?: string;
  is_wicketkeeper?: boolean;
  status: 'pool' | 'active' | 'sold' | 'unsold';
}

interface Team {
  id: string;
  name: string;
  shortName: string;
  purse: number;
  color: string;
  players?: Player[];
}

interface AuctionState {
  status: 'idle' | 'bidding' | 'paused' | 'completed';
  currentPlayerId: string | null;
  currentBid: number;
  currentBidderId: string | null;
  logs: string[];
}

const ROLES = [
  { value: 'opener', label: 'Opener' },
  { value: 'middle_order', label: 'Middle Order' },
  { value: 'finisher', label: 'Finisher' },
  { value: 'spinner', label: 'Spinner' },
  { value: 'death_bowler', label: 'Death Bowler' },
  { value: 'powerplay_bowler', label: 'Powerplay Bowler' },
  { value: 'all_rounder', label: 'All Rounder' },
];

export default function AdminDashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'players' | 'pool' | 'controls' | 'teams'>('players');
  const [players, setPlayers] = useState<Player[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [auctionState, setAuctionState] = useState<AuctionState | null>(null);
  
  // Loading states
  const [loadingPlayers, setLoadingPlayers] = useState(false);
  const [loadingTeams, setLoadingTeams] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  
  // Player filters & search
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  // Add/Edit Player Modal State
  const [showPlayerModal, setShowPlayerModal] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [playerForm, setPlayerForm] = useState({
    name: '',
    image: '',
    nationality: 'India',
    role: 'opener',
    batting_style: 'Right-hand bat',
    bowling_style: 'Right-arm medium/pace',
    base_price: 2.0,
    rating: 85,
    age: 25,
    is_wicketkeeper: false,
  });

  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Check auth and fetch basic data on mount
  useEffect(() => {
    fetch('/api/admin/auth/check')
      .then((res) => res.json())
      .then((data) => {
        if (!data.isAdmin) {
          router.push('/admin/login');
        } else {
          loadPlayers();
          loadTeams();
          loadAuctionState();
        }
      })
      .catch((err) => {
        console.error(err);
        router.push('/admin/login');
      });
  }, [router]);

  // Flash notification
  const notify = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const loadPlayers = async () => {
    setLoadingPlayers(true);
    try {
      const q = `?search=${encodeURIComponent(searchQuery)}&role=${roleFilter}&status=${statusFilter}`;
      const res = await fetch(`/api/admin/players${q}`);
      const data = await res.json();
      if (res.ok) {
        setPlayers(data.players || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingPlayers(false);
    }
  };

  const loadTeams = async () => {
    setLoadingTeams(true);
    try {
      const res = await fetch('/api/admin/teams');
      const data = await res.json();
      if (res.ok) {
        setTeams(data.teams || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingTeams(false);
    }
  };

  const loadAuctionState = async () => {
    try {
      // We trigger a dry post to get state, or just fetch control doc
      const res = await fetch('/api/admin/teams'); // standard lookup
    } catch (err) {
      console.error(err);
    }
  };

  // Trigger search when query/filters change
  useEffect(() => {
    loadPlayers();
  }, [searchQuery, roleFilter, statusFilter]);

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/auth/logout', { method: 'POST' });
      router.push('/admin/login');
      router.refresh();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSeedDatabase = async (force: boolean) => {
    if (!confirm(force ? 'WARNING: This will clear all existing custom players, teams, and drafts, and overwrite the database with default data. Proceed?' : 'Are you sure you want to seed the database with initial players and teams?')) return;
    
    setActionLoading(true);
    try {
      const res = await fetch('/api/admin/seed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ forceReset: force }),
      });
      const data = await res.json();
      if (res.ok) {
        notify('success', data.message || 'Seeded successfully!');
        loadPlayers();
        loadTeams();
      } else {
        notify('error', data.error || 'Seeding failed');
      }
    } catch (err: any) {
      notify('error', err.message || 'Network error');
    } finally {
      setActionLoading(false);
    }
  };

  const handlePlayerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);

    try {
      const url = editingPlayer 
        ? `/api/admin/players/${editingPlayer.id}` 
        : '/api/admin/players';
      const method = editingPlayer ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(playerForm),
      });

      const data = await res.json();
      if (res.ok) {
        notify('success', editingPlayer ? 'Player updated successfully!' : 'Player created successfully!');
        setShowPlayerModal(false);
        setEditingPlayer(null);
        loadPlayers();
      } else {
        notify('error', data.error || 'Failed to save player');
      }
    } catch (err: any) {
      notify('error', err.message || 'Network error');
    } finally {
      setActionLoading(false);
    }
  };

  const openEditModal = (player: Player) => {
    setEditingPlayer(player);
    setPlayerForm({
      name: player.name,
      image: player.image || '',
      nationality: player.nationality,
      role: player.role,
      batting_style: player.batting_style,
      bowling_style: player.bowling_style,
      base_price: player.base_price,
      rating: player.rating,
      age: player.age || 25,
      is_wicketkeeper: !!player.is_wicketkeeper,
    });
    setShowPlayerModal(true);
  };

  const openAddModal = () => {
    setEditingPlayer(null);
    setPlayerForm({
      name: '',
      image: '',
      nationality: 'India',
      role: 'opener',
      batting_style: 'Right-hand bat',
      bowling_style: 'Right-arm medium/pace',
      base_price: 2.0,
      rating: 85,
      age: 25,
      is_wicketkeeper: false,
    });
    setShowPlayerModal(true);
  };

  const handleDeletePlayer = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to permanently delete player "${name}"?`)) return;

    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/players/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok) {
        notify('success', 'Player deleted successfully!');
        loadPlayers();
      } else {
        notify('error', data.error || 'Failed to delete player');
      }
    } catch (err: any) {
      notify('error', err.message || 'Network error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAuctionAction = async (action: string) => {
    if (action === 'reset' && !confirm('WARNING: Resetting the auction will clear all squads and purse deductions. Are you sure you want to reset the auction?')) return;
    
    setActionLoading(true);
    try {
      const res = await fetch('/api/admin/auction/controls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (res.ok) {
        notify('success', `Auction action "${action.toUpperCase()}" completed!`);
        loadPlayers();
        loadTeams();
      } else {
        notify('error', data.error || 'Action failed');
      }
    } catch (err: any) {
      notify('error', err.message || 'Network error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleTeamAction = async (action: string) => {
    if (!confirm(`Are you sure you want to trigger "${action.replace('_', ' ')}"?`)) return;

    setActionLoading(true);
    try {
      const res = await fetch('/api/admin/teams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (res.ok) {
        notify('success', `Franchises reset successfully!`);
        loadTeams();
        loadPlayers();
      } else {
        notify('error', data.error || 'Reset action failed');
      }
    } catch (err: any) {
      notify('error', err.message || 'Network error');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-8 text-white min-h-[80vh] relative select-none">
      
      {/* Top Banner / Navigation */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center pb-6 border-b border-white/10 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
            <span className="section-label">Admin Control Panel</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight" style={{ letterSpacing: '-0.03em' }}>
            CricBid Database Dashboard
          </h1>
          <p className="text-xs text-white/50 mt-1">
            Create, edit, and control the global IPL drafting system.
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <button 
            onClick={() => handleSeedDatabase(false)}
            disabled={actionLoading}
            className="btn-secondary px-4 py-2 text-xs"
            style={{ borderRadius: '10px' }}
          >
            Seed DB
          </button>
          <button 
            onClick={() => handleSeedDatabase(true)}
            disabled={actionLoading}
            className="btn-secondary px-4 py-2 text-xs text-red-400 hover:bg-red-500/10 border-red-500/20"
            style={{ borderRadius: '10px' }}
          >
            Force Wipe &amp; Seed
          </button>
          <button 
            onClick={handleLogout}
            className="btn-secondary px-4 py-2 text-xs text-white bg-white/5 hover:bg-white/10"
            style={{ borderRadius: '10px' }}
          >
            Logout
          </button>
        </div>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div 
          className={`fixed bottom-6 right-6 z-50 p-4 rounded-2xl shadow-xl flex items-center gap-3 border transition-all duration-300 ${
            notification.type === 'success' 
              ? 'bg-green-500/10 border-green-500/30 text-green-400' 
              : 'bg-red-500/10 border-red-500/30 text-red-400'
          }`}
          style={{ backdropFilter: 'blur(20px)' }}
        >
          <span className="text-sm font-bold">{notification.type === 'success' ? '✓' : '⚠'}</span>
          <p className="text-xs font-semibold">{notification.message}</p>
        </div>
      )}

      {/* Tabs Menu */}
      <div className="flex border-b border-white/10" style={{ gap: '2px' }}>
        {[
          { id: 'players', label: 'Player List & CRUD' },
          { id: 'pool', label: 'Auction Pool Management' },
          { id: 'controls', label: 'Auction State Clock' },
          { id: 'teams', label: 'Franchise Roster Resets' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className="pb-3 px-4 text-xs md:text-sm font-semibold border-b-2 transition-all duration-200 cursor-pointer"
            style={{
              borderBottomColor: activeTab === tab.id ? '#FFFFFF' : 'transparent',
              color: activeTab === tab.id ? '#FFFFFF' : 'rgba(255,255,255,0.45)',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Panels */}
      <div className="space-y-6">

        {/* TAB 1: Players CRUD */}
        {activeTab === 'players' && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              {/* Search & Filters */}
              <div className="flex flex-wrap gap-2 w-full md:w-auto">
                <input
                  type="text"
                  placeholder="Search player name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="form-input text-xs w-full md:w-64"
                  style={{ background: 'rgba(255, 255, 255, 0.08)', borderRadius: '10px' }}
                />
                
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="form-input text-xs w-36"
                  style={{ background: 'rgba(255, 255, 255, 0.08)', borderRadius: '10px' }}
                >
                  <option value="" className="bg-neutral-900 text-white">All Roles</option>
                  {ROLES.map((r) => (
                    <option key={r.value} value={r.value} className="bg-neutral-900 text-white">{r.label}</option>
                  ))}
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="form-input text-xs w-36"
                  style={{ background: 'rgba(255, 255, 255, 0.08)', borderRadius: '10px' }}
                >
                  <option value="" className="bg-neutral-900 text-white">All Statuses</option>
                  <option value="pool" className="bg-neutral-900 text-white">In Pool</option>
                  <option value="active" className="bg-neutral-900 text-white">Active Bid</option>
                  <option value="sold" className="bg-neutral-900 text-white">Sold</option>
                  <option value="unsold" className="bg-neutral-900 text-white">Unsold</option>
                </select>
              </div>

              <button
                onClick={openAddModal}
                className="btn-primary px-5 py-2.5 text-xs w-full md:w-auto font-bold flex items-center justify-center gap-1.5"
                style={{ borderRadius: '10px' }}
              >
                + Add New Player
              </button>
            </div>

            {loadingPlayers ? (
              <div className="text-center py-12 text-white/50">Fetching players database...</div>
            ) : players.length === 0 ? (
              <div className="text-center py-12 glass p-8 text-white/50">
                No players found. If you have not seeded the database, click the "Seed DB" button above.
              </div>
            ) : (
              <div className="glass overflow-x-auto" style={{ borderRadius: '16px' }}>
                <table className="w-full text-left border-collapse text-xs md:text-sm">
                  <thead>
                    <tr className="border-b border-white/10 text-white/50 text-[11px] uppercase tracking-wider">
                      <th className="p-4 font-bold">Player</th>
                      <th className="p-4 font-bold">Role</th>
                      <th className="p-4 font-bold">Nationality</th>
                      <th className="p-4 font-bold text-center">OVR</th>
                      <th className="p-4 font-bold text-right">Base Price</th>
                      <th className="p-4 font-bold text-center">Status</th>
                      <th className="p-4 font-bold text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {players.map((player) => (
                      <tr key={player.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="p-4 flex items-center gap-3">
                          <img 
                            src={player.image || '/assets/player-avatars/default.png'} 
                            alt={player.name} 
                            className="w-8 h-8 rounded-full object-cover border border-white/10" 
                            onError={(e) => { (e.target as HTMLImageElement).src = '/assets/player-avatars/default.png'; }}
                          />
                          <div>
                            <span className="font-bold block text-white">{player.name}</span>
                            <span className="text-[10px] text-white/40 block">Age: {player.age || 25}</span>
                          </div>
                        </td>
                        <td className="p-4 capitalize">
                          {ROLES.find(r => r.value === player.role)?.label || player.role}
                          {player.is_wicketkeeper && <span className="ml-1 text-[9px] px-1 bg-green-500/20 border border-green-500/30 text-green-400 font-bold rounded">WK</span>}
                        </td>
                        <td className="p-4">{player.nationality}{player.overseas ? ' ✈' : ''}</td>
                        <td className="p-4 text-center font-mono font-bold text-white">{player.rating}</td>
                        <td className="p-4 text-right font-bold text-white">₹{player.base_price?.toFixed(2)} Cr</td>
                        <td className="p-4 text-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            player.status === 'sold' ? 'bg-green-500/20 border border-green-500/30 text-green-400' :
                            player.status === 'unsold' ? 'bg-red-500/20 border border-red-500/30 text-red-400' :
                            player.status === 'active' ? 'bg-amber-500/20 border border-amber-500/30 text-amber-400' :
                            'bg-white/10 border border-white/15 text-white/70'
                          }`}>
                            {player.status || 'pool'}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          <div className="flex justify-center gap-2">
                            <button 
                              onClick={() => openEditModal(player)}
                              className="px-2 py-1 bg-white/5 border border-white/10 hover:bg-white/10 text-white text-[11px] rounded"
                            >
                              Edit
                            </button>
                            <button 
                              onClick={() => handleDeletePlayer(player.id, player.name)}
                              className="px-2 py-1 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-red-400 text-[11px] rounded"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: Pool Management */}
        {activeTab === 'pool' && (
          <div className="space-y-6">
            <div className="glass p-6 rounded-2xl space-y-3">
              <h2 className="text-lg font-bold">Draft Pool &amp; Selection Rules</h2>
              <p className="text-xs text-white/60 leading-relaxed">
                Ordinary players enter the draft with state set to <code>pool</code>. Players who were skipped during active bidding go to <code>unsold</code>. Admin can toggle their status back and forth to re-add them to active rotation.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => handleAuctionAction('reset')}
                  className="btn-secondary px-4 py-2 text-xs text-red-400 hover:bg-red-500/10 border-red-500/20"
                >
                  Reset All Players To Pool
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Pool stats */}
              <div className="glass p-6 rounded-2xl space-y-4">
                <h3 className="section-label">Pool Metrics</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 border border-white/10 p-4 rounded-xl text-center">
                    <span className="text-2xl font-black block">{players.filter(p => p.status === 'pool').length}</span>
                    <span className="text-[10px] text-white/50 uppercase tracking-wider font-semibold">Available in Pool</span>
                  </div>
                  <div className="bg-white/5 border border-white/10 p-4 rounded-xl text-center">
                    <span className="text-2xl font-black block">{players.filter(p => p.status === 'sold').length}</span>
                    <span className="text-[10px] text-white/50 uppercase tracking-wider font-semibold">Sold (Signed)</span>
                  </div>
                  <div className="bg-white/5 border border-white/10 p-4 rounded-xl text-center">
                    <span className="text-2xl font-black block">{players.filter(p => p.status === 'unsold').length}</span>
                    <span className="text-[10px] text-white/50 uppercase tracking-wider font-semibold">Passed (Unsold)</span>
                  </div>
                  <div className="bg-white/5 border border-white/10 p-4 rounded-xl text-center">
                    <span className="text-2xl font-black block">{players.filter(p => p.status === 'active').length}</span>
                    <span className="text-[10px] text-white/50 uppercase tracking-wider font-semibold">Active Bidding</span>
                  </div>
                </div>
              </div>

              {/* Quick pool switcher */}
              <div className="glass p-6 rounded-2xl space-y-3">
                <h3 className="section-label">Quick Search Pool</h3>
                <input
                  type="text"
                  placeholder="Filter name to toggle..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="form-input text-xs"
                  style={{ background: 'rgba(255, 255, 255, 0.08)', borderRadius: '10px' }}
                />
                
                <div className="max-h-60 overflow-y-auto space-y-2 pr-2">
                  {players.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 15).map(player => (
                    <div key={player.id} className="flex justify-between items-center bg-white/5 p-2.5 rounded-xl border border-white/5 text-xs">
                      <span>{player.name} ({player.role})</span>
                      <button
                        onClick={async () => {
                          const nextStatus = player.status === 'pool' ? 'unsold' : 'pool';
                          setActionLoading(true);
                          try {
                            const res = await fetch(`/api/admin/players/${player.id}`, {
                              method: 'PUT',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ status: nextStatus }),
                            });
                            if (res.ok) {
                              loadPlayers();
                            }
                          } catch (e) {
                            console.error(e);
                          } finally {
                            setActionLoading(false);
                          }
                        }}
                        className={`px-3 py-1 text-[10px] rounded font-bold uppercase transition-colors ${
                          player.status === 'pool' 
                            ? 'bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/20' 
                            : 'bg-white/5 text-white/50 border border-white/10 hover:bg-white/10'
                        }`}
                      >
                        {player.status === 'pool' ? 'In Pool' : 'Excluded'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: Auction Clock & Controls */}
        {activeTab === 'controls' && (
          <div className="space-y-6">
            <div className="glass p-8 rounded-2xl space-y-6 max-w-2xl mx-auto text-center relative overflow-hidden">
              <div 
                className="absolute inset-0 bg-cover bg-center bg-no-repeat pointer-events-none opacity-5"
                style={{ backgroundImage: "url('/front_bg.png')" }}
              />

              <div className="space-y-1 relative z-10">
                <span className="badge-pill mb-2">Live Status Console</span>
                <h2 className="text-3xl font-black">Auction Control Deck</h2>
                <p className="text-xs text-white/60">
                  Update global controls and states synchronizing all client screens.
                </p>
              </div>

              {/* Master Control buttons */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 relative z-10">
                <button
                  onClick={() => handleAuctionAction('start')}
                  disabled={actionLoading}
                  className="btn-primary py-3.5 text-xs font-bold text-neutral-900"
                  style={{ background: '#30D158', borderRadius: '12px' }}
                >
                  Start / Next Player
                </button>
                <button
                  onClick={() => handleAuctionAction('pause')}
                  disabled={actionLoading}
                  className="btn-secondary py-3.5 text-xs font-bold border-white/20"
                  style={{ background: 'rgba(255,159,10,0.15)', color: '#FF9F0A', borderRadius: '12px' }}
                >
                  Pause Timer
                </button>
                <button
                  onClick={() => handleAuctionAction('resume')}
                  disabled={actionLoading}
                  className="btn-secondary py-3.5 text-xs font-bold border-white/20"
                  style={{ background: 'rgba(48,209,88,0.15)', color: '#30D158', borderRadius: '12px' }}
                >
                  Resume Timer
                </button>
                <button
                  onClick={() => handleAuctionAction('end')}
                  disabled={actionLoading}
                  className="btn-secondary py-3.5 text-xs font-bold border-red-500/20"
                  style={{ background: 'rgba(255,69,58,0.15)', color: '#FF453A', borderRadius: '12px' }}
                >
                  End Auction
                </button>
              </div>

              <div className="border-t border-white/10 pt-4 relative z-10">
                <button
                  onClick={() => handleAuctionAction('reset')}
                  disabled={actionLoading}
                  className="px-6 py-3 bg-red-500/20 hover:bg-red-500/35 border border-red-500/30 text-red-400 text-xs font-black rounded-xl"
                  style={{ transition: 'all 0.2s' }}
                >
                  RESET SYSTEM BACK TO INITIAL
                </button>
                <p className="text-[10px] text-white/40 mt-2">
                  Caution: Resetting wipes all squads and draft assignments, returning teams to ₹120.00 Cr purse.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: Team/Franchise Resets */}
        {activeTab === 'teams' && (
          <div className="space-y-6">
            <div className="glass p-6 rounded-2xl space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-bold">Franchise &amp; Roster Management</h2>
                  <p className="text-xs text-white/60">
                    Monitor purse caps and trigger resets for squads and budgets.
                  </p>
                </div>
                <div className="flex gap-2.5">
                  <button
                    onClick={() => handleTeamAction('reset_squads')}
                    disabled={actionLoading}
                    className="btn-secondary px-4 py-2 text-xs text-amber-400 border-amber-500/20 hover:bg-amber-500/10"
                    style={{ borderRadius: '10px' }}
                  >
                    Release All Roster Players
                  </button>
                  <button
                    onClick={() => handleTeamAction('reset_purses')}
                    disabled={actionLoading}
                    className="btn-secondary px-4 py-2 text-xs text-green-400 border-green-500/20 hover:bg-green-500/10"
                    style={{ borderRadius: '10px' }}
                  >
                    Reset All Purses to ₹120 Cr
                  </button>
                </div>
              </div>

              {loadingTeams ? (
                <div className="text-center py-6 text-white/50">Loading teams...</div>
              ) : teams.length === 0 ? (
                <div className="text-center py-6 text-white/50">No franchise data seeded. Seed database using the buttons above.</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {teams.map((team) => (
                    <div 
                      key={team.id} 
                      className="glass p-4 flex justify-between items-center border"
                      style={{ borderColor: `${team.color}30`, borderRadius: '16px' }}
                    >
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-black uppercase text-neutral-900"
                          style={{ background: team.color || '#fff' }}
                        >
                          {team.shortName}
                        </div>
                        <div>
                          <h3 className="font-bold text-sm text-white">{team.name}</h3>
                          <span className="text-[10px] text-white/50 uppercase tracking-wider font-semibold">Franchise</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="block text-xs font-bold text-white">₹{team.purse?.toFixed(2)} Cr</span>
                        <span className="text-[10px] text-white/40 block">Purse Purse Balance</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ADD / EDIT PLAYER DIALOG MODAL */}
      {showPlayerModal && (
        <div 
          className="fixed inset-0 flex items-center justify-center z-50 p-4"
          style={{ background: 'rgba(18,18,20,0.60)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' }}
        >
          <div 
            className="glass glass-elevated max-w-lg w-full overflow-hidden relative shadow-2xl space-y-6"
            style={{ borderRadius: '24px', background: 'rgba(30,30,35,0.85)', padding: '1.5rem', border: '1px solid var(--glass-border-md)' }}
          >
            <div className="flex justify-between items-center pb-2 border-b border-white/10">
              <h3 className="text-lg font-black text-white">
                {editingPlayer ? `Edit Player: ${editingPlayer.name}` : 'Add New Player'}
              </h3>
              <button 
                onClick={() => { setShowPlayerModal(false); setEditingPlayer(null); }}
                className="text-white/60 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handlePlayerSubmit} className="space-y-4 text-xs md:text-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Name */}
                <div className="space-y-1">
                  <label className="section-label block text-white/50">Full Name</label>
                  <input
                    type="text"
                    value={playerForm.name}
                    onChange={(e) => setPlayerForm({ ...playerForm, name: e.target.value })}
                    required
                    className="form-input"
                  />
                </div>

                {/* Nationality */}
                <div className="space-y-1">
                  <label className="section-label block text-white/50">Nationality / Country</label>
                  <input
                    type="text"
                    value={playerForm.nationality}
                    onChange={(e) => setPlayerForm({ ...playerForm, nationality: e.target.value })}
                    required
                    className="form-input"
                  />
                </div>

                {/* Role */}
                <div className="space-y-1">
                  <label className="section-label block text-white/50">Player Role</label>
                  <select
                    value={playerForm.role}
                    onChange={(e) => setPlayerForm({ ...playerForm, role: e.target.value })}
                    className="form-input"
                  >
                    {ROLES.map((r) => (
                      <option key={r.value} value={r.value} className="bg-neutral-900">{r.label}</option>
                    ))}
                  </select>
                </div>

                {/* Rating */}
                <div className="space-y-1">
                  <label className="section-label block text-white/50">Overall Rating (50 - 99)</label>
                  <input
                    type="number"
                    min="50"
                    max="99"
                    value={playerForm.rating}
                    onChange={(e) => setPlayerForm({ ...playerForm, rating: parseInt(e.target.value, 10) })}
                    required
                    className="form-input"
                  />
                </div>

                {/* Base Price */}
                <div className="space-y-1">
                  <label className="section-label block text-white/50">Base Price (in ₹ Cr)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.2"
                    value={playerForm.base_price}
                    onChange={(e) => setPlayerForm({ ...playerForm, base_price: parseFloat(e.target.value) })}
                    required
                    className="form-input"
                  />
                </div>

                {/* Age */}
                <div className="space-y-1">
                  <label className="section-label block text-white/50">Age</label>
                  <input
                    type="number"
                    min="15"
                    max="50"
                    value={playerForm.age}
                    onChange={(e) => setPlayerForm({ ...playerForm, age: parseInt(e.target.value, 10) })}
                    required
                    className="form-input"
                  />
                </div>

                {/* Batting Style */}
                <div className="space-y-1">
                  <label className="section-label block text-white/50">Batting Style</label>
                  <input
                    type="text"
                    value={playerForm.batting_style}
                    onChange={(e) => setPlayerForm({ ...playerForm, batting_style: e.target.value })}
                    className="form-input"
                  />
                </div>

                {/* Bowling Style */}
                <div className="space-y-1">
                  <label className="section-label block text-white/50">Bowling Style</label>
                  <input
                    type="text"
                    value={playerForm.bowling_style}
                    onChange={(e) => setPlayerForm({ ...playerForm, bowling_style: e.target.value })}
                    className="form-input"
                  />
                </div>

                {/* Image URL */}
                <div className="space-y-1 md:col-span-2">
                  <label className="section-label block text-white/50">Avatar Image URL (or path)</label>
                  <input
                    type="text"
                    placeholder="e.g. /assets/player-avatars/default.png"
                    value={playerForm.image}
                    onChange={(e) => setPlayerForm({ ...playerForm, image: e.target.value })}
                    className="form-input"
                  />
                </div>
              </div>

              {/* Wicketkeeper Checkbox */}
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="wk-checkbox"
                  checked={playerForm.is_wicketkeeper}
                  onChange={(e) => setPlayerForm({ ...playerForm, is_wicketkeeper: e.target.checked })}
                  className="rounded border-white/20 bg-white/10 text-neutral-900 w-4 h-4 cursor-pointer"
                />
                <label htmlFor="wk-checkbox" className="select-none text-xs font-semibold text-white/80 cursor-pointer">
                  This player is a Wicketkeeper (WK)
                </label>
              </div>

              <div className="flex justify-end gap-3.5 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => { setShowPlayerModal(false); setEditingPlayer(null); }}
                  className="btn-secondary px-5 py-2.5 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="btn-primary px-5 py-2.5 text-xs text-neutral-900 font-bold"
                  style={{ background: '#FFFFFF' }}
                >
                  {actionLoading ? 'Saving…' : editingPlayer ? 'Update Player' : 'Create Player'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
