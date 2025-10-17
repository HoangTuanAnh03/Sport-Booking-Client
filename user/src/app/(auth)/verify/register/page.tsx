import VerifyEmail from "@/app/(auth)/verify/register/register";
import { Suspense } from "react";

export default function Page() {
  return (
    <Suspense>
      <VerifyEmail />
    </Suspense>
  );
}
