'use client';

import React from 'react';
import { Player } from '../data/players';
import { solvePlayingXI } from '../utils/aiEngine';

interface PlayingXIDisplayProps {
  squad: Player[];
}

export const PlayingXIDisplay: React.FC<PlayingXIDisplayProps> = ({ squad }) => {
  const { playingXI, warnings } = solvePlayingXI(squad);

  // Distribute players into positions on the pitch
  const openers = playingXI.filter(p => p.role === 'opener').slice(0, 2);
  const wicketkeeper = playingXI.find(p => p.is_wicketkeeper) || playingXI.find(p => p.role === 'middle_order' && p.is_wicketkeeper);
  
  // Exclude keeper and openers from other selections to avoid duplicate rendering
  const excludedIds = new Set([
    ...openers.map(o => o.id),
    ...(wicketkeeper ? [wicketkeeper.id] : [])
  ]);

  const middleOrder = playingXI.filter(p => !excludedIds.has(p.id) && (p.role === 'middle_order' || p.role === 'finisher')).slice(0, 3);
  const allRounders = playingXI.filter(p => !excludedIds.has(p.id) && p.role === 'all_rounder').slice(0, 2);
  
  const bowlers = playingXI.filter(p => 
    !excludedIds.has(p.id) && 
    (p.role === 'spinner' || p.role === 'death_bowler' || p.role === 'powerplay_bowler')
  );

  // Fill in placeholders if we have missing slots
  const renderPlayerBadge = (player: Player | undefined, slotLabel: string) => {
    if (!player) {
      return (
        <div className="flex flex-col items-center justify-center p-2 rounded-2xl bg-[#030810]/30 border border-dashed border-white/5 w-20 h-20 transition-all duration-300 hover:scale-105 hover:border-[#38BDF8]/30 hover:bg-[#030810]/50 group cursor-pointer shadow-inner">
          <span className="text-xs text-[#38BDF8]/40 group-hover:text-[#38BDF8]/80 group-hover:rotate-90 transition-all duration-300">✦</span>
          <span className="text-[8px] uppercase tracking-wider text-[#94A3B8]/30 group-hover:text-[#F8FAFC]/60 transition-colors font-bold mt-1 text-center leading-tight px-1">
            {slotLabel}
          </span>
        </div>
      );
    }

    const roleBorders: Record<string, string> = {
      opener: 'border-[#38BDF8] shadow-[#38BDF8]/5',
      middle_order: 'border-white/20 shadow-white/5',
      finisher: 'border-purple-500/40 shadow-purple-500/5',
      spinner: 'border-emerald-500/40 shadow-emerald-500/5',
      death_bowler: 'border-blue-500/40 shadow-blue-500/5',
      powerplay_bowler: 'border-cyan-500/40 shadow-cyan-500/5',
      all_rounder: 'border-pink-500/40 shadow-pink-500/5'
    };

    const borderStyle = roleBorders[player.role] || 'border-white/10';

    return (
      <div 
        className={`flex flex-col items-center justify-center p-1.5 rounded-2xl bg-[#030810]/95 border-2 ${borderStyle} w-20 h-20 shadow-lg relative group transition-all duration-300 hover:scale-105 hover:shadow-[#38BDF8]/10`}
        title={`${player.name} (${player.role.replace('_', ' ')}) - Rating: ${player.rating}`}
      >
        {/* Overseas icon */}
        {player.overseas && (
          <span className="absolute top-1.5 right-2 text-[8px] text-[#38BDF8] drop-shadow-[0_0_2px_rgba(56,189,248,0.4)]">✈</span>
        )}

        {/* Rating overlay */}
        <span className="absolute top-1.5 left-2 text-[8px] font-black text-[#38BDF8] tracking-tighter">
          {player.rating}
        </span>

        {/* Small Jersey Icon */}
        <div className="w-7 h-7 flex items-center justify-center text-xs bg-white/5 rounded-full border border-white/5 group-hover:bg-[#38BDF8]/10 group-hover:border-[#38BDF8]/20 transition-all duration-300">
          👕
        </div>

        {/* Player Name */}
        <span className="text-[9px] font-black text-[#F8FAFC] mt-1 truncate w-full text-center tracking-tight px-0.5">
          {player.name.split(' ').pop()}
        </span>

        {/* Role label */}
        <span className="text-[7px] text-[#94A3B8]/70 uppercase tracking-widest truncate w-full text-center mt-0.5 leading-none">
          {player.is_wicketkeeper ? 'Keeper' : player.role.replace('_', ' ')}
        </span>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Pitch Layout Plate */}
      <div className="glass-card rounded-3xl border border-white/5 p-4 overflow-hidden relative shadow-2xl bg-gradient-to-b from-[#0a1610]/40 to-[#030810]/50">
        {/* Background grass pattern */}
        <div className="absolute inset-0 pitch-bg opacity-30 pointer-events-none"></div>
        
        {/* Pitch Lines (Authentic Crease Layout) */}
        <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 h-0.5 bg-white/5 border-t border-dashed pointer-events-none"></div>
        
        {/* Cricket Crease Boundaries (Top & Bottom pitch areas) */}
        <div className="absolute inset-x-12 top-6 h-10 border-x border-b border-white/15 pointer-events-none rounded-b-lg"></div>
        <div className="absolute inset-x-12 bottom-6 h-10 border-x border-t border-white/15 pointer-events-none rounded-t-lg"></div>
        
        {/* Pitch crease marks */}
        <div className="absolute left-1/2 -translate-x-1/2 top-10 w-12 h-0.5 bg-white/25 rounded pointer-events-none"></div>
        <div className="absolute left-1/2 -translate-x-1/2 bottom-10 w-12 h-0.5 bg-white/25 rounded pointer-events-none"></div>

        {/* Visual stadium content */}
        <div className="relative z-10 flex flex-col justify-between h-[420px] max-w-sm mx-auto">
          {/* Row 1: Wicket Keeper (Top) */}
          <div className="flex justify-center">
            {renderPlayerBadge(wicketkeeper, 'W-Keeper')}
          </div>

          {/* Row 2: Openers */}
          <div className="flex justify-center space-x-12 -mt-4">
            {renderPlayerBadge(openers[0], 'Opener 1')}
            {renderPlayerBadge(openers[1], 'Opener 2')}
          </div>

          {/* Row 3: Middle Order */}
          <div className="flex justify-center space-x-6 -mt-2">
            {renderPlayerBadge(middleOrder[0], 'Middle 3')}
            {renderPlayerBadge(middleOrder[1], 'Middle 4')}
            {renderPlayerBadge(middleOrder[2], 'Finisher 5')}
          </div>

          {/* Row 4: All Rounders */}
          <div className="flex justify-center space-x-12 -mt-2">
            {renderPlayerBadge(allRounders[0], 'All-R 6')}
            {renderPlayerBadge(allRounders[1], 'All-R 7')}
          </div>

          {/* Row 5: Bowlers (Bottom) */}
          <div className="flex justify-center space-x-4 -mt-2">
            {renderPlayerBadge(bowlers[0], 'Spinner')}
            {renderPlayerBadge(bowlers[1], 'Bowler')}
            {renderPlayerBadge(bowlers[2], 'Bowler')}
            {renderPlayerBadge(bowlers[3], 'Bowler')}
          </div>
        </div>
      </div>

      {/* Warnings & Guidelines block */}
      {warnings.length > 0 && (
        <div className="p-3.5 bg-[#38BDF8]/10 border border-[#38BDF8]/20 text-[#38BDF8] rounded-2xl text-[11px] space-y-1">
          <span className="font-extrabold uppercase block tracking-wider text-[9px] mb-1">
            Playing XI Assembly Flags:
          </span>
          {warnings.map((warn, i) => (
            <div key={i} className="flex items-start space-x-1.5 font-medium">
              <span>•</span>
              <span>{warn}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
export default PlayingXIDisplay;
