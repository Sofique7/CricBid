'use client';

import React from 'react';
import { useMultiplayer } from '../context/MultiplayerContext';
import { getBiddingRecommendations, analyzeSquad } from '../utils/aiEngine';

export const MultiplayerAIAdvisor: React.FC = () => {
  const { userTeamId, teams, players } = useMultiplayer();
  const userTeam = teams.find(t => t.id === userTeamId);

  if (!userTeam) {
    return (
      <div className="glass-card rounded-3xl p-6 border border-white/5 bg-[#07111F]/60 shadow-xl h-full flex flex-col justify-center items-center text-center">
        <span className="text-2xl mb-2">🤖</span>
        <h3 className="text-sm font-black text-[#94A3B8]/60 uppercase tracking-wider">
          AI Squad Advisor
        </h3>
        <p className="text-xs text-[#94A3B8] mt-2 font-medium">
          Claim a team to receive real-time draft suggestions and regulations checking.
        </p>
      </div>
    );
  }

  const upcomingPool = players.filter(p => p.status === 'pool' || p.status === 'active');
  const report = analyzeSquad(userTeam.players, userTeam.purse);
  const advice = getBiddingRecommendations(userTeam.players, userTeam.purse, upcomingPool);

  const recommendedPlayer = players.find(p => p.id === advice.recommendedId);

  return (
    <div className="glass-card rounded-3xl p-6 border border-white/5 shadow-xl h-full flex flex-col justify-between">
      {/* Title */}
      <div>
        <div className="flex items-center space-x-2 mb-4">
          <span className="text-xl">🤖</span>
          <h3 className="text-base font-black text-[#F8FAFC] uppercase tracking-wider">
            AI Squad Advisor
          </h3>
        </div>

        {/* Warnings and Checklist */}
        <div className="space-y-3 mb-6">
          {report.errors.map((err, i) => (
            <div key={i} className="flex items-start space-x-2.5 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold animate-pulse">
              <span className="text-base">⚠️</span>
              <span>{err}</span>
            </div>
          ))}

          {report.warnings.map((warn, i) => (
            <div key={i} className="flex items-start space-x-2.5 p-3 rounded-xl bg-[#38BDF8]/10 border border-[#38BDF8]/20 text-[#38BDF8] text-xs font-medium">
              <span className="text-base">💡</span>
              <span>{warn}</span>
            </div>
          ))}

          {report.errors.length === 0 && report.warnings.length === 0 && (
            <div className="flex items-start space-x-2.5 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
              <span className="text-base">✅</span>
              <span>Roster satisfies all minimum role and squad size regulations! Excellent draft balance.</span>
            </div>
          )}
        </div>
      </div>

      {/* Target Recommendation */}
      <div className="pt-4 border-t border-white/5">
        <h4 className="text-[10px] uppercase tracking-widest text-[#94A3B8]/60 font-extrabold mb-3">
          AI Target Recommendation
        </h4>
        
        {recommendedPlayer ? (
          <div className="space-y-4">
            <div className="p-3.5 rounded-xl bg-[#030810]/50 border border-white/5 flex items-center justify-between">
              <div>
                <span className="text-[9px] uppercase font-bold text-[#38BDF8] block tracking-wider">
                  Top Suggestion
                </span>
                <span className="text-sm font-extrabold text-[#F8FAFC] block font-sans">
                  {recommendedPlayer.name}
                </span>
                <span className="text-[10px] text-[#94A3B8]/60 block uppercase font-semibold">
                  {recommendedPlayer.role.replace('_', ' ')} (OVR {recommendedPlayer.rating})
                </span>
              </div>
              <div className="text-right">
                <span className="text-[9px] text-[#94A3B8]/60 block uppercase font-bold">Base Price</span>
                <span className="text-xs font-black text-[#F8FAFC]">
                  {recommendedPlayer.base_price.toFixed(2)} Cr
                </span>
              </div>
            </div>

            <p className="text-xs text-[#94A3B8] italic font-medium">
              &quot;{advice.reason}&quot;
            </p>

            {/* Alternatives */}
            {advice.alternatives.length > 0 && (
              <div>
                <span className="block text-[9px] uppercase tracking-widest text-[#94A3B8]/60 font-extrabold mb-2">
                  Budget-Friendly Alternatives
                </span>
                <div className="space-y-2">
                  {advice.alternatives.map((alt) => (
                    <div key={alt.id} className="flex justify-between items-center bg-[#030810]/30 p-2.5 rounded-lg border border-white/5 text-xs">
                      <div>
                        <span className="font-semibold text-[#F8FAFC] font-bold">{alt.name}</span>
                        <span className="text-[9px] text-[#94A3B8]/50 uppercase block font-semibold">
                          {alt.role.replace('_', ' ')} (OVR {alt.rating})
                        </span>
                      </div>
                      <span className="font-extrabold text-[#38BDF8]">
                        {alt.base_price.toFixed(2)} Cr
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <p className="text-xs text-[#94A3B8]/40 text-center py-6 font-semibold">
            All players drafted! Roster balance finalized.
          </p>
        )}
      </div>
    </div>
  );
};
export default MultiplayerAIAdvisor;
