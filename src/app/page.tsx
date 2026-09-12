import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { About } from "@/components/landing/About";
import { Packages } from "@/components/landing/Packages";
import { Calculator } from "@/components/landing/Calculator";
import { Referrals } from "@/components/landing/Referrals";
import { Terms } from "@/components/landing/Terms";
import { Footer } from "@/components/landing/Footer";

export default function HomePage() {
  return (
    <div className="relative min-h-screen bg-[#030712] text-slate-100 overflow-hidden">
      <div className="bg-glow-gold -top-40 -right-40" />
      <div className="bg-glow-blue -bottom-40 -left-40" />

      <Navbar />
      <Hero />
      <About />
      <Packages />
      <Calculator />
      <Referrals />
      <Terms />
      <Footer />
    </div>
  );
}