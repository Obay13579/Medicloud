// frontend/src/pages/pharmacy/PharmacyQueuePage.tsx

import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { PlusCircle } from 'lucide-react';
import api from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';

// --- Type Definitions ---
interface PrescriptionItem { drugName: string; dosage: string; frequency: string; }
interface Prescription {
  id: string;
  status: string;
  items: PrescriptionItem[];
  record: {
    visitDate: string;
    patient: { name: string; };
    doctor: { name: string; };
  };
}
interface Drug { id: string; name: string; stock: number; unit: string; }

export default function PharmacyQueuePage() {
  const { user } = useAuthStore();
  const tenantSlug = user?.tenant?.slug;
  const { toast } = useToast();

  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [inventory, setInventory] = useState<Drug[]>([]);
  const [isLoadingQueue, setIsLoadingQueue] = useState(true);
  const [isLoadingInventory, setIsLoadingInventory] = useState(true);
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);

  const fetchPrescriptions = useCallback(async () => {
    if (!tenantSlug) return;
    setIsLoadingQueue(true);
    try {
      const response = await api.get(`/api/${tenantSlug}/prescriptions?status=PENDING`);
      setPrescriptions(response.data);
    } catch (error) {
      toast({ title: "Error", description: "Gagal memuat antrian resep.", variant: "destructive" });
    } finally {
      setIsLoadingQueue(false);
    }
  }, [tenantSlug, toast]);

  const fetchInventory = useCallback(async () => {
    if (!tenantSlug) return;
    setIsLoadingInventory(true);
    try {
      const response = await api.get(`/api/${tenantSlug}/inventory`);
      setInventory(response.data);
    } catch (error) {
      toast({ title: "Error", description: "Gagal memuat data inventaris.", variant: "destructive" });
    } finally {
      setIsLoadingInventory(false);
    }
  }, [tenantSlug, toast]);

  useEffect(() => {
    fetchPrescriptions();
    fetchInventory();
  }, [fetchPrescriptions, fetchInventory]);

  const handleUpdateStatus = async (prescriptionId: string, status: 'PROCESSING' | 'COMPLETED') => {
    if (!tenantSlug) return;
    try {
      await api.patch(`/api/${tenantSlug}/prescriptions/${prescriptionId}`, { status });
      toast({ title: "Success", description: `Resep telah ditandai sebagai ${status.toLowerCase()}.` });
      setSelectedPrescription(null);
      await fetchPrescriptions(); // Refresh list
    } catch (error) {
      toast({ title: "Error", description: "Gagal memperbarui status resep.", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Pharmacy Dashboard</h1>

      <Tabs defaultValue="queue">
        <TabsList>
          <TabsTrigger value="queue">Prescription Queue</TabsTrigger>
          <TabsTrigger value="inventory">Inventory Management</TabsTrigger>
        </TabsList>
        
        <TabsContent value="queue" className="mt-4">
          <Card>
            <CardHeader><CardTitle>Pending Prescriptions</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader><TableRow><TableHead>Patient Name</TableHead><TableHead>Doctor</TableHead><TableHead>Date</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
                <TableBody>
                  {isLoadingQueue ? (<TableRow><TableCell colSpan={4} className="text-center">Loading queue...</TableCell></TableRow>)
                    : prescriptions.length === 0 ? (<TableRow><TableCell colSpan={4} className="text-center">No pending prescriptions.</TableCell></TableRow>)
                    : prescriptions.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell>{p.record.patient.name}</TableCell>
                        <TableCell>{p.record.doctor.name}</TableCell>
                        <TableCell>{format(new Date(p.record.visitDate), "dd MMM yyyy")}</TableCell>
                        <TableCell>
                          <Button size="sm" onClick={() => setSelectedPrescription(p)}>View Details</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inventory" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Drug Inventory</CardTitle>
              {/* Fitur Add Drug bisa ditambahkan di sini dengan modal baru */}
              <Button size="sm"><PlusCircle className="mr-2 h-4 w-4"/>Add Drug</Button>
            </CardHeader>
            <CardContent>
               <Table>
                <TableHeader><TableRow><TableHead>Drug Name</TableHead><TableHead>Stock</TableHead><TableHead>Unit</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
                <TableBody>
                  {isLoadingInventory ? (<TableRow><TableCell colSpan={4} className="text-center">Loading inventory...</TableCell></TableRow>)
                    : inventory.map((drug) => (
                      <TableRow key={drug.id}>
                        <TableCell>{drug.name}</TableCell>
                        <TableCell>{drug.stock}</TableCell>
                        <TableCell>{drug.unit}</TableCell>
                        <TableCell>
                          <Button size="sm" variant="outline">Update Stock</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Prescription Detail Modal */}
      <Dialog open={!!selectedPrescription} onOpenChange={() => setSelectedPrescription(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Prescription Details</DialogTitle>
            <DialogDescription>Patient: {selectedPrescription?.record.patient.name} - {format(new Date(selectedPrescription?.record.visitDate || new Date()), "dd MMM yyyy")}</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Table>
              <TableHeader><TableRow><TableHead>Drug</TableHead><TableHead>Dosage</TableHead><TableHead>Frequency</TableHead></TableRow></TableHeader>
              <TableBody>
                {selectedPrescription?.items.map((item, index) => (
                  <TableRow key={index}><TableCell>{item.drugName}</TableCell><TableCell>{item.dosage}</TableCell><TableCell>{item.frequency}</TableCell></TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <DialogFooter className="sm:justify-between">
            <div>
              <Button variant="destructive" onClick={() => setSelectedPrescription(null)}>Close</Button>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => handleUpdateStatus(selectedPrescription!.id, 'PROCESSING')}>Mark as Processing</Button>
              <Button onClick={() => handleUpdateStatus(selectedPrescription!.id, 'COMPLETED')}>Mark as Completed</Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}