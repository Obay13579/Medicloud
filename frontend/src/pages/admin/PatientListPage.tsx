// frontend/src/pages/admin/PatientListPage.tsx
import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { PatientForm, type PatientFormData } from '@/features/patients/PatientForm';
import { PlusCircle } from 'lucide-react';
import api from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';

// Tipe data untuk Patient, sesuaikan dengan schema.prisma
export interface Patient {
  id: string;
  name: string;
  phone: string;
  dob: string; // ISO string date format "YYYY-MM-DD"
  gender: 'MALE' | 'FEMALE';
}

export default function PatientListPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingPatientId, setDeletingPatientId] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuthStore();

  // Get tenant slug from authenticated user
  const tenantSlug = user?.tenant?.slug;

  // --- FUNGSI BARU UNTUK MENGAMBIL DATA ---
  const fetchPatients = useCallback(async () => {
    if (!tenantSlug) return;

    setIsLoading(true);
    try {
      const response = await api.get(`/api/${tenantSlug}/patients`);
      // Pastikan dob diformat sebagai YYYY-MM-DD
      const data = response.data.data || response.data || [];
      const formattedData = data.map((p: Patient) => ({
        ...p,
        dob: new Date(p.dob).toISOString().split('T')[0]
      }));
      setPatients(formattedData);
    } catch (error) {
      console.error("Failed to fetch patients:", error);
      toast({ title: "Error", description: "Gagal memuat data pasien.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [toast, tenantSlug]);

  // useEffect sekarang memanggil fungsi fetchPatients
  useEffect(() => {
    if (tenant) loadPatients();
  }, [tenant]);

  const loadPatients = async () => {
    try {
      if (!tenantSlug) return;

      if (editingPatient) {
        // --- LOGIKA EDIT (PATCH) ---
        await api.patch(`/api/${tenantSlug}/patients/${editingPatient.id}`, data);
        toast({ title: "Berhasil", description: "Data pasien berhasil diperbarui." });
      } else {
        // --- LOGIKA ADD (POST) ---
        await api.post(`/api/${tenantSlug}/patients`, data);
        toast({ title: "Berhasil", description: "Pasien baru berhasil ditambahkan." });
      }
      setIsModalOpen(false);
      setEditingPatient(null);
      await fetchPatients(); // Ambil data terbaru setelah submit
    } catch (error) {
      console.error('Failed to load patients', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete patient?')) {
      try {
        if (!tenantSlug) return;
        // --- LOGIKA DELETE ---
        await api.delete(`/api/${tenantSlug}/patients/${deletingPatientId}`);
        toast({ title: "Berhasil", description: "Data pasien telah dihapus." });
        // Optimistic update: hapus dari state tanpa perlu fetch ulang
        setPatients(prev => prev.filter(p => p.id !== deletingPatientId));
      } catch (error) {
        alert('Failed to delete patient');
      }
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Patient List</h1>
        <Button>Add Patient</Button>
      </div>

      <Card>
        <CardHeader><CardTitle>Patient List</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Phone</TableHead><TableHead>Date of Birth</TableHead><TableHead>Gender</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
            <TableBody>
              {isLoading ? (<TableRow><TableCell colSpan={5} className="text-center">Loading...</TableCell></TableRow>)
                : patients.length === 0 ? (<TableRow><TableCell colSpan={5} className="text-center">No patient data found.</TableCell></TableRow>)
                  : patients.map((patient) => (
                    <TableRow key={patient.id}>
                      <TableCell className="font-medium">{patient.name}</TableCell>
                      <TableCell>{patient.phone}</TableCell>
                      <TableCell>{patient.dob}</TableCell>
                      <TableCell>{patient.gender}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" onClick={() => openEditModal(patient)}>Edit</Button>
                          <Button variant="destructive" size="sm" onClick={() => openDeleteDialog(patient.id)}>Delete</Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Modal untuk Add/Edit Patient */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader><DialogTitle>{editingPatient ? 'Edit Patient' : 'Add New Patient'}</DialogTitle></DialogHeader>
          <PatientForm onSubmit={handleFormSubmit} initialData={editingPatient || undefined} isSubmitting={isSubmitting} />
        </DialogContent>
      </Dialog>

      {/* Dialog Konfirmasi Hapus */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>This action cannot be undone. This will permanently delete the patient record.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}