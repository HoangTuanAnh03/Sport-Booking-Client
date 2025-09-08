import { Suspense } from "react";
import LogoutClient from "./LogoutClient";

export default function Logout() {
  return (
    <Suspense fallback={<div>Đang đăng xuất...</div>}>
      <LogoutClient />
    </Suspense>
  );
}
