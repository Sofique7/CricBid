'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Player, initialPlayers } from '../data/players';

// Build a lookup map of player images from the source data
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
    'india': 'in',
    'australia': 'au',
    'south africa': 'za',
    'england': 'gb-eng',
    'new zealand': 'nz',
    'sri lanka': 'lk',
    'srilanka': 'lk',
    'afghanistan': 'af',
    'bangladesh': 'bd',
    'ireland': 'ie',
    'zimbabwe': 'zw',
    'usa': 'us',
    'nepal': 'np',
    'netherlands': 'nl',
    'scotland': 'gb-sct'
  };

  const code = mapping[norm];
  if (code) {
    return `https://flagcdn.com/w40/${code}.png`;
  }
  return '';
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
  bidderColor
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setImageError(false);
  }, [player.id, player.image]);

  // Styling maps for roles
  const roleStyles: Record<string, { label: string; bg: string; text: string; glow: string }> = {
    opener: {
      label: 'Opener',
      bg: 'bg-red-500/10 border-red-500/25',
      text: 'text-red-300',
      glow: 'border-red-500/10 shadow-red-500/2'
    },
    middle_order: {
      label: 'Middle Order',
      bg: 'bg-amber-500/10 border-amber-500/25',
      text: 'text-amber-300',
      glow: 'border-amber-500/10 shadow-amber-500/2'
    },
    finisher: {
      label: 'Finisher',
      bg: 'bg-purple-500/10 border-purple-500/25',
      text: 'text-purple-300',
      glow: 'border-purple-500/10 shadow-purple-500/2'
    },
    spinner: {
      label: 'Spinner',
      bg: 'bg-emerald-500/10 border-emerald-500/25',
      text: 'text-emerald-300',
      glow: 'border-emerald-500/10 shadow-emerald-500/2'
    },
    death_bowler: {
      label: 'Death Bowler',
      bg: 'bg-blue-500/10 border-blue-500/25',
      text: 'text-blue-300',
      glow: 'border-blue-500/10 shadow-blue-500/2'
    },
    powerplay_bowler: {
      label: 'Powerplay Bowler',
      bg: 'bg-cyan-500/10 border-cyan-500/25',
      text: 'text-cyan-300',
      glow: 'border-cyan-500/10 shadow-cyan-500/2'
    },
    all_rounder: {
      label: 'All Rounder',
      bg: 'bg-[#38BDF8]/10 border-[#38BDF8]/25',
      text: 'text-[#38BDF8]',
      glow: 'border-[#38BDF8]/10 shadow-[#38BDF8]/2'
    }
  };

  const style = roleStyles[player.role] || {
    label: player.role,
    bg: 'bg-white/5 border-white/10',
    text: 'text-[#94A3B8]',
    glow: 'border-white/5'
  };

  // Resolve player image: check player.image first, then fallback to the master lookup map
  const resolvedImage = player.image || playerImageMap[player.id] || playerImageMap[player.name.toLowerCase().trim()] || '';

  // Memoize custom SVG avatar based on player id and role
  const avatar = useMemo(() => {
    if (resolvedImage && !imageError) {
      return (
        <img 
          src={resolvedImage} 
          alt={player.name} 
          className="w-[85%] h-[85%] object-contain z-10 relative pointer-events-none" 
          onError={() => setImageError(true)}
        />
      );
    }

    let strokeColor = '#0081e4'; // Spinner / Bowler Blue
    let accColor = '#3b82f6';
    let pathMarkup = null;

    if (player.role === 'opener' || player.role === 'middle_order' || player.role === 'finisher') {
      strokeColor = '#ec1c24'; // Red for Batters
      accColor = '#f59e0b';
      // Batsman silhouette pose
      pathMarkup = (
        <path
          d="M25,65 L35,50 L40,30 L45,20 L50,12 M45,20 L55,22 L65,30 L60,40 M40,30 L30,35 L20,40 M60,40 L68,60 L78,65 M68,60 L62,56 M20,40 L8,24"
          stroke={strokeColor}
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      );
    } else if (player.role === 'all_rounder') {
      strokeColor = '#e73895'; // Pink for Allrounders
      accColor = '#a855f7';
      // Allrounder pose (cricket bat + ball)
      pathMarkup = (
        <>
          <circle cx="28" cy="22" r="5" fill={accColor} className="animate-pulse" />
          <path
            d="M38,65 L43,45 L45,25 L50,15 M45,25 L55,26 L62,35 L58,45 M30,32 L20,38 L12,25 M58,45 L64,62 L74,66 M20,38 L30,42"
            stroke={strokeColor}
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </>
      );
    } else {
      // Bowler silhouette pose
      strokeColor = '#10b981'; // Emerald for Bowlers
      accColor = '#06b6d4';
      pathMarkup = (
        <path
          d="M32,65 L36,52 L40,35 L42,22 L45,15 M40,35 L55,25 L65,12 L50,8 M36,52 L25,48 L15,35 M55,25 L62,45 L70,62 L78,65"
          stroke={strokeColor}
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      );
    }

    return (
      <svg viewBox="0 0 100 80" className="w-full h-full opacity-85">
        <defs>
          <radialGradient id={`glow-${player.id}`} cx="50%" cy="40%" r="60%">
            <stop offset="0%" stopColor={accColor} stopOpacity="0.3" />
            <stop offset="100%" stopColor="#080b11" stopOpacity="0" />
          </radialGradient>
        </defs>
        
        {/* Glow sphere background */}
        <circle cx="50" cy="40" r="35" fill={`url(#glow-${player.id})`} />
        
        {/* Silhouette Ground Plate */}
        <ellipse cx="50" cy="72" rx="30" ry="6" fill="#000" opacity="0.4" />
        
        {/* Head */}
        <circle cx="45" cy="12" r="4.5" fill={strokeColor} />
        
        {/* Stumps in background */}
        <path d="M72,40 L72,70 M75,42 L75,70 M78,44 L78,70 M70,41 L80,43" stroke="rgba(255,255,255,0.06)" strokeWidth="2" opacity="0.6" />
        
        {/* Body skeletal paths */}
        {pathMarkup}
      </svg>
    );
  }, [player.id, player.role, resolvedImage, imageError]);

  return (
    <>
      <div
        onClick={() => setIsModalOpen(true)}
        className={`glass-card glass-card-hover rounded-2xl overflow-hidden cursor-pointer group shadow-soft border ${style.glow}`}
      >
        {/* Rating Badge */}
        <div className="absolute top-3 left-3 bg-[#07111F]/80 backdrop-blur-md border border-[#38BDF8]/35 text-[#38BDF8] text-xs font-black px-2.5 py-1.5 rounded-full z-10 shadow flex items-center space-x-1">
          <span>OVR</span>
          <span className="text-sm font-black">{player.rating}</span>
        </div>

        {/* Nationality flag icon */}
        <div className="absolute top-3 right-3 bg-[#07111F]/80 backdrop-blur-md border border-white/10 text-[10px] font-bold px-2.5 py-1 rounded-full z-10 shadow flex items-center space-x-1.5 text-[#F8FAFC]">
          <span>{player.nationality}</span>
          {player.overseas && <span className="text-[#38BDF8]">✈ Overseas</span>}
        </div>

        {/* Player Graphic Plate */}
        <div className="h-44 bg-gradient-to-b from-[#0e213a]/30 to-[#07111F] flex items-center justify-center p-4 relative overflow-hidden">
          {avatar}
          
          {/* Card Accent Grid Overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:10px_10px] pointer-events-none opacity-40"></div>
        </div>

        {/* Player Info */}
        <div className="p-4 bg-[#07111F]/85 border-t border-white/5 relative">
          <div className="flex items-center space-x-2 mb-1.5">
            <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md border ${style.bg} ${style.text}`}>
              {style.label}
            </span>
            {player.is_wicketkeeper && (
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md border border-teal-500/20 bg-teal-500/10 text-teal-300">
                WK-Keeper
              </span>
            )}
          </div>

          <div className="flex items-center space-x-2 min-w-0">
            {getFlagUrl(player.nationality) && (
              <img
                src={getFlagUrl(player.nationality)}
                alt={player.nationality}
                className="w-5 h-5 rounded-full object-cover border border-white/20 shadow-sm flex-shrink-0"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
            )}
            <h3 className="text-base font-extrabold text-[#F8FAFC] group-hover:text-[#38BDF8] transition-colors truncate">
              {player.name}
            </h3>
          </div>

          {/* Style Indicators */}
          <div className="flex justify-between items-center text-[10px] text-[#94A3B8] mt-1 mb-3.5">
            <span className="truncate">{player.batting_style}</span>
            <span className="truncate max-w-[50%]">{player.bowling_style}</span>
          </div>

          {/* Auction Details */}
          <div className="flex items-center justify-between pt-3 border-t border-white/5">
            <div>
              <span className="block text-[9px] uppercase tracking-wider text-[#94A3B8]/60">Base Price</span>
              <span className="text-sm font-bold text-[#F8FAFC]">{player.base_price.toFixed(2)} Cr</span>
            </div>
            {player.status === 'sold' ? (
              <div className="text-right">
                <span className="block text-[9px] uppercase tracking-wider text-red-400 font-bold">SOLD</span>
                <span className="text-sm font-black text-[#38BDF8]">
                  {player.sold_price?.toFixed(2)} Cr
                </span>
              </div>
            ) : player.status === 'unsold' ? (
              <div className="text-right">
                <span className="text-xs font-bold text-[#94A3B8] uppercase tracking-widest bg-white/5 px-2 py-0.5 rounded border border-white/5">
                  UNSOLD
                </span>
              </div>
            ) : (
              <div className="text-right">
                <span className="text-xs text-[#38BDF8] font-semibold group-hover:underline flex items-center space-x-0.5">
                  <span>View Stats</span>
                  <span>→</span>
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Live Bid Overlay (for live room animations) */}
        {showBidOverlay && bidAmount !== undefined && bidAmount > 0 && (
          <div className="absolute inset-0 bg-[#07111F]/90 backdrop-blur-md flex flex-col items-center justify-center p-4 text-center z-20 animate-fade-in">
            <span className="text-xs uppercase tracking-widest text-[#94A3B8]">CURRENT HIGH BID</span>
            <div className="text-3xl font-black text-[#38BDF8] my-1 drop-shadow-[0_0_15px_rgba(56,189,248,0.4)] animate-bounce">
              {bidAmount.toFixed(2)} Cr
            </div>
            <div
              className="text-xs font-black uppercase px-3 py-1 rounded-full border border-opacity-40"
              style={{
                backgroundColor: `${bidderColor}20`,
                borderColor: bidderColor,
                color: bidderColor || '#fff'
              }}
            >
              Held by: {bidderName || 'None'}
            </div>
          </div>
        )}
      </div>

      {/* Statistics Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm transition-all animate-fade-in">
          <div
            onClick={(e) => e.stopPropagation()}
            className="glass-card max-w-lg w-full rounded-3xl overflow-hidden border border-white/10 bg-[#07111F]/95 backdrop-blur-xl shadow-2xl relative"
          >
            {/* Header branding color line */}
            <div className="h-1.5 bg-[#38BDF8]"></div>

            {/* Close Button */}
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-[#94A3B8] hover:text-[#F8FAFC] bg-white/5 border border-white/10 hover:bg-white/10 p-2 rounded-full transition"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Content */}
            <div className="p-6 md:p-8">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-16 h-16 rounded-2xl bg-[#07111F] border border-white/5 p-1 flex-shrink-0">
                  {avatar}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${style.bg} ${style.text}`}>
                      {style.label}
                    </span>
                    <span className="text-[10px] uppercase font-bold text-[#94A3B8] px-2 py-0.5 rounded bg-white/5 border border-white/5">
                      OVR {player.rating}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 mt-1.5 min-w-0">
                    {getFlagUrl(player.nationality) && (
                      <img
                        src={getFlagUrl(player.nationality)}
                        alt={player.nationality}
                        className="w-6 h-6 rounded-full object-cover border border-white/20 shadow-sm flex-shrink-0"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                      />
                    )}
                    <h2 className="text-xl md:text-2xl font-black text-[#F8FAFC] truncate">
                      {player.name}
                    </h2>
                  </div>
                  <p className="text-xs text-[#94A3B8] flex items-center space-x-1.5 mt-1">
                    <span>{player.nationality} {player.overseas ? '(Overseas Star)' : '(Indian Domestic Player)'}</span>
                    {player.overseas && <span className="text-[#38BDF8]">✈</span>}
                  </p>
                </div>
              </div>

              {/* Stats Sheet Grid */}
              <div className="bg-white/5 rounded-2xl border border-white/5 p-4 mb-6">
                <h4 className="text-xs uppercase font-extrabold tracking-widest text-[#94A3B8] mb-3 border-b border-white/5 pb-2">
                  Career Statistics / Bio
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <span className="block text-[10px] text-[#94A3B8]/60 uppercase tracking-wider">Batting Style</span>
                    <span className="text-xs font-bold text-[#F8FAFC]">{player.batting_style}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-[#94A3B8]/60 uppercase tracking-wider">Bowling Style</span>
                    <span className="text-xs font-bold text-[#F8FAFC]">{player.bowling_style}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-[#94A3B8]/60 uppercase tracking-wider">Wicketkeeper</span>
                    <span className="text-xs font-bold text-[#F8FAFC]">{player.is_wicketkeeper ? 'Yes' : 'No'}</span>
                  </div>

                  {player.strike_rate !== undefined && (
                    <div>
                      <span className="block text-[10px] text-[#94A3B8]/60 uppercase tracking-wider">Strike Rate</span>
                      <span className="text-sm font-extrabold text-[#38BDF8]">{player.strike_rate}</span>
                    </div>
                  )}
                  {player.batting_average !== undefined && (
                    <div>
                      <span className="block text-[10px] text-[#94A3B8]/60 uppercase tracking-wider">Batting Average</span>
                      <span className="text-sm font-extrabold text-[#F8FAFC]">{player.batting_average}</span>
                    </div>
                  )}
                  {player.wickets !== undefined && (
                    <div>
                      <span className="block text-[10px] text-[#94A3B8]/60 uppercase tracking-wider">Wickets Taken</span>
                      <span className="text-sm font-extrabold text-teal-400">{player.wickets}</span>
                    </div>
                  )}
                  {player.economy !== undefined && (
                    <div>
                      <span className="block text-[10px] text-[#94A3B8]/60 uppercase tracking-wider">Economy Rate</span>
                      <span className="text-sm font-extrabold text-red-400">{player.economy}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Status details */}
              <div className="flex items-center justify-between pt-4 border-t border-white/5 text-xs">
                <div>
                  <span className="block text-[10px] uppercase text-[#94A3B8]/60 tracking-wider">Base Draft Price</span>
                  <span className="text-sm font-bold text-[#F8FAFC]">{player.base_price.toFixed(2)} Cr</span>
                </div>
                <div>
                  {player.status === 'sold' ? (
                    <div className="text-right">
                      <span className="text-[10px] uppercase text-[#94A3B8]/60 tracking-wider">Sold To</span>
                      <span className="text-sm font-black text-[#38BDF8]">
                        {player.sold_to?.replace('team_', '').toUpperCase()} for {player.sold_price?.toFixed(2)} Cr
                      </span>
                    </div>
                  ) : player.status === 'unsold' ? (
                    <span className="text-xs bg-white/5 border border-white/5 text-[#94A3B8] px-3 py-1.5 rounded-full font-bold uppercase tracking-wider">
                      Unsold / Passed
                    </span>
                  ) : (
                    <span className="text-xs bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-3 py-1.5 rounded-full font-bold uppercase tracking-wider animate-pulse">
                      Available in Pool
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
export default PlayerCard;
