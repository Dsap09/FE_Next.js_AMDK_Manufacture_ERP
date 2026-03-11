"use client";
import React from "react";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";

export default function ForgotPasswordForm() {
  return (
    <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto p-5">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
          Reset Your Password
        </h1>
        <p className="text-sm text-gray-500">
          Enter your email address below and we'll send you a link with instructions
        </p>
      </div>

      <form className="space-y-6">
        <div>
          <Label>Email Address</Label>
          <Input placeholder="Enter Email Address" type="email" className="h-12" />
        </div>

        <Button className="w-full h-12 text-base font-bold">
          Send Verification Code
        </Button>
      </form>
    </div>
  );
}
