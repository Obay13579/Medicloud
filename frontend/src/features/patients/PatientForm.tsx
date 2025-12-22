// frontend/src/features/patients/PatientForm.tsx
"use client"

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Tipe data untuk form, bisa diexport jika dibutuhkan di tempat lain
export const patientFormSchema = z.object({
  name: z.string().min(2, { message: "Nama minimal 2 karakter." }),
  phone: z.string().min(10, { message: "Nomor telepon minimal 10 digit." }),
  dob: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Format tanggal tidak valid." }),
  gender: z.enum(["Male", "Female"]),
});

export type PatientFormData = z.infer<typeof patientFormSchema>;

interface PatientFormProps {
  onSubmit: (data: PatientFormData) => void;
  initialData?: Partial<PatientFormData>; // Untuk mode edit
  isSubmitting?: boolean;
}

export function PatientForm({ onSubmit, initialData, isSubmitting }: PatientFormProps) {
  const form = useForm<PatientFormData>({
    resolver: zodResolver(patientFormSchema),
    defaultValues: initialData || { name: "", phone: "", dob: "", gender: "Male" },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField control={form.control} name="name" render={({ field }) => (
          <FormItem><FormLabel>Nama Lengkap</FormLabel><FormControl><Input placeholder="John Doe" {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="phone" render={({ field }) => (
          <FormItem><FormLabel>Nomor Telepon</FormLabel><FormControl><Input placeholder="08123456789" {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="dob" render={({ field }) => (
          <FormItem><FormLabel>Tanggal Lahir</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="gender" render={({ field }) => (
          <FormItem><FormLabel>Jenis Kelamin</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl><SelectTrigger><SelectValue placeholder="Pilih jenis kelamin" /></SelectTrigger></FormControl>
              <SelectContent><SelectItem value="Male">Laki-laki</SelectItem><SelectItem value="Female">Perempuan</SelectItem></SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )} />
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Menyimpan..." : "Simpan"}
        </Button>
      </form>
    </Form>
  );
}