import { Navbar } from '@/features/landing/Navbar';
import { HeroSection } from '@/features/landing/HeroSection';
import { FeaturesSection } from '@/features/landing/FeaturesSection';
import { Footer } from '@/features/landing/Footer';

export function LandingPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <Footer />
    </div>
  );
}