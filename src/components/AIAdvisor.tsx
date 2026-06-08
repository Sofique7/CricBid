'use client';

import React from 'react';
import { useAuction } from '../context/AuctionContext';
import { getBiddingRecommendations, analyzeSquad } from '../utils/aiEngine';

export const AIAdvisor: React.FC = () => {
  const { userTeamId, teams, players } = useAuction();
  const userTeam = teams.find(t => t.id === userTeamId);

  if (!userTeam) return null;

  const upcomingPool = players.filter(p => p.status === 'pool' || p.status === 'active');
  const report = analyzeSquad(userTeam.players, userTeam.purse);
  const advice = getBiddingRecommendations(userTeam.players, userTeam.purse, upcomingPool);

  const recommendedPlayer = players.find(p => p.id === advice.recommendedId);

  return (
    <div className="glass p-6 h-full flex flex-col justify-between">
      {/* Title */}
      <div>
        <div className="flex items-center space-x-2 mb-4">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.10)', border: '1px solid rgba(255,255,255,0.14)' }}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'rgba(255,255,255,0.75)' }}>
              <rect x="3" y="11" width="18" height="10" rx="2"/>
              <circle cx="12" cy="5" r="2"/>
              <path d="M12 7v4"/>
              <line x1="8" y1="15" x2="8" y2="15"/>
              <line x1="16" y1="15" x2="16" y2="15"/>
            </svg>
          </div>
          <h3 className="text-base font-bold text-white tracking-tight">
            AI Squad Advisor
          </h3>
        </div>

        {/* Warnings and Checklist */}
        <div className="space-y-3 mb-6">
          {report.errors.map((err, i) => (
            <div key={i} className="flex items-start space-x-2.5 p-3 rounded-xl bg-[rgba(215,0,21,0.08)] border border-[rgba(215,0,21,0.20)] text-[var(--danger)] text-xs font-semibold animate-pulse">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              <span>{err}</span>
            </div>
          ))}

          {report.warnings.map((warn, i) => (
            <div key={i} className="flex items-start space-x-2.5 p-3 rounded-xl bg-[rgba(201,125,0,0.08)] border border-[rgba(201,125,0,0.20)] text-[#AE5600] text-xs font-medium">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="2" x2="12" y2="6"/><path d="M12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12z"/><line x1="12" y1="22" x2="12" y2="18"/></svg>
              <span>{warn}</span>
            </div>
          ))}

          {report.errors.length === 0 && report.warnings.length === 0 && (
            <div className="flex items-start space-x-2.5 p-3 rounded-xl bg-[rgba(36,138,61,0.08)] border border-[rgba(36,138,61,0.20)] text-[var(--success)] text-xs font-semibold">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              <span>Roster satisfies all minimum role and squad size regulations! Excellent draft balance.</span>
            </div>
          )}
        </div>
      </div>

      {/* Target Recommendation */}
      <div className="pt-4 border-t border-[rgba(255,255,255,0.08)]">
        <h4 className="section-label mb-3">
          AI Target Recommendation
        </h4>
        
        {recommendedPlayer ? (
          <div className="space-y-4">
            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
              <div>
                <span className="text-[9px] uppercase font-bold text-[#9F8469] block tracking-wider mb-0.5">
                  Top Suggestion
                </span>
                <span className="text-sm font-bold text-white block">
                  {recommendedPlayer.name}
                </span>
                <span className="text-[10px] text-white/60 block uppercase font-semibold mt-0.5">
                  {recommendedPlayer.role.replace('_', ' ')} (OVR {recommendedPlayer.rating})
                </span>
              </div>
              <div className="text-right">
                <span className="text-[9px] text-white/40 block uppercase font-bold">Base Price</span>
                <span className="text-xs font-black text-white">
                  ₹{recommendedPlayer.base_price.toFixed(2)} Cr
                </span>
              </div>
            </div>

            <p className="text-xs text-white/60 italic font-medium">
              &quot;{advice.reason}&quot;
            </p>

            {/* Alternatives */}
            {advice.alternatives.length > 0 && (
              <div>
                <span className="block text-[9px] uppercase tracking-widest text-white/40 font-bold mb-2">
                  Budget-Friendly Alternatives
                </span>
                <div className="space-y-2">
                  {advice.alternatives.map((alt) => (
                    <div key={alt.id} className="flex justify-between items-center bg-white/5 p-2.5 rounded-lg border border-white/10 text-xs">
                      <div>
                        <span className="font-bold text-white">{alt.name}</span>
                        <span className="text-[9px] text-white/60 uppercase block font-semibold">
                          {alt.role.replace('_', ' ')} (OVR {alt.rating})
                        </span>
                      </div>
                      <span className="font-bold text-[#9F8469]">
                        ₹{alt.base_price.toFixed(2)} Cr
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <p className="text-xs text-white/60 text-center py-6 font-semibold">
            All players drafted! Roster balance finalized.
          </p>
        )}
      </div>
    </div>
  );
};

export default AIAdvisor;
