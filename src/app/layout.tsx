import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "../context/AuthContext";
import { AuctionProvider } from "../context/AuctionContext";
import { MultiplayerProvider } from "../context/MultiplayerContext";
import { Navbar } from "../components/Navbar";
import { GoogleSignInBubble } from "../components/GoogleSignInBubble";

export const metadata: Metadata = {
  title: "CricBid – Bid. Draft. Dominate.",
  description: "Real-time IPL-style player auctions with friends. Claim your franchise, manage your purse, and build a championship squad — live.",
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' }
    ]
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col antialiased" style={{ background: '#F5EFE4', color: '#1E1E1E' }}>
        <AuthProvider>
          <AuctionProvider>
            <MultiplayerProvider>
              <Navbar />
              <main className="flex-grow px-4 py-6 md:px-8 md:py-10 max-w-7xl w-full mx-auto relative">
                {children}
              </main>
              <GoogleSignInBubble />
            </MultiplayerProvider>
          </AuctionProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
