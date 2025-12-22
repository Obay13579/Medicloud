import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { appointmentService } from '@/services/appointmentService';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function DoctorQueuePage() {
  const [appointments, setAppointments] = useState([]);
  const { user } = useAuthStore();
  const tenant = user?.tenantId;
  const navigate = useNavigate();

  useEffect(() => {
    if (tenant) loadQueue();
  }, [tenant]);

  const loadQueue = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const { data } = await appointmentService.getAll(tenant, {
        doctorId: user.id,
        date: today,
      });
      setAppointments(data);
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

      <div className="grid gap-4">
        {appointments.map((apt: any) => (
          <Card key={apt.id}>
            <CardContent className="flex justify-between items-center p-6">
              <div>
                <h3 className="text-xl font-semibold">{apt.patient?.name}</h3>
                <p className="text-gray-600">Time: {apt.timeSlot}</p>
                <Badge className="mt-2">{apt.status}</Badge>
              </div>
              <Button onClick={() => handleCallPatient(apt.id)}>
                Start Consultation
              </Button>
            </CardContent>
          </Card>
        ))}

        {appointments.length === 0 && (
          <p className="text-center text-gray-500 py-8">No patients in queue</p>
        )}
      </div>
    </div>
  );
}