"use client";

import { Button } from "@/components/ui/button";
import { OAuthConfig } from "@/configs/google-config";
import Image from "next/image";

const handleLoginGoogle = () => {
  const callbackUrl = OAuthConfig.redirectUri;
  const authUrl = OAuthConfig.authUri;
  const googleClientId = OAuthConfig.clientId;

  const targetUrl = `${authUrl}?redirect_uri=${encodeURIComponent(
    callbackUrl
  )}&response_type=code&client_id=${googleClientId}&scope=openid%20email%20profile`;

  window.location.href = targetUrl;
};

export default function Google({
  title,
  disable = false,
}: {
  title: string;
  disable?: boolean;
}) {
  return (
    <Button
      className={
        disable
          ? "w-full h-11 border-[#a6a6a6] text-[#a6a6a6] font-semibold text-[16px]  pointer-events-none select-none"
          : "w-full h-11 border-[green] text-[#green] font-semibold text-[16px] hover:bg-[#90FB90] hover:text-[#green] select-none "
      }
      variant="outline"
      onClick={handleLoginGoogle}
    >
      <Image
        src={"/google_logo.svg"}
        width={30}
        height={30}
        alt="Logo Google"
        className="mr-2"
      />
      {title}
    </Button>
  );
}
