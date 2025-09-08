"use client";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import VerifyEmailClient from "./VerifyEmailClient";

export default function VerifyEmail() {
  return (
    <Suspense fallback={<div>Đang tải...</div>}>
      <VerifyEmailClient />
    </Suspense>
  );
}
