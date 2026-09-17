import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { About } from "@/components/landing/About";
import { Packages } from "@/components/landing/Packages";
import { Calculator } from "@/components/landing/Calculator";
import { Referrals } from "@/components/landing/Referrals";
import { Ranks } from "@/components/landing/Ranks";
import { PresentationDownload } from "@/components/landing/PresentationDownload";
import { Terms } from "@/components/landing/Terms";
import { Faq } from "@/components/landing/Faq";
import { Footer } from "@/components/landing/Footer";
import { getAllSystemConfigs } from "@/lib/configService";
import { CountdownBanner } from "@/components/landing/CountdownBanner";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const configs = await getAllSystemConfigs();
  const isPrelaunch = configs.PRELAUNCH_MODE === "true";
  const timerEnabled = configs.PRELAUNCH_TIMER_ENABLED !== "false";
  const targetDate = configs.PRELAUNCH_TARGET_DATE || "2026-09-21T20:00";
  const timerTitle = configs.PRELAUNCH_TIMER_TITLE || "OFFICIAL GLOBAL PLATFORM LAUNCH • SEPTEMBER 21, 2026";

  return (
    <div className="relative min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] overflow-x-hidden transition-colors duration-200">
      {/* Decorative ambient glow orbs */}
      <div className="bg-glow-gold -top-40 -right-40" />
      <div className="bg-glow-blue -bottom-40 -left-40" />

      <Navbar />
      <main className="pt-24 sm:pt-28">
        {isPrelaunch && timerEnabled && (
          <CountdownBanner targetDateStr={targetDate} title={timerTitle} />
        )}
        <Hero />
        <About />
        <Packages />
        <Calculator />
        <Referrals />
        <Ranks />
        <PresentationDownload />
        <Terms />
        <Faq />
      </main>
      <Footer />
    </div>
  );
}