import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export const HeroSection = () => {
  return (
    <section className="bg-blue-50 py-20">
      <div className="container mx-auto px-6 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight">
          Modernkan Klinik Anda dengan Biaya Terjangkau
        </h1>
        <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
          MediCloud memungkinkan klinik kecil-menengah untuk beroperasi se-profesional rumah sakit besar, dengan biaya 90% lebih murah.
        </p>
        <div className="mt-8">
          <Link to="/login">
            <Button size="lg" className="text-lg">Mulai Sekarang</Button>
          </Link>
        </div>
      </div>
    </section>
  );
};