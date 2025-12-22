import { useEffect, useState } from 'react';
import { appointmentService } from '@/services/appointmentService';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';

export function AppointmentListPage() {
  const [appointments, setAppointments] = useState([]);
  const [filterDate, setFilterDate] = useState('');
  const { user } = useAuthStore();
  const tenant = user?.tenantId;

  useEffect(() => {
    if (tenant) loadAppointments();
  }, [tenant, filterDate]);

  const loadAppointments = async () => {
    try {
      const params = filterDate ? { date: filterDate } : {};
      const { data } = await appointmentService.getAll(tenant, params);
      setAppointments(data);
    } catch (error) {
      console.error('Failed to load appointments', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Cancel this appointment?')) {
      try {
        await appointmentService.delete(tenant, id);
        loadAppointments();
      } catch (error) {
        alert('Failed to cancel appointment');
      }
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Appointment List</h1>
        <div className="flex gap-3">
          <Input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="w-48"
          />
          <Button>Add Appointment</Button>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Patient Name</TableHead>
            <TableHead>Doctor</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Time</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {appointments.map((apt: any) => (
            <TableRow key={apt.id}>
              <TableCell>{apt.patient?.name}</TableCell>
              <TableCell>{apt.doctor?.name}</TableCell>
              <TableCell>{apt.date}</TableCell>
              <TableCell>{apt.timeSlot}</TableCell>
              <TableCell>{apt.status}</TableCell>
              <TableCell>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(apt.id)}
                >
                  Cancel
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}