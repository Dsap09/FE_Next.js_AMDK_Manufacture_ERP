"use client";
import Checkbox from "@/components/form/input/Checkbox";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import Link from "next/link";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignInForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const router = useRouter();

const handleSignIn = (e: React.FormEvent) => {
  e.preventDefault();
  // Simulasi login berhasil
  router.push("/"); // Arahkan ke Dashboard
};

  return (
    <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto p-5">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
          Welcome Back!
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          Let's login for explore continues
        </p>
      </div>

      <form className="space-y-6">
        <div>
          <Label>Email or Phone Number</Label>
          <Input placeholder="Enter your email" type="email" className="h-12" />
        </div>
        
        <div>
          <Label>Password</Label>
          <Input 
            type={showPassword ? "text" : "password"} 
            placeholder="Enter your password" 
            className="h-12" 
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Checkbox checked={isChecked} onChange={setIsChecked} />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Keep me signed in
            </span>
          </div>
          <Link href="/reset-password" title="Lupa Password" className="text-sm font-semibold text-brand-500">
            Forgot password
          </Link>
        </div>

        <Button onClick={handleSignIn} className="w-full h-12 text-base font-bold" size="sm">
          Sign in
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
        Don't have an account? {" "}
        <Link href="/signup" className="font-bold text-brand-500">
          Sign Up here
        </Link>
      </p>
    </div>
  );
}