// frontend/src/features/auth/LoginForm.tsx
"use client"

import { useState } from "react";
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
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuthStore } from "@/stores/authStore";
import api from "@/lib/api";

// Skema validasi form
const formSchema = z.object({
  tenantSlug: z.string().min(1, { message: "Slug klinik wajib diisi." }),
  email: z.string().email({ message: "Format email tidak valid." }),
  password: z.string().min(6, { message: "Password minimal 6 karakter." }),
});

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading, user } = useAuthStore();
  const navigate = useNavigate();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      tenantSlug: "",
      email: "",
      password: "",
    },
  });

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      // 1. Panggil API Login
      const loginResponse = await api.post('/api/auth/login', values);
      const { token, user } = loginResponse.data.data; // Fix: data ada di dalam .data.data

      // 2. Simpan token sementara untuk panggil API /me
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      // 3. Simpan token dan user ke Zustand (dan localStorage)
      // User sudah didapat dari login response, tidak perlu panggil /me lagi
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
      alert('Login failed');
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="tenantSlug"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Slug Klinik</FormLabel>
              <FormControl>
                <Input placeholder="klinik-sehat" {...field} />
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
                <Input type="password" placeholder="Password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? 'Loading...' : 'Login'}
        </Button>
      </form>
    </Form>
  );
}