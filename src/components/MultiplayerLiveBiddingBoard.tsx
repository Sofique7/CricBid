'use client';
 
import React from 'react';
import { useMultiplayer } from '../context/MultiplayerContext';
import { getNextBidAmount } from '../context/AuctionContext';
import { PlayerCard } from './PlayerCard';
import { BiddingEffectsOverlay } from './BiddingEffectsOverlay';

export const MultiplayerLiveBiddingBoard: React.FC = () => {
  const {
    currentPlayer,
    currentBid,
    currentBidderId,
    timer,
    isPaused,
    userTeamId,
    teams,
    logs,
    auctionStatus,
    lastWinner,
    isHost,
    roomCode,
    clients,
    placeUserBid,
    skipPlayer,
    nextPlayer,
    sellNow,
    pauseAuction,
    resumeAuction,
    playerName,
    error,
  } = useMultiplayer();

  const claimedTeams = teams.filter(t => clients.some(c => c.teamId === t.id));

  if (!currentPlayer) {
    return (
      <div
        className="surface-card rounded-3xl p-12 text-center"
        style={{ borderRadius: '1.5rem' }}
      >
        <h3 className="text-lg font-bold mb-1" style={{ color: '#1E1E1E' }}>
          No Player Under the Hammer
        </h3>
        <p className="text-sm" style={{ color: '#666666' }}>
          The draft pool is currently empty or the auction is complete.
        </p>
      </div>
    );
  }

  const currentBidder = teams.find(t => t.id === currentBidderId);
  const userTeam      = teams.find(t => t.id === userTeamId);
  const nextBidAmount = getNextBidAmount(currentBid, currentPlayer.base_price);

  const userHoldsBid     = currentBidderId === userTeamId;
  const userHasBudget    = userTeam ? userTeam.purse >= nextBidAmount : false;
  const userSquadFull    = userTeam ? userTeam.players.length >= 25 : false;
  const userOverseasLimit = userTeam
    ? currentPlayer.overseas && userTeam.players.filter(p => p.overseas).length >= 8
    : false;
  const canUserBid =
    userTeam &&
    !userHoldsBid &&
    userHasBudget &&
    !userSquadFull &&
    !userOverseasLimit &&
    !isPaused &&
    auctionStatus === 'bidding';

  /* ── Timer ring ── */
  const radius         = 28;
  const circumference  = 2 * Math.PI * radius;
  const strokeOffset   = circumference - (timer / 20) * circumference;
  const timerUrgent    = timer <= 5;

  /* ── Bid button label ── */
  const bidBtnLabel = !userTeamId
    ? 'Claim a Team in Lobby to Bid'
    : userHoldsBid
    ? '✓ You Hold the High Bid'
    : userOverseasLimit
    ? 'Overseas Limit Reached (Max 8)'
    : userSquadFull
    ? 'Squad Full (Max 25)'
    : !userHasBudget && userTeam
    ? `Need ₹${nextBidAmount.toFixed(2)} Cr — Insufficient Purse`
    : isPaused
    ? 'Auction is Paused'
    : `Place Bid — ₹${nextBidAmount.toFixed(2)} Cr`;

  return (
    <div className="flex flex-col space-y-6">
      {error && (
        <div
          className="text-xs font-semibold p-3 rounded-xl text-center border"
          style={{ background: '#FEF2F2', borderColor: '#FECACA', color: '#B91C1C' }}
        >
          {error}
        </div>
      )}

      {/* ── Main grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 relative">

        {/* LEFT: Player Card (col 4) */}
        <div className="lg:col-span-4 flex flex-col justify-between">
          <div className="mb-3">
            <h4 className="section-label mb-2">Active Player</h4>
            <PlayerCard player={currentPlayer} showBidOverlay={false} />
          </div>
        </div>

        {/* CENTER: Bidding Dashboard (col 5) */}
        <div className="lg:col-span-5 flex flex-col space-y-4">
          <div
            className="surface-card p-6 flex flex-col justify-between flex-grow relative"
            style={{ borderRadius: '1.5rem' }}
          >

            {/* Status + Timer row */}
            <div
              className="flex justify-between items-center pb-4 mb-4 border-b"
              style={{ borderColor: '#E7DFD1' }}
            >
              <div>
                <span className="section-label block mb-0.5">Status</span>
                <div className="flex items-center gap-1.5">
                  {!isPaused && <span className="live-dot" />}
                  <span
                    className="text-xs font-bold uppercase tracking-wide"
                    style={{ color: isPaused ? '#B91C1C' : '#3BA55D' }}
                  >
                    {isPaused ? 'Paused' : 'Live Bidding'}
                  </span>
                </div>
              </div>

              {/* Countdown circle */}
              <div className="relative w-16 h-16 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 72 72">
                  <circle
                    cx="36" cy="36" r={radius}
                    stroke="#E7DFD1" strokeWidth="4" fill="transparent"
                  />
                  <circle
                    cx="36" cy="36" r={radius}
                    stroke={timerUrgent ? '#C0392B' : '#2B2B2B'}
                    strokeWidth="4" fill="transparent"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeOffset}
                    className="transition-all duration-1000 ease-linear"
                    strokeLinecap="round"
                  />
                </svg>
                <span
                  className={`absolute text-lg font-black ${timerUrgent ? 'timer-urgent' : ''}`}
                  style={{ color: timerUrgent ? '#C0392B' : '#1E1E1E' }}
                >
                  {timer}
                </span>
              </div>
            </div>

            {/* Bid display */}
            <div className="text-center py-6 flex-grow flex flex-col justify-center">
              {currentBid === 0 ? (
                <div className="space-y-2">
                  <span className="section-label block">Base Draft Price</span>
                  <div className="text-5xl md:text-6xl font-black" style={{ color: '#1E1E1E', letterSpacing: '-0.04em' }}>
                    ₹{currentPlayer.base_price.toFixed(2)}
                    <span className="text-xl font-semibold ml-1" style={{ color: '#999999' }}>Cr</span>
                  </div>
                  <p className="text-xs" style={{ color: '#999999' }}>
                    Awaiting the opening bid.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <span className="section-label block">Current Highest Bid</span>
                  <div className="text-5xl md:text-6xl font-black" style={{ color: '#1E1E1E', letterSpacing: '-0.04em' }}>
                    ₹{currentBid.toFixed(2)}
                    <span className="text-xl font-semibold ml-1" style={{ color: '#999999' }}>Cr</span>
                  </div>
                  {currentBidder && (
                    <div className="flex items-center justify-center gap-2 mt-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ background: currentBidder.color }}
                      />
                      {currentBidder.logoUrl && (
                        <img
                          src={currentBidder.logoUrl}
                          alt={currentBidder.shortName}
                          className="w-5 h-5 object-contain"
                          referrerPolicy="no-referrer"
                          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                        />
                      )}
                      <span className="text-xs font-semibold" style={{ color: '#1E1E1E' }}>
                        {currentBidder.name}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Actions */}
            <div
              className="space-y-3 pt-4 border-t"
              style={{ borderColor: '#E7DFD1' }}
            >
              <button
                id="place-bid-btn"
                onClick={placeUserBid}
                disabled={!canUserBid}
                className="btn-primary w-full py-4 text-sm"
                style={
                  userHoldsBid
                    ? { background: '#3BA55D' }
                    : undefined
                }
              >
                {bidBtnLabel}
              </button>

              {isHost ? (
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'btn-pause-resume', label: isPaused ? '▶ Resume' : '⏸ Pause', action: isPaused ? resumeAuction : pauseAuction },
                    { id: 'btn-pass', label: '✕ Pass', action: skipPlayer },
                    { id: 'btn-sell-now', label: '🔨 Sell', action: sellNow },
                  ].map((ctrl) => (
                    <button
                      key={ctrl.id}
                      id={ctrl.id}
                      onClick={ctrl.action}
                      className="py-2.5 rounded-xl text-[10px] font-semibold border transition-colors duration-150"
                      style={{
                        background: '#F9F4EC',
                        borderColor: '#E7DFD1',
                        color: '#1E1E1E',
                      }}
                    >
                      {ctrl.label}
                    </button>
                  ))}
                </div>
              ) : (
                <div
                  className="p-3 rounded-xl text-center text-[10px] font-medium border"
                  style={{ background: '#F9F4EC', borderColor: '#E7DFD1', color: '#999999' }}
                >
                  🔒 {clients.find(c => c.isHost)?.name || 'Host'} controls auction flow
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT: Bid Activity Log (col 3) */}
        <div className="lg:col-span-3 flex flex-col">
          <h4 className="section-label mb-2">Bid Activity</h4>
          <div
            className="surface-card-sm p-3 flex-grow overflow-y-auto flex flex-col-reverse gap-2"
            style={{ height: '420px' }}
          >
            {logs.length === 0 ? (
              <p className="text-xs text-center py-10" style={{ color: '#BBBBBB' }}>
                Activity will appear here.
              </p>
            ) : (
              logs.map((log, i) => {
                const isSold    = log.startsWith('SOLD!');
                const isPassed  = log.startsWith('PASSED') || log.startsWith('SKIPPED');
                const isUserLog = log.includes(playerName) || (userTeam && log.includes(userTeam.shortName));
                const cls = isSold
                  ? 'log-entry log-entry-sold'
                  : isPassed
                  ? 'log-entry log-entry-passed'
                  : isUserLog
                  ? 'log-entry log-entry-user'
                  : 'log-entry';
                return <div key={i} className={cls}>{log}</div>;
              })
            )}
          </div>
        </div>

        {/* BOTTOM: Competitors Dashboard (full width) */}
        <div className="lg:col-span-12">
          <div className="flex items-center justify-between mb-3">
            <h4 className="section-label">Live Competitor Dashboard</h4>
            <span
              className="text-[10px] font-semibold px-2.5 py-1 rounded-full border"
              style={{ background: '#F9F4EC', borderColor: '#E7DFD1', color: '#666666' }}
            >
              Room · {roomCode}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {claimedTeams.map((t) => {
              const isCurrentBidder = t.id === currentBidderId;
              const isUser          = t.id === userTeamId;
              const claimedBy       = clients.find(c => c.teamId === t.id);

              return (
                <div
                  key={t.id}
                  className="relative rounded-2xl border overflow-hidden transition-all duration-200"
                  style={{
                    background: '#FFFDF8',
                    borderColor: isCurrentBidder ? t.color : '#E7DFD1',
                    boxShadow: isCurrentBidder ? `0 4px 16px ${t.color}28` : undefined,
                    borderWidth: isCurrentBidder ? '2px' : '1px',
                  }}
                >
                  {/* Team color left accent strip */}
                  <div
                    className="absolute left-0 top-0 bottom-0 w-1 rounded-l"
                    style={{ background: t.color }}
                  />

                  <div className="pl-4 pr-3 py-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2 min-w-0 overflow-hidden">
                        {t.logoUrl ? (
                          <img
                            src={t.logoUrl}
                            alt={t.shortName}
                            className="w-7 h-7 object-contain flex-shrink-0"
                            referrerPolicy="no-referrer"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                          />
                        ) : (
                          <span
                            className="w-2 h-2 rounded-full flex-shrink-0"
                            style={{ background: t.color }}
                          />
                        )}
                        <span
                          className={`text-xs font-bold uppercase truncate ${isUser ? 'underline' : ''}`}
                          style={{ color: '#1E1E1E' }}
                          title={t.name}
                        >
                          {t.shortName} {isUser ? '(You)' : ''}
                        </span>
                      </div>

                      {isCurrentBidder && (
                        <span
                          className="text-[9px] font-black px-1.5 py-0.5 rounded uppercase flex-shrink-0"
                          style={{ background: t.color, color: '#fff' }}
                        >
                          BID
                        </span>
                      )}
                    </div>

                    <div className="flex justify-between items-end">
                      <div className="stat-chip">
                        <span className="stat-chip__label">Purse</span>
                        <span className="stat-chip__value">₹{t.purse.toFixed(2)} Cr</span>
                      </div>
                      <div className="stat-chip text-right">
                        <span className="stat-chip__label">Squad</span>
                        <span className="stat-chip__value">{t.players.length}/25</span>
                      </div>
                    </div>

                    {claimedBy && (
                      <div
                        className="mt-2 pt-1.5 border-t text-[9px] font-medium truncate"
                        style={{ borderColor: '#E7DFD1', color: '#BBBBBB' }}
                      >
                        {claimedBy.name}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* SOLD / UNSOLD splash */}
      {(auctionStatus === 'sold_splash' || auctionStatus === 'unsold_splash') && (
        <BiddingEffectsOverlay
          status={auctionStatus === 'sold_splash' ? 'sold' : 'unsold'}
          playerName={auctionStatus === 'sold_splash' && lastWinner ? lastWinner.player.name : currentPlayer.name}
          playerRole={
            auctionStatus === 'sold_splash' && lastWinner
              ? lastWinner.player.role.replace('_', ' ')
              : currentPlayer.role.replace('_', ' ')
          }
          teamName={auctionStatus === 'sold_splash' && lastWinner ? lastWinner.team.name : undefined}
          teamLogoUrl={auctionStatus === 'sold_splash' && lastWinner ? lastWinner.team.logoUrl : undefined}
          teamColor={auctionStatus === 'sold_splash' && lastWinner ? lastWinner.team.color : undefined}
          amountStr={
            auctionStatus === 'sold_splash' && lastWinner
              ? `${lastWinner.price.toFixed(2)} Crore`
              : `${currentPlayer.base_price.toFixed(2)} Crore`
          }
          onClose={nextPlayer}
        />
      )}
    </div>
  );
};
