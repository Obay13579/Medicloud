import { useEffect, useState } from 'react';
import { prescriptionService } from '@/services/prescriptionService';
import { inventoryService } from '@/services/inventoryService';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export function PharmacyQueuePage() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [selectedPrescription, setSelectedPrescription] = useState<any>(null);
  const { user } = useAuthStore();
  const tenant = user?.tenantId;

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

  const loadPrescriptions = async () => {
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
      console.error('Failed to load prescriptions', error);
    }
  };

  const loadInventory = async () => {
    try {
      const response = await api.get(`/api/${tenantSlug}/inventory`);
      setInventory(response.data.data || response.data || []);
    } catch (error) {
      console.error('Failed to load inventory', error);
    }
  };

  const handleViewPrescription = async (id: string) => {
    try {
      const { data } = await prescriptionService.getById(tenant, id);
      setSelectedPrescription(data);
    } catch (error) {
      alert('Failed to load prescription detail');
    }
  };

  const handleProcessPrescription = async (id: string) => {
    try {
      await prescriptionService.updateStatus(tenant, id, 'PROCESSING');
      loadPrescriptions();
    } catch (error) {
      alert('Failed to process prescription');
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
      alert('Failed to complete prescription');
    }
  };

  const handleAddDrug = async () => {
    if (!newDrug.name || !newDrug.stock) {
      alert('Please fill all fields');
      return;
    }

    if (!tenantSlug) return;
    try {
      await inventoryService.create(tenant, {
        name: newDrug.name,
        stock: parseInt(newDrug.stock),
      });
      setNewDrug({ name: '', stock: '' });
      loadInventory();
      alert('Drug added successfully');
    } catch (error) {
      alert('Failed to add drug');
    }
  };

  const handleUpdateStock = async (id: string, newStock: number) => {
    try {
      await inventoryService.updateStock(tenant, id, newStock);
      loadInventory();
    } catch (error) {
      alert('Failed to update stock');
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Pharmacy Dashboard</h1>

      <Tabs defaultValue="prescriptions">
        <TabsList>
          <TabsTrigger value="prescriptions">Prescriptions</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
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

          <Card>
            <CardHeader>
              <CardTitle>Drug Inventory</CardTitle>
              <Button size="sm" onClick={() => setIsAddDrugModalOpen(true)}><PlusCircle className="mr-2 h-4 w-4" />Add Drug</Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader><TableRow><TableHead>Drug Name</TableHead><TableHead>Stock</TableHead><TableHead>Unit</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
                <TableBody>
                  {inventory.map((drug: any) => (
                    <TableRow key={drug.id}>
                      <TableCell>{drug.name}</TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          defaultValue={drug.stock}
                          onBlur={(e) => handleUpdateStock(drug.id, parseInt(e.target.value))}
                          className="w-24"
                        />
                      </TableCell>
                      <TableCell>
                        <Button size="sm" variant="outline">
                          Update
                        </Button>
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