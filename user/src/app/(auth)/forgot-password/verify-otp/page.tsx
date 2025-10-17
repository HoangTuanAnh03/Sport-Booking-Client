import { Suspense } from "react";
import VerifyOTPPage from "./verifyOTP";

export default function Page() {
  return (
    <Suspense>
      <VerifyOTPPage />
    </Suspense>
  );
}
