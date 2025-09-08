"use client";

import type React from "react";
import { Suspense } from "react";
import MapClient from "./MapClient";

export default function MapPage() {
  return (
    <Suspense fallback={<div>Đang tải bản đồ...</div>}>
      <MapClient />
    </Suspense>
  );
}
