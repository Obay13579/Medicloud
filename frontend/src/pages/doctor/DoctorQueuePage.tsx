import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { appointmentService } from '@/services/appointmentService';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function DoctorQueuePage() {
  const [appointments, setAppointments] = useState([]);
  const { user } = useAuthStore();
  const tenant = user?.tenantId;
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
    if (tenant) loadQueue();
  }, [tenant]);

  const loadQueue = async () => {
    try {
      // Memanggil endpoint PATCH untuk update status
      await api.patch(`/api/${tenantSlug}/appointments/${appointmentId}`, { status: 'IN_PROGRESS' });
      toast({ title: "Success", description: "Consultation started." });

      // Navigasi ke Halaman EMR setelah berhasil
      navigate(`/doctor/emr/${appointmentId}/${patientId}`);
    } catch (error) {
      console.error('Failed to load queue', error);
    }
  };

  const handleCallPatient = async (id: string) => {
    try {
      await appointmentService.update(tenant, id, { status: 'IN_PROGRESS' });
      navigate(`/doctor/emr/${id}`);
    } catch (error) {
      alert('Failed to call patient');
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Today's Queue</h1>

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