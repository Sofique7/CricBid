import React from 'react';

const rules = [
  {
    category: 'Budget',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3v1a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9"/>
        <path d="M16 14h.01"/>
      </svg>
    ),
    items: [
      { title: 'Starting Purse', desc: 'Every franchise begins with ₹120 Crore. This is the maximum you can spend across the entire auction.' },
      { title: 'Real-Time Deduction', desc: 'Each winning bid is instantly deducted from your purse. You cannot bid beyond your remaining balance.' },
      { title: 'No Transfers', desc: 'Purse cannot be transferred between franchises. Unspent balance carries no benefit — bid strategically.' },
    ],
  },
  {
    category: 'Squad Size',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
    items: [
      { title: 'Minimum Squad', desc: 'Each franchise must have at least 12 players by end of auction to be considered valid.' },
      { title: 'Maximum Squad', desc: 'No franchise may exceed 25 players in total across the entire draft.' },
      { title: 'Playing XI', desc: 'The AI engine automatically selects the optimal 11 from your squad for match simulation.' },
    ],
  },
  {
    category: 'Player Eligibility',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2L3 7v6c0 5.25 3.75 10.15 9 11.25C17.25 23.15 21 18.25 21 13V7L12 2z"/>
      </svg>
    ),
    items: [
      { title: 'Overseas Cap', desc: 'A maximum of 8 overseas (non-Indian) players are allowed per franchise squad.' },
      { title: 'Wicketkeeper Mandatory', desc: 'Every squad must include at least 1 designated Wicketkeeper-Batsman.' },
      { title: 'Nationality', desc: 'Players marked with an amber dot are overseas players. Plan your 8-slot overseas quota carefully.' },
    ],
  },
  {
    category: 'Bidding Process',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
      </svg>
    ),
    items: [
      { title: 'Base Price', desc: 'Every player enters at their listed base price. Bidding starts from this value — you may not bid below it.' },
      { title: 'Bid Increments', desc: 'Bids are raised in fixed increments. Each raise must be higher than the current standing bid.' },
      { title: 'Sold / Passed', desc: 'If no franchise bids, the player is passed. Passed players may re-enter the pool in later rounds.' },
      { title: 'Timer', desc: 'A countdown runs for each lot. If no bid is placed before time expires, the player is passed automatically.' },
    ],
  },
  {
    category: 'Multiplayer',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
      </svg>
    ),
    items: [
      { title: 'Room Host', desc: 'The host creates a room and receives a 6-digit code to share. The host controls auction pacing.' },
      { title: 'Joining', desc: 'Up to 10 franchises can join a room. Each player must claim a franchise before the auction starts.' },
      { title: 'Reconnection', desc: 'If disconnected, you can rejoin using the same room code. Your bids and squad remain intact.' },
    ],
  },
];

export default function RulesPage() {
  return (
    <div className="py-8 max-w-5xl mx-auto space-y-8 text-white">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight" style={{ color: 'var(--text-primary)', letterSpacing: '-0.025em' }}>
          Auction Rules
        </h1>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          Everything you need to know before entering the auction room.
        </p>
      </div>

      {/* Rule sections */}
      <div className="space-y-5">
        {rules.map((section) => (
          <div key={section.category} className="glass overflow-hidden">
            {/* Section header */}
            <div
              className="flex items-center gap-3 px-6 py-4 border-b"
              style={{ borderColor: 'var(--glass-border)', background: 'var(--glass)' }}
            >
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'var(--accent-dim)', color: 'var(--accent)' }}
              >
                {section.icon}
              </div>
              <h2 className="text-[15px] font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
                {section.category}
              </h2>
            </div>

            {/* Rules list */}
            <div className="divide-y" style={{ borderColor: 'var(--glass-border)' }}>
              {section.items.map((item, idx) => (
                <div key={idx} className="flex items-start gap-4 px-6 py-4">
                  <div
                    className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-[7px]"
                    style={{ background: 'var(--accent)' }}
                  />
                  <div>
                    <p className="text-[13px] font-semibold mb-0.5" style={{ color: 'var(--text-primary)' }}>
                      {item.title}
                    </p>
                    <p className="text-[13px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Footer note */}
      <div
        className="rounded-2xl px-6 py-4 text-[12px] font-medium"
        style={{ background: 'var(--accent-dim)', border: '1px solid rgba(212,150,58,0.25)', color: 'var(--accent)' }}
      >
        Rules may be adjusted by the room host before the auction begins. When in doubt, refer to the official IPL auction guidelines.
      </div>
    </div>
  );
}
