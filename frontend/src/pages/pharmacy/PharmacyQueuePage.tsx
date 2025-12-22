// frontend/src/pages/pharmacy/PharmacyQueuePage.tsx

import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

  // State untuk Add Drug Modal
  const [isAddDrugModalOpen, setIsAddDrugModalOpen] = useState(false);
  const [newDrug, setNewDrug] = useState({ name: '', stock: '', unit: '' });

  // State untuk Update Stock Modal
  const [isUpdateStockModalOpen, setIsUpdateStockModalOpen] = useState(false);
  const [selectedDrug, setSelectedDrug] = useState<Drug | null>(null);
  const [newStockAmount, setNewStockAmount] = useState('');

  const fetchPrescriptions = useCallback(async () => {
    if (!tenantSlug) return;
    setIsLoadingQueue(true);
    try {
      // Fetch all prescriptions and filter out COMPLETED ones
      const response = await api.get(`/api/${tenantSlug}/prescriptions`);
      const data = response.data.data || response.data || [];
      // Filter to show only active prescriptions (PENDING and PROCESSING)
      const activePrescriptions = data.filter((p: Prescription) =>
        p.status === 'PENDING' || p.status === 'PROCESSING'
      );
      setPrescriptions(activePrescriptions);
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
      setInventory(response.data.data || response.data || []);
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

  // Handler untuk Add Drug
  const handleAddDrug = async () => {
    if (!newDrug.name || !newDrug.stock || !newDrug.unit) {
      toast({ title: "Error", description: "Semua field harus diisi.", variant: "destructive" });
      return;
    }

    if (!tenantSlug) return;
    try {
      // Convert stock to number before sending
      const payload = {
        name: newDrug.name,
        stock: parseInt(newDrug.stock, 10),
        unit: newDrug.unit,
      };
      await api.post(`/api/${tenantSlug}/inventory`, payload);
      toast({ title: "Success", description: "Obat baru berhasil ditambahkan." });
      setIsAddDrugModalOpen(false);
      setNewDrug({ name: '', stock: '', unit: '' });
      await fetchInventory();
    } catch (error) {
      toast({ title: "Error", description: "Gagal menambahkan obat.", variant: "destructive" });
    }
  };

  // Handler untuk Update Stock
  const handleUpdateStock = async () => {
    if (!selectedDrug || !newStockAmount) {
      toast({ title: "Error", description: "Jumlah stock harus diisi.", variant: "destructive" });
      return;
    }

    if (!tenantSlug) return;
    try {
      await api.patch(`/api/${tenantSlug}/inventory/${selectedDrug.id}`, { stock: parseInt(newStockAmount) });
      toast({ title: "Success", description: `Stock ${selectedDrug.name} berhasil diperbarui.` });
      setIsUpdateStockModalOpen(false);
      setSelectedDrug(null);
      setNewStockAmount('');
      await fetchInventory();
    } catch (error) {
      toast({ title: "Error", description: "Gagal memperbarui stock.", variant: "destructive" });
    }
  };

  // Open Update Stock Modal
  const openUpdateStockModal = (drug: Drug) => {
    setSelectedDrug(drug);
    setNewStockAmount(drug.stock.toString());
    setIsUpdateStockModalOpen(true);
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
            <CardHeader><CardTitle>Active Prescriptions</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader><TableRow><TableHead>Patient Name</TableHead><TableHead>Doctor</TableHead><TableHead>Date</TableHead><TableHead>Status</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
                <TableBody>
                  {isLoadingQueue ? (<TableRow><TableCell colSpan={5} className="text-center">Loading queue...</TableCell></TableRow>)
                    : prescriptions.length === 0 ? (<TableRow><TableCell colSpan={5} className="text-center">No active prescriptions.</TableCell></TableRow>)
                      : prescriptions.map((p) => (
                        <TableRow key={p.id}>
                          <TableCell>{p.record.patient.name}</TableCell>
                          <TableCell>{p.record.doctor.name}</TableCell>
                          <TableCell>{format(new Date(p.record.visitDate), "dd MMM yyyy")}</TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${p.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'
                              }`}>
                              {p.status}
                            </span>
                          </TableCell>
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
              <Button size="sm" onClick={() => setIsAddDrugModalOpen(true)}><PlusCircle className="mr-2 h-4 w-4" />Add Drug</Button>
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
                          <Button size="sm" variant="outline" onClick={() => openUpdateStockModal(drug)}>Update Stock</Button>
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
            <DialogDescription>
              Patient: {selectedPrescription?.record.patient.name} - {format(new Date(selectedPrescription?.record.visitDate || new Date()), "dd MMM yyyy")}
              <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${selectedPrescription?.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'
                }`}>
                {selectedPrescription?.status}
              </span>
            </DialogDescription>
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
              <Button variant="outline" onClick={() => setSelectedPrescription(null)}>Close</Button>
            </div>
            <div className="flex gap-2">
              {selectedPrescription?.status === 'PENDING' && (
                <Button variant="secondary" onClick={() => handleUpdateStatus(selectedPrescription!.id, 'PROCESSING')}>
                  Start Processing
                </Button>
              )}
              <Button onClick={() => handleUpdateStatus(selectedPrescription!.id, 'COMPLETED')}>
                Mark as Completed
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Drug Modal */}
      <Dialog open={isAddDrugModalOpen} onOpenChange={setIsAddDrugModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Drug</DialogTitle>
            <DialogDescription>Tambahkan obat baru ke inventaris.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="drugName">Drug Name</Label>
              <Input
                id="drugName"
                placeholder="e.g. Paracetamol 500mg"
                value={newDrug.name}
                onChange={(e) => setNewDrug(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="stock">Initial Stock</Label>
              <Input
                id="stock"
                type="number"
                placeholder="e.g. 100"
                value={newDrug.stock}
                onChange={(e) => setNewDrug(prev => ({ ...prev, stock: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="unit">Unit</Label>
              <Input
                id="unit"
                placeholder="e.g. Tablet, Kapsul, Botol"
                value={newDrug.unit}
                onChange={(e) => setNewDrug(prev => ({ ...prev, unit: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDrugModalOpen(false)}>Cancel</Button>
            <Button onClick={handleAddDrug}>Add Drug</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Update Stock Modal */}
      <Dialog open={isUpdateStockModalOpen} onOpenChange={setIsUpdateStockModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Update Stock</DialogTitle>
            <DialogDescription>Update stock untuk: {selectedDrug?.name}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="currentStock">Current Stock</Label>
              <Input id="currentStock" value={selectedDrug?.stock || 0} disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newStock">New Stock Amount</Label>
              <Input
                id="newStock"
                type="number"
                placeholder="Enter new stock amount"
                value={newStockAmount}
                onChange={(e) => setNewStockAmount(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUpdateStockModalOpen(false)}>Cancel</Button>
            <Button onClick={handleUpdateStock}>Update Stock</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}