import SetNewPasswordForm from "@/components/auth/SetNewPasswordForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Set New Password | ERP System",
  description: "Create a new complex password to protect your account",
};

export default function NewPasswordPage() {
  return <SetNewPasswordForm />;
}
