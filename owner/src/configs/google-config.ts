import envConfig from "@/config";

export const OAuthConfig = {
  clientId: envConfig.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
  redirectUri: envConfig.NEXT_PUBLIC_GOOGLE_REDIRECT_URI,
  authUri: envConfig.NEXT_PUBLIC_GOOGLE_AUTH_URI,
};
