// frontend/src/pages/admin/AdminDashboardPage.tsx
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import api from '@/lib/api';
import { Stethoscope, Users, CalendarPlus, Clock } from 'lucide-react';

// Tipe data untuk appointment, sesuaikan dengan response API Anda
interface Appointment {
  id: string;
  patient: { name: string };
  doctor: { name: string };
  timeSlot: string;
  status: 'SCHEDULED' | 'CHECKED_IN' | 'IN_PROGRESS' | 'COMPLETED';
}

interface Stats {
    doctors: number;
    patients: number;
    newBookings: number;
    todaySessions: number;
}

export default function AdminDashboardPage() {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [stats, setStats] = useState<Stats>({ doctors: 1, patients: 0, newBookings: 0, todaySessions: 0 });
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setIsLoading(true);
                const today = new Date().toISOString().split('T')[0];
                const response = await api.get(`/api/appointments?date=${today}`);
                const data: Appointment[] = response.data;

                // Hitung statistik
                const patientSet = new Set(data.map(apt => apt.patient.name));
                const doctorSet = new Set(data.map(apt => apt.doctor.name));
                
                setStats({
                    doctors: doctorSet.size || 1, // Asumsi minimal 1 dokter
                    patients: patientSet.size,
                    newBookings: data.filter(apt => apt.status === 'SCHEDULED').length,
                    todaySessions: data.length,
                });

                setAppointments(data);
            } catch (error) {
                console.error("Failed to fetch dashboard data:", error);
                toast({ title: "Error", description: "Gagal memuat data dashboard.", variant: "destructive" });
            } finally {
                setIsLoading(false);
            }
        };

        fetchDashboardData();
    }, [toast]);
    
    const handleCheckIn = async (appointmentId: string) => {
        try {
            await api.patch(`/api/appointments/${appointmentId}`, { status: 'CHECKED_IN' });
            // Refresh data atau update state secara lokal
            setAppointments(prev => 
                prev.map(apt => apt.id === appointmentId ? { ...apt, status: 'CHECKED_IN' } : apt)
            );
            toast({ title: "Success", description: "Patient has been checked in." });
        } catch (error) {
            toast({ title: "Error", description: "Failed to check in patient.", variant: "destructive"});
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Total Doctors</CardTitle><Stethoscope className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{stats.doctors}</div></CardContent></Card>
                <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Total Patients (Today)</CardTitle><Users className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{stats.patients}</div></CardContent></Card>
                <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Scheduled</CardTitle><CalendarPlus className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{stats.newBookings}</div></CardContent></Card>
                <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Total Appointments</CardTitle><Clock className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{stats.todaySessions}</div></CardContent></Card>
            </div>

            {/* Today's Queue Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Today's Patient Queue</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Patient Name</TableHead>
                                <TableHead>Doctor</TableHead>
                                <TableHead>Time</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow><TableCell colSpan={5} className="text-center">Loading...</TableCell></TableRow>
                            ) : appointments.length > 0 ? (
                                appointments.map((apt) => (
                                    <TableRow key={apt.id}>
                                        <TableCell>{apt.patient.name}</TableCell>
                                        <TableCell>{apt.doctor.name}</TableCell>
                                        <TableCell>{apt.timeSlot}</TableCell>
                                        <TableCell>{apt.status}</TableCell>
                                        <TableCell>
                                            {apt.status === 'SCHEDULED' && (
                                                <Button size="sm" onClick={() => handleCheckIn(apt.id)}>Check-in</Button>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow><TableCell colSpan={5} className="text-center">No appointments for today.</TableCell></TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}