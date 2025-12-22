// frontend/src/features/appointments/AppointmentForm.tsx
"use client"

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

// Asumsi tipe data ini tersedia
interface Patient { id: string; name: string; }
interface Doctor { id: string; name: string; }

export const appointmentFormSchema = z.object({
  patientId: z.string().min(1, { message: "Pasien harus dipilih." }),
  doctorId: z.string().min(1, { message: "Dokter harus dipilih." }),
  date: z.date(), // Validasi disederhanakan, tapi tetap wajib diisi
  timeSlot: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: "Format waktu harus HH:MM" }),
});

export type AppointmentFormData = z.infer<typeof appointmentFormSchema>;

interface AppointmentFormProps {
  onSubmit: (data: AppointmentFormData) => void;
  initialData?: Partial<AppointmentFormData & { date: string | Date }>; // Handle date string from API
  isSubmitting?: boolean;
  patients: Patient[];
  doctors: Doctor[];
}

export function AppointmentForm({ onSubmit, initialData, isSubmitting, patients, doctors }: AppointmentFormProps) {
  const form = useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentFormSchema),
    defaultValues: {
      ...initialData,
      date: initialData?.date ? new Date(initialData.date) : new Date(),
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField control={form.control} name="patientId" render={({ field }) => (
          <FormItem><FormLabel>Pasien</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl><SelectTrigger><SelectValue placeholder="Pilih Pasien" /></SelectTrigger></FormControl>
              <SelectContent>{patients.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="doctorId" render={({ field }) => (
          <FormItem><FormLabel>Dokter</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value} disabled={doctors.length === 0}>
              <FormControl><SelectTrigger><SelectValue placeholder={doctors.length === 0 ? "Tidak ada dokter tersedia" : "Pilih Dokter"} /></SelectTrigger></FormControl>
              <SelectContent>
                {doctors.length === 0 ? (
                  <SelectItem value="__empty__" disabled>Daftarkan dokter terlebih dahulu</SelectItem>
                ) : (
                  doctors.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)
                )}
              </SelectContent>
            </Select>
            {doctors.length === 0 && <p className="text-sm text-muted-foreground">Tambahkan dokter melalui tombol "Add Staff" di halaman Dashboard.</p>}
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="date" render={({ field }) => (
          <FormItem className="flex flex-col"><FormLabel>Tanggal</FormLabel>
            <Popover>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button variant={"outline"} className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                    {field.value ? format(field.value, "PPP") : <span>Pilih tanggal</span>}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
              </PopoverContent>
            </Popover>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="timeSlot" render={({ field }) => (
          <FormItem><FormLabel>Waktu (HH:MM)</FormLabel><FormControl><Input type="time" placeholder="09:00" {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Menyimpan..." : "Simpan Janji Temu"}
        </Button>
      </form>
    </Form>
  );
}