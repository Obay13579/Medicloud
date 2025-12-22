// frontend/src/features/auth/LoginForm.tsx
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
import { useToast } from "@/hooks/use-toast";
import { useAuthStore } from "@/stores/authStore";
import api from "@/lib/api";

// Skema validasi form
const formSchema = z.object({
  email: z.string().email({ message: "Format email tidak valid." }),
  password: z.string().min(6, { message: "Password minimal 6 karakter." }),
});

export function LoginForm() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { login } = useAuthStore();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      // 1. Panggil API Login
      const loginResponse = await api.post('/api/auth/login', values);
      const { token } = loginResponse.data;

      // 2. Simpan token sementara untuk panggil API /me
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      // 3. Panggil API untuk mendapatkan data user
      const meResponse = await api.get('/api/auth/me');
      const user = meResponse.data;

      // 4. Simpan token dan user ke Zustand (dan localStorage)
      login(token, user);

      // 5. Redirect berdasarkan role
      toast({ title: "Login Berhasil!", description: `Selamat datang, ${user.name}` });
      switch (user.role) {
        case 'ADMIN':
          navigate('/admin/dashboard');
          break;
        case 'DOCTOR':
          navigate('/doctor/queue');
          break;
        case 'PHARMACIST':
          navigate('/pharmacy/queue');
          break;
        default:
          navigate('/');
      }
    } catch (error) {
      console.error("Login failed:", error);
      toast({
        title: "Login Gagal",
        description: "Email atau password salah. Silakan coba lagi.",
        variant: "destructive",
      });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="contoh@klinik.com" {...field} />
              </FormControl>
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
        <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Memproses..." : "Login"}
        </Button>
      </form>
    </Form>
  )
}