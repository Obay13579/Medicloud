// frontend/src/pages/doctor/EmrPage.tsx

import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format, differenceInYears } from 'date-fns';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { PlusCircle, Trash2 } from 'lucide-react';
import api from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';

// --- Type Definitions ---
interface Patient { id: string; name: string; dob: string; gender: string; }
interface MedicalRecord { id: string; visitDate: string; subjective?: string; objective?: string; assessment?: string; plan?: string; }

// --- Zod Schemas for Forms ---
const soapSchema = z.object({
  subjective: z.string().min(1, "Subjective notes are required."),
  objective: z.string().min(1, "Objective notes are required."),
  assessment: z.string().min(1, "Assessment is required."),
  plan: z.string().min(1, "Plan is required."),
});
type SoapFormData = z.infer<typeof soapSchema>;

const prescriptionItemSchema = z.object({
  drugName: z.string().min(1),
  dosage: z.string().min(1),
  frequency: z.string().min(1),
});
const prescriptionSchema = z.object({
  items: z.array(prescriptionItemSchema).min(1, "At least one medication is required."),
});
type PrescriptionFormData = z.infer<typeof prescriptionSchema>;

// Hardcoded drug list for MVP
const drugList = ["Paracetamol 500mg", "Amoxicillin 500mg", "Ibuprofen 200mg", "Omeprazole 20mg"];

export default function EmrPage() {
  const { appointmentId, patientId } = useParams();
  const { user } = useAuthStore();
  const tenantSlug = user?.tenant?.slug;
  const doctorId = user?.id;
  const navigate = useNavigate();
  const { toast } = useToast();

  const [patient, setPatient] = useState<Patient | null>(null);
  const [history, setHistory] = useState<MedicalRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newRecordId, setNewRecordId] = useState<string | null>(null);

  const soapForm = useForm<SoapFormData>({ resolver: zodResolver(soapSchema) });
  const prescriptionForm = useForm<PrescriptionFormData>({ resolver: zodResolver(prescriptionSchema), defaultValues: { items: [{ drugName: '', dosage: '', frequency: '' }] } });
  const { fields, append, remove } = useFieldArray({ control: prescriptionForm.control, name: "items" });

  const fetchData = useCallback(async () => {
    if (!tenantSlug || !patientId) return;
    setIsLoading(true);
    try {
      const [patientRes, historyRes] = await Promise.all([
        api.get(`/api/${tenantSlug}/patients/${patientId}`),
        api.get(`/api/${tenantSlug}/patients/${patientId}/records`)
      ]);
      setPatient(patientRes.data);
      setHistory(historyRes.data);
    } catch (error) {
      toast({ title: "Error", description: "Failed to load patient data.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [tenantSlug, patientId, toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onSaveSoap = async (data: SoapFormData) => {
    if (!tenantSlug || !patientId || !doctorId) return;
    try {
      const payload = { ...data, patientId, doctorId };
      const response = await api.post(`/api/${tenantSlug}/records`, payload);
      setNewRecordId(response.data.id); // Save the new record ID
      toast({ title: "SOAP Saved", description: "Medical record has been saved." });
      await fetchData(); // Refresh history
    } catch (error) {
      toast({ title: "Error", description: "Failed to save SOAP record.", variant: "destructive" });
    }
  };

  const onSendPrescription = async (data: PrescriptionFormData) => {
    if (!tenantSlug || !newRecordId) return;
    try {
      const payload = { recordId: newRecordId, items: data.items };
      await api.post(`/api/${tenantSlug}/prescriptions`, payload);
      toast({ title: "Prescription Sent", description: "Prescription has been sent to the pharmacy." });
    } catch (error) {
      toast({ title: "Error", description: "Failed to send prescription.", variant: "destructive" });
    }
  };

  const onCompleteConsultation = async () => {
    if (!tenantSlug || !appointmentId) return;
    try {
      await api.patch(`/api/${tenantSlug}/appointments/${appointmentId}`, { status: 'COMPLETED' });
      toast({ title: "Consultation Complete", description: "Navigating back to queue." });
      navigate('/doctor/queue');
    } catch (error) {
      toast({ title: "Error", description: "Failed to complete consultation.", variant: "destructive" });
    }
  };

  if (isLoading) return <div>Loading patient data...</div>;
  if (!patient) return <div>Patient not found.</div>;

  const age = differenceInYears(new Date(), new Date(patient.dob));

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Patient: {patient.name}</CardTitle>
          <p className="text-muted-foreground">{age} years old, {patient.gender}</p>
        </CardHeader>
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
                  <Button type="button" variant="outline" size="sm" onClick={() => append({ drugName: '', dosage: '', frequency: '' })}><PlusCircle className="mr-2 h-4 w-4"/>Add Drug</Button>
                  <Separator />
                  <Button type="submit" disabled={!newRecordId || prescriptionForm.formState.isSubmitting}>Send to Pharmacy</Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          <div className="text-right">
            <Button size="lg" onClick={onCompleteConsultation} disabled={!newRecordId}>Complete Consultation</Button>
          </div>
        </div>
      </div>
    </div>
  );
}