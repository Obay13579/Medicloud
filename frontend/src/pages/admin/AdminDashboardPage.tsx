import { useEffect, useState } from 'react';
import { appointmentService } from '@/services/appointmentService';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function AdminDashboardPage() {
  const [appointments, setAppointments] = useState([]);
  const { user } = useAuthStore();
  const tenant = user?.tenantId;

  useEffect(() => {
    if (tenant) loadTodayAppointments();
  }, [tenant]);

  const loadTodayAppointments = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const { data } = await appointmentService.getAll(tenant, { date: today });
      setAppointments(data);
    } catch (error) {
      console.error('Failed to load appointments', error);
    }
  };

  const handleCheckIn = async (id: string) => {
    try {
      await appointmentService.update(tenant, id, { status: 'CHECKED_IN' });
      loadTodayAppointments();
    } catch (error) {
      alert('Failed to check in');
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Today's Appointments</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{appointments.length}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Today's Queue</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {appointments.map((apt: any) => (
              <div key={apt.id} className="flex justify-between items-center p-3 border rounded">
                <div>
                  <p className="font-semibold">{apt.patient?.name}</p>
                  <p className="text-sm text-gray-600">{apt.timeSlot}</p>
                </div>
                <Button onClick={() => handleCheckIn(apt.id)}>
                  Check In
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}