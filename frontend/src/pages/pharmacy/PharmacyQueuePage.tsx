import { useEffect, useState } from 'react';
import { prescriptionService } from '@/services/prescriptionService';
import { inventoryService } from '@/services/inventoryService';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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

  // Add drug form
  const [newDrug, setNewDrug] = useState({ name: '', stock: '' });

  useEffect(() => {
    if (tenant) {
      loadPrescriptions();
      loadInventory();
    }
  }, [tenant]);

  const loadPrescriptions = async () => {
    try {
      const { data } = await prescriptionService.getAll(tenant, { status: 'PENDING' });
      setPrescriptions(data);
    } catch (error) {
      console.error('Failed to load prescriptions', error);
    }
  };

  const loadInventory = async () => {
    try {
      const { data } = await inventoryService.getAll(tenant);
      setInventory(data);
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
  };

  const handleCompletePrescription = async (id: string) => {
    try {
      await prescriptionService.updateStatus(tenant, id, 'COMPLETED');
      setSelectedPrescription(null);
      loadPrescriptions();
      alert('Prescription completed');
    } catch (error) {
      alert('Failed to complete prescription');
    }
  };

  const handleAddDrug = async () => {
    if (!newDrug.name || !newDrug.stock) {
      alert('Please fill all fields');
      return;
    }

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

        {/* Prescriptions Tab */}
        <TabsContent value="prescriptions" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Prescription List */}
            <Card>
              <CardHeader>
                <CardTitle>Pending Prescriptions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {prescriptions.map((rx: any) => (
                  <div
                    key={rx.id}
                    className="p-3 border rounded cursor-pointer hover:bg-gray-50"
                    onClick={() => handleViewPrescription(rx.id)}
                  >
                    <p className="font-semibold">{rx.patient?.name}</p>
                    <p className="text-sm text-gray-600">
                      {new Date(rx.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
                {prescriptions.length === 0 && (
                  <p className="text-gray-500 text-center py-4">No pending prescriptions</p>
                )}
              </CardContent>
            </Card>

            {/* Prescription Detail */}
            <Card>
              <CardHeader>
                <CardTitle>Prescription Detail</CardTitle>
              </CardHeader>
              <CardContent>
                {selectedPrescription ? (
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-600">Patient</p>
                      <p className="font-semibold">{selectedPrescription.patient?.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Doctor</p>
                      <p className="font-semibold">{selectedPrescription.doctor?.name}</p>
                    </div>
                    <div>
                      <p className="font-semibold mb-2">Medications:</p>
                      {selectedPrescription.items?.map((item: any, index: number) => (
                        <div key={index} className="p-2 border rounded mb-2">
                          <p className="font-semibold">{item.drugName}</p>
                          <p className="text-sm">
                            {item.dosage} - {item.frequency} - {item.duration}
                          </p>
                        </div>
                      ))}
                    </div>
                    <div className="space-y-2">
                      {selectedPrescription.status === 'PENDING' && (
                        <Button
                          className="w-full"
                          onClick={() => handleProcessPrescription(selectedPrescription.id)}
                        >
                          Start Processing
                        </Button>
                      )}
                      <Button
                        className="w-full"
                        onClick={() => handleCompletePrescription(selectedPrescription.id)}
                      >
                        Mark as Completed
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">
                    Select a prescription to view details
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Inventory Tab */}
        <TabsContent value="inventory" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Add New Drug</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-3">
                <Input
                  placeholder="Drug name"
                  value={newDrug.name}
                  onChange={(e) => setNewDrug({ ...newDrug, name: e.target.value })}
                />
                <Input
                  type="number"
                  placeholder="Initial stock"
                  value={newDrug.stock}
                  onChange={(e) => setNewDrug({ ...newDrug, stock: e.target.value })}
                />
                <Button onClick={handleAddDrug}>Add Drug</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Drug Inventory</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Drug Name</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
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
    </div>
  );
}