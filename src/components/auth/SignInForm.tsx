"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/services/authService";
import Input from "@/components/form/input/InputField";
import Button from "@/components/ui/button/Button";
import Link from "next/link";
import Cookies from "js-cookie";

export default function SignInForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await authService.login({ email, password });
      const token = result.token || result.data?.token;

      if (token) {
        // 1. Simpan ke LocalStorage (Untuk Axios Interceptor)
        localStorage.setItem("token", token);

        // 2. Simpan ke Cookie (Untuk Middleware & Proteksi Halaman Server)
        Cookies.set("token", token, { expires: 1, secure: true, sameSite: 'strict' });

        // 3. Pindah ke Dashboard
        router.push("/"); 
      } else {
        setError("Token tidak ditemukan dalam response server.");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Email atau password salah.");
    } finally {
      setLoading(false);
    }
  };

  return (
    /** * Container Utama: 
     * - min-h-screen: tinggi minimal satu layar penuh
     * - flex items-center justify-center: menempatkan kartu tepat di tengah
     * - bg-gray-50: memberikan warna dasar agar kartu terlihat menonjol
     */
    <div className="flex min-h-screen w-full items-center justify-center bg-gray-50 p-4 dark:bg-gray-900">
      
      {/* Login Card */}
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
        
        {/* Header Card */}
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
            Sign In
          </h1>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Enter your details to access your ERP account
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 rounded-xl bg-red-50 p-4 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
            <div className="flex items-center">
              <span className="font-bold">Error:</span> {error}
            </div>
          </div>
        )}

        <form onSubmit={handleSignIn} className="space-y-6">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Email Address
            </label>
            <Input 
              type="email" 
              placeholder="name@company.com" 
              value={email}
              className="h-12 w-full rounded-xl border-gray-200 focus:ring-brand-500"
              onChange={(e: any) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Password
              </label>
              <Link href="/reset-password" title="reset" className="text-sm font-semibold text-brand-500 hover:text-brand-600">
                Forgot?
              </Link>
            </div>
            <Input 
              type="password" 
              placeholder="••••••••" 
              value={password}
              className="h-12 w-full rounded-xl border-gray-200"
              onChange={(e: any) => setPassword(e.target.value)}
              required
            />
          </div>

          <Button 
            type="submit"
            disabled={loading} 
            className="w-full h-12 rounded-xl bg-brand-500 text-white shadow-lg shadow-brand-500/30 hover:bg-brand-600 transition-all font-bold text-base"
          >
            {loading ? "Verifying..." : "Sign In to Dashboard"}
          </Button>

          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-8">
            Don't have an account?{" "}
            <Link href="/signup" className="font-bold text-brand-500 hover:text-brand-600">
              Create account
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}