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

  // Fetch patients and doctors
  const fetchDependencies = useCallback(async () => {
    if (!tenantSlug) return;
    try {
      const [patientsRes, doctorsRes] = await Promise.all([
        api.get(`/api/${tenantSlug}/patients`),
        api.get(`/api/${tenantSlug}/users?role=DOCTOR`)
      ]);
      setPatients(patientsRes.data.data || patientsRes.data || []);
      setDoctors(doctorsRes.data.data || doctorsRes.data || []);
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
      const data = response.data.data || response.data || [];
      setAppointments(data);
    } catch (error) {
      toast({ title: "Error", description: "Gagal memuat data janji temu.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [filters, toast, tenantSlug]);

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

      <Card>
        <CardHeader><CardTitle>Filters</CardTitle></CardHeader>
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
        <CardHeader><CardTitle>Appointment List</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>Patient</TableHead><TableHead>Doctor</TableHead><TableHead>Date</TableHead><TableHead>Time</TableHead><TableHead>Status</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
            <TableBody>
              {isLoading ? (<TableRow><TableCell colSpan={6} className="text-center">Loading...</TableCell></TableRow>)
                : appointments.length === 0 ? (<TableRow><TableCell colSpan={6} className="text-center">No appointments found.</TableCell></TableRow>)
                  : appointments.map((apt) => (
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
                  ))}
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