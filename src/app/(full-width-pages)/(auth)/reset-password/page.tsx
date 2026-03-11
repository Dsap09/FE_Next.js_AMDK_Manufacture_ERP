import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reset Password | ERP System",
  description: "Enter your email to reset your password",
};

export default function ResetPasswordPage() {
  return <ForgotPasswordForm />;
}
