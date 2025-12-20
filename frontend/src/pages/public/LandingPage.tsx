import { Navbar } from "@/features/landing/Navbar";
import { HeroSection } from "@/features/landing/HeroSection";
import { FeaturesSection } from "@/features/landing/FeaturesSection";
import { Footer } from "@/features/landing/Footer";

const LandingPage = () => {
  return (
    <div className="bg-gray-50 min-h-screen">
      <Navbar />
      <main>
        <HeroSection />
        <FeaturesSection />
      </main>
      <Footer />
    </div>
  );
};

export default LandingPage;