// frontend/src/pages/admin/AppointmentListPage.tsx

import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Calendar as CalendarIcon, PlusCircle } from "lucide-react";

import { AppointmentForm, type AppointmentFormData } from '@/features/appointments/AppointmentForm';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import api from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';

// Tipe data dari API
interface Patient { id: string; name: string; }
interface Doctor { id: string; name: string; }
interface Appointment {
  id: string;
  patient: Patient;
  doctor: Doctor;
  date: string;
  timeSlot: string;
  status: string;
}

export default function AppointmentListPage() {
  const { user } = useAuthStore();
  const tenantSlug = user?.tenant?.slug;

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [filters, setFilters] = useState<{ date: Date | undefined, doctorId: string }>({ date: new Date(), doctorId: 'all' });
  
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingAppointmentId, setDeletingAppointmentId] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchDependencies = useCallback(async () => {
    if (!tenantSlug) return;
    try {
      const [patientsRes, doctorsRes] = await Promise.all([
        api.get(`/api/${tenantSlug}/patients`),
        api.get(`/api/${tenantSlug}/users?role=DOCTOR`)
      ]);
      setPatients(patientsRes.data);
      setDoctors(doctorsRes.data);
    } catch (error) {
      toast({ title: "Error", description: "Gagal memuat data pasien/dokter.", variant: "destructive" });
    }
  }, [toast, tenantSlug]);

  const fetchAppointments = useCallback(async () => {
    if (!tenantSlug) return;
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.date) params.append('date', format(filters.date, 'yyyy-MM-dd'));
      if (filters.doctorId !== 'all') params.append('doctorId', filters.doctorId);
      
      const response = await api.get(`/api/${tenantSlug}/appointments?${params.toString()}`);
      setAppointments(response.data);
    } catch (error) {
      toast({ title: "Error", description: "Gagal memuat data janji temu.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [filters, toast, tenantSlug]);

  useEffect(() => {
    fetchDependencies();
  }, [fetchDependencies]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const handleFormSubmit = async (data: AppointmentFormData) => {
    if (!tenantSlug) return;
    setIsSubmitting(true);
    const payload = { ...data, date: format(data.date, 'yyyy-MM-dd') };
    try {
      if (editingAppointment) {
        await api.patch(`/api/${tenantSlug}/appointments/${editingAppointment.id}`, payload);
        toast({ title: "Berhasil", description: "Janji temu berhasil diperbarui." });
      } else {
        await api.post(`/api/${tenantSlug}/appointments`, payload);
        toast({ title: "Berhasil", description: "Janji temu baru berhasil dibuat." });
      }
      setIsModalOpen(false);
      setEditingAppointment(null);
      await fetchAppointments();
    } catch (error) {
      toast({ title: "Error", description: "Gagal menyimpan janji temu.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (deletingAppointmentId && tenantSlug) {
      try {
        await api.delete(`/api/${tenantSlug}/appointments/${deletingAppointmentId}`);
        toast({ title: "Berhasil", description: "Janji temu telah dibatalkan." });
        setAppointments(prev => prev.filter(p => p.id !== deletingAppointmentId));
      } catch (error) {
        toast({ title: "Error", description: "Gagal membatalkan janji temu.", variant: "destructive" });
      } finally {
        setIsDeleteDialogOpen(false);
        setDeletingAppointmentId(null);
      }
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Appointment Management</h1>
        <Button onClick={() => { setEditingAppointment(null); setIsModalOpen(true); }}>
          <PlusCircle className="mr-2 h-4 w-4" /> Add Appointment
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filter Appointments</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center gap-4">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant={"outline"} className={cn("w-[280px] justify-start text-left font-normal", !filters.date && "text-muted-foreground")}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filters.date ? format(filters.date, "PPP") : <span>Pilih tanggal</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={filters.date} onSelect={(date) => setFilters(f => ({ ...f, date }))} initialFocus /></PopoverContent>
            </Popover>
            <Select value={filters.doctorId} onValueChange={(id) => setFilters(f => ({ ...f, doctorId: id }))}>
              <SelectTrigger className="w-[280px]"><SelectValue placeholder="Filter by Doctor" /></SelectTrigger>
              <SelectContent>
                  <SelectItem value="all">All Doctors</SelectItem>
                  {doctors.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
              </SelectContent>
            </Select>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Appointment List</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>Patient</TableHead><TableHead>Doctor</TableHead><TableHead>Date</TableHead><TableHead>Time</TableHead><TableHead>Status</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={6} className="text-center">Loading appointments...</TableCell></TableRow>
              ) : appointments.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center">No appointments found for the selected filter.</TableCell></TableRow>
              ) : (
                appointments.map((apt) => (
                  <TableRow key={apt.id}>
                    <TableCell>{apt.patient.name}</TableCell>
                    <TableCell>{apt.doctor.name}</TableCell>
                    <TableCell>{format(new Date(apt.date), "dd MMM yyyy")}</TableCell>
                    <TableCell>{apt.timeSlot}</TableCell>
                    <TableCell>{apt.status}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" onClick={() => { setEditingAppointment(apt); setIsModalOpen(true); }}>Edit</Button>
                          <Button variant="destructive" size="sm" onClick={() => { setDeletingAppointmentId(apt.id); setIsDeleteDialogOpen(true); }}>Cancel</Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent><DialogHeader><DialogTitle>{editingAppointment ? 'Edit Appointment' : 'Add New Appointment'}</DialogTitle></DialogHeader>
          <AppointmentForm 
            onSubmit={handleFormSubmit}
            initialData={editingAppointment ? { ...editingAppointment, date: new Date(editingAppointment.date) } : undefined}
            isSubmitting={isSubmitting} 
            patients={patients} 
            doctors={doctors} 
          />
        </DialogContent>
      </Dialog>
      
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>This will permanently cancel the appointment.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Close</AlertDialogCancel><AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">Continue</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}