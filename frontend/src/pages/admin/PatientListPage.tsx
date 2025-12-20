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

// Tipe data untuk Patient, sesuaikan dengan schema.prisma
export interface Patient {
  id: string;
  name: string;
  phone: string;
  dob: string; // ISO string date format "YYYY-MM-DD"
  gender: 'Male' | 'Female';
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

  // --- FUNGSI BARU UNTUK MENGAMBIL DATA ---
  const fetchPatients = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/api/patients');
      // Pastikan dob diformat sebagai YYYY-MM-DD
      const formattedData = response.data.map((p: Patient) => ({
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
  }, [toast]);

  // useEffect sekarang memanggil fungsi fetchPatients
  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  const handleFormSubmit = async (data: PatientFormData) => {
    setIsSubmitting(true);
    try {
      if (editingPatient) {
        // --- LOGIKA EDIT (PATCH) ---
        await api.patch(`/api/patients/${editingPatient.id}`, data);
        toast({ title: "Berhasil", description: "Data pasien berhasil diperbarui." });
      } else {
        // --- LOGIKA ADD (POST) ---
        await api.post('/api/patients', data);
        toast({ title: "Berhasil", description: "Pasien baru berhasil ditambahkan." });
      }
      setIsModalOpen(false);
      setEditingPatient(null);
      await fetchPatients(); // Ambil data terbaru setelah submit
    } catch (error) {
      console.error("Failed to submit patient form:", error);
      toast({ title: "Error", description: "Gagal menyimpan data pasien.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const openAddModal = () => {
    setEditingPatient(null);
    setIsModalOpen(true);
  };

  const openEditModal = (patient: Patient) => {
    setEditingPatient(patient);
    setIsModalOpen(true);
  };

  const openDeleteDialog = (patientId: string) => {
    setDeletingPatientId(patientId);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (deletingPatientId) {
      try {
        // --- LOGIKA DELETE ---
        await api.delete(`/api/patients/${deletingPatientId}`);
        toast({ title: "Berhasil", description: "Data pasien telah dihapus." });
        // Optimistic update: hapus dari state tanpa perlu fetch ulang
        setPatients(prev => prev.filter(p => p.id !== deletingPatientId));
      } catch (error) {
        console.error("Failed to delete patient:", error);
        toast({ title: "Error", description: "Gagal menghapus data pasien.", variant: "destructive" });
      } finally {
        setIsDeleteDialogOpen(false);
        setDeletingPatientId(null);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Patient Management</h1>
        <Button onClick={openAddModal}>
          <PlusCircle className="mr-2 h-4 w-4" /> Add Patient
        </Button>
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