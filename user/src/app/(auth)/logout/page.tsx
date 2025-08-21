import { Suspense } from "react";
import LogoutComponent from "./LogoutComponent";

export default function LogoutPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LogoutComponent />
    </Suspense>
  );
}
