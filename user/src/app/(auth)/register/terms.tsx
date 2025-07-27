"use client";

import Google from "@/app/(auth)/login/google";
import { Checkbox } from "@/components/ui/checkbox";
import Link from "next/link";
import { useState } from "react";

export default function TermsGoogle() {
  const [isChecked, setIsChecked] = useState(false);

  return (
    <>
      <div className="mt-4">
        <Google title={"Đăng ký bằng Google"}/>
      </div>
    </>
  );
}
