import { useEffect, useState } from 'react';
import { patientService } from '@/services/patientService';
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

export function PatientListPage() {
  const [patients, setPatients] = useState([]);
  const { user } = useAuthStore();
  const tenant = user?.tenantId;

  useEffect(() => {
    if (tenant) loadPatients();
  }, [tenant]);

  const loadPatients = async () => {
    try {
      const { data } = await patientService.getAll(tenant);
      setPatients(data);
    } catch (error) {
      console.error('Failed to load patients', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete patient?')) {
      try {
        await patientService.delete(tenant, id);
        loadPatients();
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
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Gender</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {patients.map((patient: any) => (
            <TableRow key={patient.id}>
              <TableCell>{patient.name}</TableCell>
              <TableCell>{patient.phone}</TableCell>
              <TableCell>{patient.gender}</TableCell>
              <TableCell>
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={() => handleDelete(patient.id)}
                >
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}