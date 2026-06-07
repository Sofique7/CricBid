<div align="center">

# 🏏 CricBid

### **Bid. Draft. Dominate.**

*A real-time, multiplayer IPL-style player auction platform — built for cricket fans who want to manage franchises like a pro.*

<br/>

![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-Realtime-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Vercel](https://img.shields.io/badge/Deployed_on-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)

[![Live Demo](https://img.shields.io/badge/🚀_Live_Demo-Visit_CricBid-6366f1?style=for-the-badge)](https://cricbid.vercel.app)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

</div>

---

## 📖 Overview

**CricBid** is a real-time multiplayer auction platform that replicates the high-stakes drama of IPL mega auctions. Gather friends, pick your franchise, and compete to build the most powerful cricket squad — all in real time, powered by Firebase.

Whether you're running an offline auction with a group of mates or hosting a competitive fantasy draft, CricBid handles the full lifecycle: room creation, franchise assignment, live bidding with countdown timers, purse tracking, and squad management — all synced instantly across every player's screen.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🔴 **Real-time Multiplayer Auctions** | Every bid is synced live across all connected users via Firebase Realtime Database |
| 🏟️ **IPL Franchise Selection** | Choose from all official IPL franchises with full team branding |
| 🎨 **Dynamic Team Backgrounds** | The UI adapts to your franchise's colors and visual identity |
| ⚡ **Live Bid Synchronization** | Sub-second latency ensures no bid is ever missed |
| 📈 **Smart Bid Increment System** | Tiered increments that mirror real IPL auction logic |
| 💰 **Purse Management** | Track your remaining budget in real time throughout the auction |
| 🧩 **Squad Building** | Assemble your ideal XI by role — openers, all-rounders, death bowlers, and more |
| 🔐 **Google Authentication** | Secure, one-click sign-in via Firebase Auth |
| 🔄 **Room Rejoin Support** | Accidentally disconnected? Rejoin your active auction room seamlessly |
| 🔥 **Firebase Realtime Database** | State-of-the-art, scalable backend with zero server management |
| 📱 **Responsive UI** | Fully functional across desktop, tablet, and mobile |
| 🌐 **Vercel Deployment** | Edge-optimized, globally distributed deployment |

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| **Next.js 15** | React framework with App Router and server components |
| **React 19** | Component-based UI with hooks and context |
| **TypeScript** | Type-safe development throughout |
| **Tailwind CSS** | Utility-first styling with custom franchise themes |

### Backend & Services
| Technology | Purpose |
|---|---|
| **Firebase Realtime Database** | Live multiplayer state sync across all connected clients |
| **Firebase Authentication** | Google OAuth — secure, instant sign-in |

### Deployment
| Technology | Purpose |
|---|---|
| **Vercel** | CI/CD pipeline, preview deployments, edge network |

---

## 🏗️ Architecture

```
┌──────────────────────────────────────────┐
│                  User                    │
│          (Browser / Mobile)              │
└────────────────┬─────────────────────────┘
                 │
                 ▼
┌──────────────────────────────────────────┐
│           Next.js Frontend               │
│   App Router · React Components         │
│   Tailwind CSS · TypeScript              │
└──────┬──────────────────┬────────────────┘
       │                  │
       ▼                  ▼
┌─────────────┐   ┌──────────────────────┐
│  Firebase   │   │  Firebase Realtime   │
│    Auth     │   │      Database        │
│  (Google    │   │                      │
│   OAuth)    │   │  Rooms · Players     │
└─────────────┘   │  Bids · Squads       │
                  └──────────┬───────────┘
                             │
                             ▼
                  ┌──────────────────────┐
                  │  Real-Time Sync      │
                  │  All Connected       │
                  │  Clients Updated     │
                  │  Simultaneously      │
                  └──────────────────────┘
```

---

## 📋 Auction Rules

CricBid mirrors the real IPL auction ruleset to keep things authentic and competitive.

### 💵 Starting Purse
Each franchise begins with a war chest of **₹120 Crore**.

### 📊 Bid Increment Tiers

| Current Bid | Increment Per Raise |
|---|---|
| ₹0 – ₹2 Cr | **+₹0.10 Cr** |
| ₹2 – ₹5 Cr | **+₹0.20 Cr** |
| ₹5 – ₹10 Cr | **+₹0.50 Cr** |
| ₹10 – ₹20 Cr | **+₹1 Cr** |
| ₹20 Cr+ | **+₹2 Cr** |

### ⏱️ Auction Timer
Each player goes under the hammer with a **20-second countdown**. If no new bid lands before the clock hits zero, the player is sold to the highest bidder.

---

## 📸 Screenshots

> *Coming soon — live screenshots and demo GIFs will be added here.*

| Lobby & Franchise Selection | Live Auction Room |
|---|---|
| 🖼️ *Screenshot placeholder* | 🖼️ *Screenshot placeholder* |

| Squad Builder | Purse & Stats |
|---|---|
| 🖼️ *Screenshot placeholder* | 🖼️ *Screenshot placeholder* |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18+ ([download](https://nodejs.org))
- **npm** v9+ (bundled with Node.js)
- A **Firebase project** ([create one](https://console.firebase.google.com))

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/yourusername/cricbid.git
cd cricbid

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env.local
# → Fill in your Firebase credentials (see below)

# 4. Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. The app hot-reloads automatically on file changes.

---

## 🔑 Environment Variables

Create a `.env.local` file at the root of the project and populate it with your Firebase project credentials.

```env
# .env.local

NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://your_project_id-default-rtdb.firebaseio.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

> **Note:** All variables must be prefixed with `NEXT_PUBLIC_` to be accessible in the browser. Never commit `.env.local` to version control — it's already included in `.gitignore`.

See [`FIREBASE_SETUP.md`](./FIREBASE_SETUP.md) for a step-by-step guide to configuring your Firebase project.

---

## 🗺️ Roadmap

CricBid is actively evolving. Here's what's coming next:

- [ ] 🤖 **AI Team Suggestions** — Get ML-powered squad recommendations based on budget and player roles
- [ ] 📊 **Player Analytics** — Historical stats, form metrics, and auction value scores
- [ ] 📜 **Auction History** — Full replay of every bid, player, and transaction
- [ ] 🏆 **Leaderboards** — Global and room-level rankings based on squad performance
- [ ] 🎫 **Tournament Mode** — Host multi-round auctions with group stages and finals
- [ ] 🛡️ **Admin Dashboard** — Room moderation, player management, and custom auction settings

Have a feature idea? [Open an issue](https://github.com/yourusername/cricbid/issues) — contributions are welcome!

---

## 📁 Project Structure

```
cricbid/
├── src/
│   ├── app/                # Next.js App Router pages & layouts
│   ├── components/         # Reusable React components
│   ├── lib/                # Firebase config & utility functions
│   └── types/              # TypeScript type definitions
├── public/                 # Static assets (logos, player images)
├── database.rules.json     # Firebase Realtime Database security rules
├── vercel.json             # Vercel deployment configuration
└── .env.example            # Environment variable template
```

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m 'feat: add your feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a Pull Request

Please follow the existing code style and add appropriate TypeScript types for any new code.

---

## 👤 Author

**Darshan**

- GitHub: [@justdarshan510](https://github.com/justdarshan510)

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

<div align="center">

**⭐ If CricBid impressed you, drop a star on GitHub — it means a lot!**

*Built with ❤️ for cricket fans everywhere*

</div>
