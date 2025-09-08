"use client";

import VerifyOTPClient from "@/app/(auth)/forgot-password/verify-otp/VerifyOTpClient";
import { Suspense } from "react";

export default function VerifyOTPPage() {
  return (
    <Suspense fallback={<div>Đang tải...</div>}>
      <VerifyOTPClient />
    </Suspense>
  );
}
