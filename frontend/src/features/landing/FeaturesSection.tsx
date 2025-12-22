import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Stethoscope, Calendar, Pill, BarChart2 } from "lucide-react";

const features = [
  {
    icon: <Stethoscope className="w-10 h-10 text-blue-600" />,
    title: "Electronic Medical Record (EMR)",
    description: "Rekam medis digital yang aman, terpusat, dan mudah diakses.",
  },
  {
    icon: <Calendar className="w-10 h-10 text-blue-600" />,
    title: "Manajemen Janji Temu",
    description: "Atur jadwal dokter dan pasien dengan efisien tanpa tumpang tindih.",
  },
  {
    icon: <Pill className="w-10 h-10 text-blue-600" />,
    title: "Integrasi Apotek",
    description: "Manajemen resep dan inventaris obat langsung dari sistem.",
  },
  {
    icon: <BarChart2 className="w-10 h-10 text-blue-600" />,
    title: "Billing & Analytics",
    description: "Laporan keuangan dan analisis performa klinik dalam satu dashboard.",
  },
];

export const FeaturesSection = () => {
  return (
    <section id="features" className="py-20 bg-white">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-800">Satu Platform, Semua Kebutuhan Klinik</h2>
          <p className="text-gray-600 mt-2">Semua yang Anda butuhkan untuk menjalankan klinik modern.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="text-center p-6 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="items-center">
                {feature.icon}
                <CardTitle className="mt-4">{feature.title}</CardTitle>
                <CardDescription className="mt-2">{feature.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};