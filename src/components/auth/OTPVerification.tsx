"use client";
import React from "react";
import Button from "@/components/ui/button/Button"; // Pastikan sudah di-import
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function OTPVerification() {
    const router = useRouter();

const handleVerify = () => {
  // Jika datang dari alur Lupa Password, arahkan ke password baru
  router.push("/new-password");
};
  return (
    <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto p-5 text-center">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
          Confirm Your Email
        </h1>
        <p className="text-sm text-gray-500">
          We've sent 5 digits verification code to <span className="font-semibold text-gray-800">Cihuyy@gmail.com</span>
        </p>
      </div>

      {/* Input OTP */}
      <div className="flex justify-center gap-3 mb-8">
        {[1, 2, 3, 4, 5].map((_, index) => (
          <input
            key={index}
            type="text"
            maxLength={1}
            className="w-12 h-14 text-center text-xl font-bold border border-gray-200 rounded-xl focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 transition-all dark:bg-gray-800 dark:border-gray-700"
          />
        ))}
      </div>

      <div className="mb-8">
        <p className="text-sm text-gray-500">
          Resend in <span className="text-brand-500 font-medium">3:03</span>
        </p>
      </div>

      <Button onClick={handleVerify} className="w-full h-12 text-base font-bold">
        Verify and Create Account
      </Button>
    </div>
  );
}