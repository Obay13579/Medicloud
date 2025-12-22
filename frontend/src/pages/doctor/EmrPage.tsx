import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { patientService } from '@/services/patientService';
import { emrService } from '@/services/emrService';
import { prescriptionService } from '@/services/prescriptionService';
import { appointmentService } from '@/services/appointmentService';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

export function EmrPage() {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const tenant = user?.tenantId;

  const [patient, setPatient] = useState<any>(null);
  const [medicalHistory, setMedicalHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // SOAP Form State
  const [subjective, setSubjective] = useState('');
  const [objective, setObjective] = useState('');
  const [assessment, setAssessment] = useState('');
  const [plan, setPlan] = useState('');

  // Prescription State
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [drugName, setDrugName] = useState('');
  const [dosage, setDosage] = useState('');
  const [frequency, setFrequency] = useState('');
  const [duration, setDuration] = useState('');

  useEffect(() => {
    loadPatientData();
  }, [appointmentId]);

  const loadPatientData = async () => {
    try {
      const [patientRes, historyRes] = await Promise.all([
        api.get(`/api/${tenantSlug}/patients/${patientId}`),
        api.get(`/api/${tenantSlug}/patients/${patientId}/records`)
      ]);
      // Handle nested response format
      setPatient(patientRes.data.data || patientRes.data);
      setHistory(historyRes.data.data || historyRes.data || []);
    } catch (error) {
      console.error('Failed to load patient data', error);
    }
  };

  const handleAddPrescription = () => {
    if (!drugName || !dosage || !frequency || !duration) {
      alert('Please fill all prescription fields');
      return;
    }

    setPrescriptions([
      ...prescriptions,
      { drugName, dosage, frequency, duration }
    ]);

    // Reset form
    setDrugName('');
    setDosage('');
    setFrequency('');
    setDuration('');
  };

  const handleRemovePrescription = (index: number) => {
    setPrescriptions(prescriptions.filter((_, i) => i !== index));
  };

  const handleSaveSOAP = async () => {
    if (!subjective || !objective || !assessment || !plan) {
      alert('Please fill all SOAP fields');
      return;
    }

    setIsLoading(true);
    try {
      const payload = { ...data, patientId, doctorId };
      const response = await api.post(`/api/${tenantSlug}/records`, payload);
      // Handle nested response format
      const recordData = response.data.data || response.data;
      setNewRecordId(recordData.id); // Save the new record ID
      toast({ title: "SOAP Saved", description: "Medical record has been saved. You can now send prescription." });
      await fetchData(); // Refresh history
    } catch (error) {
      alert('Failed to save SOAP record');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendToPharmacy = async () => {
    if (prescriptions.length === 0) {
      alert('Please add at least one prescription');
      return;
    }

    setIsLoading(true);
    try {
      await prescriptionService.create(tenant, {
        patientId: patient.id,
        appointmentId,
        items: prescriptions,
      });
      alert('Prescription sent to pharmacy');
    } catch (error) {
      alert('Failed to send prescription');
    } finally {
      setIsLoading(false);
    }
  };

  const handleComplete = async () => {
    setIsLoading(true);
    try {
      await appointmentService.update(tenant, appointmentId!, { status: 'COMPLETED' });
      alert('Appointment completed');
      navigate('/doctor/queue');
    } catch (error) {
      alert('Failed to complete appointment');
    } finally {
      setIsLoading(false);
    }
  };

  if (!patient) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 space-y-6">
      {/* Patient Info Header */}
      <Card>
        <CardHeader>
          <CardTitle>Patient Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600">Name</p>
              <p className="font-semibold">{patient.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Age</p>
              <p className="font-semibold">{patient.age} years</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Gender</p>
              <p className="font-semibold">{patient.gender}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Medical History Section */}
        <div className="md:col-span-1 space-y-4">
          <h2 className="text-xl font-semibold">Medical History</h2>
          <Accordion type="single" collapsible className="w-full">
            {history.length > 0 ? history.map(record => (
              <AccordionItem key={record.id} value={record.id}>
                <AccordionTrigger>{format(new Date(record.visitDate), 'dd MMMM yyyy')}</AccordionTrigger>
                <AccordionContent className="space-y-2 text-sm">
                  <p><strong className="font-medium">S:</strong> {record.subjective}</p>
                  <p><strong className="font-medium">O:</strong> {record.objective}</p>
                  <p><strong className="font-medium">A:</strong> {record.assessment}</p>
                  <p><strong className="font-medium">P:</strong> {record.plan}</p>
                </AccordionContent>
              </AccordionItem>
            )) : <p className="text-sm text-muted-foreground">No prior medical history found.</p>}
          </Accordion>
        </div>

        {/* Current Consultation Section */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader><CardTitle>SOAP Notes</CardTitle></CardHeader>
            <CardContent>
              <Form {...soapForm}>
                <form onSubmit={soapForm.handleSubmit(onSaveSoap)} className="space-y-4">
                  <FormField name="subjective" control={soapForm.control} render={({ field }) => (<FormItem><FormLabel>Subjective</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField name="objective" control={soapForm.control} render={({ field }) => (<FormItem><FormLabel>Objective</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField name="assessment" control={soapForm.control} render={({ field }) => (<FormItem><FormLabel>Assessment</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField name="plan" control={soapForm.control} render={({ field }) => (<FormItem><FormLabel>Plan</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>)} />
                  <Button type="submit" disabled={!!newRecordId || soapForm.formState.isSubmitting}>
                    {newRecordId ? "Saved" : "Save SOAP"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Prescription</CardTitle></CardHeader>
            <CardContent>
              <Form {...prescriptionForm}>
                <form onSubmit={prescriptionForm.handleSubmit(onSendPrescription)} className="space-y-4">
                  {fields.map((field, index) => (
                    <div key={field.id} className="flex items-end gap-2">
                      <FormField name={`items.${index}.drugName`} control={prescriptionForm.control} render={({ field }) => (<FormItem className="flex-1"><FormLabel>Drug</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select Drug" /></SelectTrigger></FormControl><SelectContent>{drugList.map(drug => <SelectItem key={drug} value={drug}>{drug}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
                      <FormField name={`items.${index}.dosage`} control={prescriptionForm.control} render={({ field }) => (<FormItem><FormLabel>Dosage</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>)} />
                      <FormField name={`items.${index}.frequency`} control={prescriptionForm.control} render={({ field }) => (<FormItem><FormLabel>Frequency</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>)} />
                      <Button type="button" variant="destructive" size="icon" onClick={() => remove(index)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  ))}
                  <Button type="button" variant="outline" size="sm" onClick={() => append({ drugName: '', dosage: '', frequency: '' })}><PlusCircle className="mr-2 h-4 w-4" />Add Drug</Button>
                  <Separator />
                  <Button type="submit" disabled={!newRecordId || prescriptionForm.formState.isSubmitting}>Send to Pharmacy</Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          <div className="text-right">
            <Button size="lg" onClick={onCompleteConsultation} disabled={!newRecordId}>Complete Consultation</Button>
          </div>
          <div>
            <Label>Objective (Physical Examination)</Label>
            <Textarea
              placeholder="Vital signs, examination findings..."
              value={objective}
              onChange={(e) => setObjective(e.target.value)}
              rows={3}
            />
          </div>
          <div>
            <Label>Assessment (Diagnosis)</Label>
            <Textarea
              placeholder="Diagnosis, differential diagnosis..."
              value={assessment}
              onChange={(e) => setAssessment(e.target.value)}
              rows={3}
            />
          </div>
          <div>
            <Label>Plan (Treatment Plan)</Label>
            <Textarea
              placeholder="Treatment plan, follow-up..."
              value={plan}
              onChange={(e) => setPlan(e.target.value)}
              rows={3}
            />
          </div>
          <Button onClick={handleSaveSOAP} disabled={isLoading}>
            Save SOAP Notes
          </Button>
        </CardContent>
      </Card>

      {/* Prescription Form */}
      <Card>
        <CardHeader>
          <CardTitle>Prescriptions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-4 gap-3">
            <Input
              placeholder="Drug name"
              value={drugName}
              onChange={(e) => setDrugName(e.target.value)}
            />
            <Input
              placeholder="Dosage (e.g., 500mg)"
              value={dosage}
              onChange={(e) => setDosage(e.target.value)}
            />
            <Input
              placeholder="Frequency (e.g., 3x/day)"
              value={frequency}
              onChange={(e) => setFrequency(e.target.value)}
            />
            <Input
              placeholder="Duration (e.g., 7 days)"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
            />
          </div>
          <Button onClick={handleAddPrescription}>Add Drug</Button>

          {/* Prescription List */}
          {prescriptions.length > 0 && (
            <div className="mt-4 space-y-2">
              {prescriptions.map((rx, index) => (
                <div key={index} className="flex justify-between items-center p-3 border rounded">
                  <div>
                    <p className="font-semibold">{rx.drugName}</p>
                    <p className="text-sm text-gray-600">
                      {rx.dosage} - {rx.frequency} - {rx.duration}
                    </p>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleRemovePrescription(index)}
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          )}

          <Button onClick={handleSendToPharmacy} disabled={isLoading}>
            Send to Pharmacy
          </Button>
        </CardContent>
      </Card>

      {/* Complete Button */}
      <div className="flex justify-end">
        <Button onClick={handleComplete} disabled={isLoading} size="lg">
          Complete Consultation
        </Button>
      </div>
    </div>
  );
}