import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Dubai Finance - Trusted Financial Solutions & High Yield Daily Growth",
  description: "Official Dubai Finance Investment Portal. Earn 5% to 15% Daily ROI in USDT BEP-20. 12-Level Team Royalty & Instant Direct Referral Rewards.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#030712] text-slate-100 antialiased selection:bg-amber-400 selection:text-black">
        {children}
      </body>
    </html>
  );
}