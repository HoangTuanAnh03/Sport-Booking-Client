import Logout from "@/app/(auth)/logout/logout";
import { Suspense } from "react";

export default function Page() {
  return (
    <Suspense>
      <Logout />
    </Suspense>
  );
}
