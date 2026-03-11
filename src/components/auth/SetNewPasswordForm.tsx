"use client";
import React from "react";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";

export default function SetNewPasswordForm() {
  return (
    <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto p-5">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
          Enter New Password
        </h1>
        <p className="text-sm text-gray-500">
          Set Complex passwords to protect
        </p>
      </div>

      <form className="space-y-6">
        <div>
          <Label>Password</Label>
          <Input placeholder="Enter your password" type="password" className="h-12" />
        </div>

        <div>
          <Label>Re Type Password</Label>
          <Input placeholder="Enter your password" type="password" className="h-12" />
        </div>

        <Button className="w-full h-12 text-base font-bold">
          Set New Password
        </Button>
      </form>
    </div>
  );
}
