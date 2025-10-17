import RefreshTokenPage from "@/app/(auth)/refresh-token/refresh-token";
import { Suspense } from "react";

export default function Page() {
  return (
    <Suspense>
      <RefreshTokenPage />
    </Suspense>
  );
}
