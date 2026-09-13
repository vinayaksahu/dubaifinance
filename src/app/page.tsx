import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { About } from "@/components/landing/About";
import { Packages } from "@/components/landing/Packages";
import { Calculator } from "@/components/landing/Calculator";
import { Referrals } from "@/components/landing/Referrals";
import { Ranks } from "@/components/landing/Ranks";
import { Terms } from "@/components/landing/Terms";
import { Faq } from "@/components/landing/Faq";
import { Footer } from "@/components/landing/Footer";

export default function HomePage() {
  return (
    <div className="relative min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] overflow-x-hidden transition-colors duration-200">
      {/* Decorative ambient glow orbs */}
      <div className="bg-glow-gold -top-40 -right-40" />
      <div className="bg-glow-blue -bottom-40 -left-40" />

      <Navbar />
      <main className="pt-20">
        <Hero />
        <About />
        <Packages />
        <Calculator />
        <Referrals />
        <Ranks />
        <Terms />
        <Faq />
      </main>
      <Footer />
    </div>
  );
}