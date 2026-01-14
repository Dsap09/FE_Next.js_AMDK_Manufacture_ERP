import OTPVerification from "@/components/auth/OTPVerification";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Verify OTP | ERP System",
  description: "Enter the verification code sent to your email",
};

export default function VerifyOTPPage() {
  return <OTPVerification />;
}