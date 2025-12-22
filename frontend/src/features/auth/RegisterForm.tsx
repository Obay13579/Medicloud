// frontend/src/features/auth/RegisterForm.tsx
"use client"

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";

// Skema validasi yang lebih kompleks untuk registrasi
const formSchema = z.object({
  clinicName: z.string().min(3, { message: "Nama klinik minimal 3 karakter." }),
  name: z.string().min(3, { message: "Nama Anda minimal 3 karakter." }),
  email: z.string().email({ message: "Format email tidak valid." }),
  role: z.enum(["ADMIN", "DOCTOR", "PHARMACIST"], { 
    message: "Pilih role Anda." 
  }),
  password: z.string().min(6, { message: "Password minimal 6 karakter." }),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: "Konfirmasi password tidak cocok.",
  path: ["confirmPassword"], // Menunjukkan error di field confirmPassword
});

export function RegisterForm() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      clinicName: "",
      name: "",
      email: "",
      role: undefined,
      password: "",
      confirmPassword: "",
    },
  });
  
  // Fungsi untuk membuat 'slug' dari nama klinik
  const createSlug = (text: string) => 
    text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');


  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const tenantSlug = createSlug(values.clinicName);
      
      // Step 1: Buat tenant/klinik terlebih dahulu
      const tenantPayload = {
        name: values.clinicName,
        slug: tenantSlug,
      };
      const tenantResponse = await api.post('/tenants', tenantPayload);
      const tenantId = tenantResponse.data.id || tenantResponse.data.tenant?.id;
      
      // Step 2: Register user dengan tenant yang baru dibuat
      const registerPayload = {
        tenantId: tenantId,
        name: values.name,
        email: values.email,
        password: values.password,
        role: values.role,
      };
      await api.post('/auth/register', registerPayload);

      toast({
        title: "Registrasi Berhasil!",
        description: "Akun klinik Anda telah dibuat. Silakan login.",
      });
      
      // Arahkan ke halaman login setelah berhasil
      navigate('/login');

    } catch (error: any) {
      console.error("Registration failed:", error);
      const errorMessage = error.response?.data?.message || "Terjadi kesalahan. Silakan coba lagi.";
      toast({
        title: "Registrasi Gagal",
        description: errorMessage,
        variant: "destructive",
      });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="clinicName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nama Klinik</FormLabel>
              <FormControl>
                <Input placeholder="Klinik Sehat Selalu" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nama Lengkap Anda (Admin)</FormLabel>
              <FormControl>
                <Input placeholder="John Doe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="admin@klinik.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Role</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih role Anda" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                  <SelectItem value="DOCTOR">Dokter</SelectItem>
                  <SelectItem value="PHARMACIST">Apoteker</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="******" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Konfirmasi Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="******" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Memproses..." : "Daftar"}
        </Button>
      </form>
    </Form>
  )
}