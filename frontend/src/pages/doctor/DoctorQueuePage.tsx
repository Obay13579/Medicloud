// frontend/src/pages/doctor/DoctorQueuePage.tsx
import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import api from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';

// Tipe data dari API
interface Patient { id: string; name: string; }
interface Appointment {
  id: string;
  patient: Patient;
  timeSlot: string;
  status: string;
}

export default function DoctorQueuePage() {
  const { user } = useAuthStore();
  const tenantSlug = user?.tenant?.slug;
  const doctorId = user?.id; // Ini adalah {me} dari endpoint
  const navigate = useNavigate();
  const { toast } = useToast();

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchQueue = useCallback(async () => {
    if (!tenantSlug || !doctorId) return;

    setIsLoading(true);
    try {
      const today = format(new Date(), 'yyyy-MM-dd'); // Ini adalah &date=today
      const params = new URLSearchParams({
        doctorId: doctorId,
        date: today,
      });

      // Memanggil endpoint sesuai panduan
      const response = await api.get(`/api/${tenantSlug}/appointments?${params.toString()}`);
      const data = response.data.data || response.data || [];

      // Filter antrian yang relevan untuk dokter (misalnya yang belum selesai)
      const relevantQueue = data.filter((apt: Appointment) =>
        apt.status === 'CHECKED_IN' || apt.status === 'IN_PROGRESS'
      );
      setAppointments(relevantQueue);
    } catch (error) {
      toast({ title: "Error", description: "Gagal memuat antrian pasien.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [tenantSlug, doctorId, toast]);

  useEffect(() => {
    fetchQueue();
  }, [fetchQueue]);

  const handleStartConsultation = async (appointmentId: string, patientId: string) => {
    if (!tenantSlug) return;
    try {
      // Memanggil endpoint PATCH untuk update status
      await api.patch(`/api/${tenantSlug}/appointments/${appointmentId}`, { status: 'IN_PROGRESS' });
      toast({ title: "Success", description: "Consultation started." });

      // Navigasi ke Halaman EMR setelah berhasil
      navigate(`/doctor/emr/${appointmentId}/${patientId}`);
    } catch (error) {
      toast({ title: "Error", description: "Gagal memulai konsultasi.", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Today's Patient Queue</h1>
          <p className="text-muted-foreground">Patients ready for consultation.</p>
        </div>
        <p className="text-lg font-medium">Date: {format(new Date(), 'dd MMMM yyyy')}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Queue List</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>Patient Name</TableHead><TableHead>Time</TableHead><TableHead>Status</TableHead><TableHead>Action</TableHead></TableRow></TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={4} className="text-center">Loading queue...</TableCell></TableRow>
              ) : appointments.length === 0 ? (
                <TableRow><TableCell colSpan={4} className="text-center">No patients in the queue for today.</TableCell></TableRow>
              ) : (
                appointments.map((apt) => (
                  <TableRow key={apt.id}>
                    <TableCell className="font-medium">{apt.patient.name}</TableCell>
                    <TableCell>{apt.timeSlot}</TableCell>
                    <TableCell>{apt.status}</TableCell>
                    <TableCell>
                      {apt.status === 'IN_PROGRESS' ? (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => navigate(`/doctor/emr/${apt.id}/${apt.patient.id}`)}
                        >
                          Continue
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => handleStartConsultation(apt.id, apt.patient.id)}
                        >
                          Start Consultation
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}