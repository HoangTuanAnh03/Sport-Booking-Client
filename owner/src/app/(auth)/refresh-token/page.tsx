"use client";
import { Suspense } from "react";
import RefreshTokenClient from "./RefreshTokenClient";

export default function RefreshTokenPage() {
  return (
    <Suspense fallback={<div>Đang làm mới token...</div>}>
      <RefreshTokenClient />
    </Suspense>
  );
}
