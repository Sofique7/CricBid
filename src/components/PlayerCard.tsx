'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Player, initialPlayers } from '../data/players';

const playerImageMap: Record<string, string> = {};
initialPlayers.forEach(p => {
  if (p.image) {
    playerImageMap[p.id] = p.image;
    playerImageMap[p.name.toLowerCase().trim()] = p.image;
  }
});

const getFlagUrl = (nationality: string): string => {
  const norm = nationality.trim().toLowerCase();
  if (norm === 'west indies') {
    return 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/West_Indies_Cricket_Flag_SVG.svg/40px-West_Indies_Cricket_Flag_SVG.svg.png';
  }
  const mapping: Record<string, string> = {
    india: 'in', australia: 'au', 'south africa': 'za', england: 'gb-eng',
    'new zealand': 'nz', 'sri lanka': 'lk', srilanka: 'lk', afghanistan: 'af',
    bangladesh: 'bd', ireland: 'ie', zimbabwe: 'zw', usa: 'us',
    nepal: 'np', netherlands: 'nl', scotland: 'gb-sct',
  };
  const code = mapping[norm];
  return code ? `https://flagcdn.com/w40/${code}.png` : '';
};

interface RoleStyle { label: string; badgeClass: string; avatarColor: string; }

const roleStyles: Record<string, RoleStyle> = {
  opener:           { label: 'Opener',          badgeClass: 'badge-role-opener',          avatarColor: '#B91C1C' },
  middle_order:     { label: 'Middle Order',     badgeClass: 'badge-role-middle_order',    avatarColor: '#B45309' },
  finisher:         { label: 'Finisher',         badgeClass: 'badge-role-finisher',        avatarColor: '#6D28D9' },
  spinner:          { label: 'Spinner',          badgeClass: 'badge-role-spinner',         avatarColor: '#065F46' },
  death_bowler:     { label: 'Death Bowler',     badgeClass: 'badge-role-death_bowler',    avatarColor: '#1D4ED8' },
  powerplay_bowler: { label: 'Powerplay Bowler', badgeClass: 'badge-role-powerplay_bowler',avatarColor: '#0E7490' },
  all_rounder:      { label: 'All Rounder',      badgeClass: 'badge-role-all_rounder',     avatarColor: '#C2410C' },
};

interface PlayerCardProps {
  player: Player;
  showBidOverlay?: boolean;
  bidAmount?: number;
  bidderName?: string;
  bidderColor?: string;
}

export const PlayerCard: React.FC<PlayerCardProps> = ({
  player,
  showBidOverlay = false,
  bidAmount,
  bidderName,
  bidderColor,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [imageError, setImageError] = useState(false);

  useEffect(() => { setImageError(false); }, [player.id, player.image]);

  const style = roleStyles[player.role] || {
    label: player.role,
    badgeClass: '',
    avatarColor: '#666666',
  };

  const resolvedImage =
    player.image ||
    playerImageMap[player.id] ||
    playerImageMap[player.name.toLowerCase().trim()] ||
    '';

  /* ── Avatar SVG fallback (role silhouette) ── */
  const avatar = useMemo(() => {
    if (resolvedImage && !imageError) {
      return (
        <img
          src={resolvedImage}
          alt={player.name}
          className="w-[82%] h-[82%] object-contain z-10 relative pointer-events-none"
          onError={() => setImageError(true)}
        />
      );
    }

    const c = style.avatarColor;
    let pathMarkup = null;

    if (['opener', 'middle_order', 'finisher'].includes(player.role)) {
      pathMarkup = (
        <path
          d="M25,65 L35,50 L40,30 L45,20 L50,12 M45,20 L55,22 L65,30 L60,40 M40,30 L30,35 L20,40 M60,40 L68,60 L78,65 M68,60 L62,56 M20,40 L8,24"
          stroke={c} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none"
        />
      );
    } else if (player.role === 'all_rounder') {
      pathMarkup = (
        <>
          <circle cx="28" cy="22" r="5" fill={c} opacity="0.6" />
          <path
            d="M38,65 L43,45 L45,25 L50,15 M45,25 L55,26 L62,35 L58,45 M30,32 L20,38 L12,25 M58,45 L64,62 L74,66 M20,38 L30,42"
            stroke={c} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none"
          />
        </>
      );
    } else {
      pathMarkup = (
        <path
          d="M32,65 L36,52 L40,35 L42,22 L45,15 M40,35 L55,25 L65,12 L50,8 M36,52 L25,48 L15,35 M55,25 L62,45 L70,62 L78,65"
          stroke={c} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none"
        />
      );
    }

    return (
      <svg viewBox="0 0 100 80" className="w-full h-full opacity-70">
        <ellipse cx="50" cy="72" rx="30" ry="5" fill="#E7DFD1" />
        <circle cx="45" cy="12" r="4" fill={c} opacity="0.7" />
        {pathMarkup}
      </svg>
    );
  }, [player.id, player.role, resolvedImage, imageError, style.avatarColor]);

  /* ── Stat row helper ── */
  const StatRow = ({ label, value, accent }: { label: string; value: string | number; accent?: string }) => (
    <div className="stat-chip">
      <span className="stat-chip__label">{label}</span>
      <span className="stat-chip__value" style={accent ? { color: accent } : undefined}>{value}</span>
    </div>
  );

  return (
    <>
      {/* ── Card ── */}
      <div
        onClick={() => setIsModalOpen(true)}
        className="surface-card surface-card-hover relative overflow-hidden cursor-pointer group"
      >
        {/* Avatar plate */}
        <div
          className="h-44 flex items-center justify-center p-4 relative overflow-hidden"
          style={{ background: '#F5EFE4' }}
        >
          {avatar}

          {/* OVR badge */}
          <div
            className="absolute top-3 left-3 flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold"
            style={{ background: '#1E1E1E', color: '#fff' }}
          >
            <span className="text-[9px] font-medium opacity-70">OVR</span>
            <span>{player.rating}</span>
          </div>

          {/* Nationality badge */}
          <div
            className="absolute top-3 right-3 flex items-center gap-1.5 px-2 py-1 rounded-full text-[9px] font-medium border"
            style={{ background: '#FFFDF8', borderColor: '#E7DFD1', color: '#666666' }}
          >
            <span>{player.nationality}</span>
            {player.overseas && (
              <span className="font-bold" style={{ color: '#1D4ED8' }}>✈</span>
            )}
          </div>
        </div>

        {/* Info section */}
        <div
          className="p-4 border-t"
          style={{ borderColor: '#E7DFD1' }}
        >
          {/* Role + WK badges */}
          <div className="flex flex-wrap items-center gap-1.5 mb-2">
            <span className={`badge-pill ${style.badgeClass}`}>{style.label}</span>
            {player.is_wicketkeeper && (
              <span className="badge-pill badge-role-wk">WK</span>
            )}
          </div>

          {/* Name */}
          <div className="flex items-center gap-2 min-w-0 mb-1">
            {getFlagUrl(player.nationality) && (
              <img
                src={getFlagUrl(player.nationality)}
                alt={player.nationality}
                className="w-4 h-4 rounded-full object-cover flex-shrink-0 border"
                style={{ borderColor: '#E7DFD1' }}
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
            )}
            <h3
              className="text-sm font-bold truncate transition-colors duration-150"
              style={{ color: '#1E1E1E' }}
            >
              {player.name}
            </h3>
          </div>

          {/* Styles */}
          <div
            className="flex justify-between text-[10px] mb-3"
            style={{ color: '#999999' }}
          >
            <span className="truncate">{player.batting_style}</span>
            <span className="truncate max-w-[50%] text-right">{player.bowling_style}</span>
          </div>

          {/* Price row */}
          <div
            className="flex items-center justify-between pt-3 border-t"
            style={{ borderColor: '#E7DFD1' }}
          >
            <div>
              <span className="block text-[9px] font-medium uppercase tracking-wide" style={{ color: '#BBBBBB' }}>Base Price</span>
              <span className="text-sm font-bold" style={{ color: '#1E1E1E' }}>
                ₹{player.base_price.toFixed(2)} Cr
              </span>
            </div>
            {player.status === 'sold' ? (
              <div className="text-right">
                <span className="block text-[9px] font-bold uppercase" style={{ color: '#3BA55D' }}>Sold</span>
                <span className="text-sm font-black" style={{ color: '#1E1E1E' }}>
                  ₹{player.sold_price?.toFixed(2)} Cr
                </span>
              </div>
            ) : player.status === 'unsold' ? (
              <span
                className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border"
                style={{ background: '#F5EFE4', borderColor: '#E7DFD1', color: '#999999' }}
              >
                Unsold
              </span>
            ) : (
              <span
                className="text-xs font-medium group-hover:underline flex items-center gap-0.5"
                style={{ color: '#666666' }}
              >
                Stats →
              </span>
            )}
          </div>
        </div>

        {/* Live bid overlay */}
        {showBidOverlay && bidAmount !== undefined && bidAmount > 0 && (
          <div
            className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center z-20"
            style={{ background: 'rgba(255, 253, 248, 0.95)' }}
          >
            <span className="section-label mb-1">Current High Bid</span>
            <div className="text-3xl font-black mb-2" style={{ color: '#1E1E1E' }}>
              ₹{bidAmount.toFixed(2)} Cr
            </div>
            <div
              className="text-xs font-bold px-3 py-1 rounded-full border"
              style={{
                background: bidderColor ? `${bidderColor}12` : '#F5EFE4',
                borderColor: bidderColor ? `${bidderColor}40` : '#E7DFD1',
                color: bidderColor || '#666666',
              }}
            >
              Held by {bidderName || 'None'}
            </div>
          </div>
        )}
      </div>

      {/* ── Stats Modal ── */}
      {isModalOpen && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50 p-4"
          style={{ background: 'rgba(30, 30, 30, 0.4)', backdropFilter: 'blur(4px)' }}
          onClick={() => setIsModalOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="surface-card max-w-lg w-full overflow-hidden relative"
            style={{ borderRadius: '1.5rem' }}
          >
            {/* Team color accent top bar */}
            <div className="h-1" style={{ background: '#2B2B2B' }} />

            {/* Close */}
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full border transition-colors"
              style={{ borderColor: '#E7DFD1', background: '#F5EFE4', color: '#666666' }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="p-6 md:p-8">
              {/* Header */}
              <div className="flex items-start gap-4 mb-6">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 overflow-hidden"
                  style={{ background: '#F5EFE4', border: '1px solid #E7DFD1' }}
                >
                  {avatar}
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                    <span className={`badge-pill ${style.badgeClass}`}>{style.label}</span>
                    <span
                      className="badge-pill"
                      style={{ background: '#1E1E1E', color: '#fff', borderColor: '#1E1E1E' }}
                    >
                      OVR {player.rating}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 min-w-0">
                    {getFlagUrl(player.nationality) && (
                      <img
                        src={getFlagUrl(player.nationality)}
                        alt={player.nationality}
                        className="w-5 h-5 rounded-full object-cover flex-shrink-0 border"
                        style={{ borderColor: '#E7DFD1' }}
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                      />
                    )}
                    <h2 className="text-xl font-black truncate" style={{ color: '#1E1E1E' }}>
                      {player.name}
                    </h2>
                  </div>
                  <p className="text-xs mt-1" style={{ color: '#999999' }}>
                    {player.nationality} · {player.overseas ? 'Overseas' : 'Indian Domestic'}
                  </p>
                </div>
              </div>

              {/* Stats grid */}
              <div
                className="rounded-2xl p-4 mb-5 border"
                style={{ background: '#F9F4EC', borderColor: '#E7DFD1' }}
              >
                <h4 className="section-label mb-3 pb-2 border-b" style={{ borderColor: '#E7DFD1' }}>
                  Career Statistics
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <StatRow label="Batting Style" value={player.batting_style} />
                  <StatRow label="Bowling Style" value={player.bowling_style} />
                  <StatRow label="Wicketkeeper" value={player.is_wicketkeeper ? 'Yes' : 'No'} />
                  {player.strike_rate !== undefined && (
                    <StatRow label="Strike Rate" value={player.strike_rate} accent="#1D4ED8" />
                  )}
                  {player.batting_average !== undefined && (
                    <StatRow label="Batting Avg" value={player.batting_average} />
                  )}
                  {player.wickets !== undefined && (
                    <StatRow label="Wickets" value={player.wickets} accent="#065F46" />
                  )}
                  {player.economy !== undefined && (
                    <StatRow label="Economy" value={player.economy} accent="#B91C1C" />
                  )}
                </div>
              </div>

              {/* Status row */}
              <div
                className="flex items-center justify-between pt-4 border-t"
                style={{ borderColor: '#E7DFD1' }}
              >
                <div>
                  <span className="block section-label mb-0.5">Base Draft Price</span>
                  <span className="text-base font-bold" style={{ color: '#1E1E1E' }}>
                    ₹{player.base_price.toFixed(2)} Cr
                  </span>
                </div>
                {player.status === 'sold' ? (
                  <div className="text-right">
                    <span className="block section-label mb-0.5">Sold To</span>
                    <span className="text-base font-black" style={{ color: '#3BA55D' }}>
                      {player.sold_to?.replace('team_', '').toUpperCase()} · ₹{player.sold_price?.toFixed(2)} Cr
                    </span>
                  </div>
                ) : player.status === 'unsold' ? (
                  <span
                    className="text-xs font-bold uppercase px-3 py-1.5 rounded-full border"
                    style={{ background: '#F5EFE4', borderColor: '#E7DFD1', color: '#999999' }}
                  >
                    Unsold / Passed
                  </span>
                ) : (
                  <span
                    className="text-xs font-bold uppercase px-3 py-1.5 rounded-full border"
                    style={{ background: '#F0FDF4', borderColor: '#BBF7D0', color: '#166534' }}
                  >
                    Available
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PlayerCard;
