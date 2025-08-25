import authApiRequest from "@/apiRequests/auth";
import { decodeJWT } from "@/lib/utils";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  const code = (await request.json()) as string;
  const cookieStore = cookies();
  const res = await authApiRequest.sOutbound(code);

  if (res.status === 200) {
    const { access_token, refresh_token } = res.payload.data!;
    const decodedAccessToken = decodeJWT(access_token);
    const decodedRefreshToken = decodeJWT(refresh_token);

    if (res.payload.data?.user.role !== "ROLE_OWNER") {
      return Response.json(res.payload, {
        status: 403,
      });
    }

    cookieStore.set("accessToken", access_token, {
      path: "/",
      httpOnly: true,
      sameSite: true,
      secure: true,
      expires: new Date(decodedAccessToken.exp * 1000),
    });
    cookieStore.set("refreshToken", refresh_token, {
      path: "/",
      httpOnly: true,
      sameSite: true,
      secure: true,
      expires: new Date(decodedRefreshToken.exp * 1000),
    });
    return Response.json(res.payload);
  }
  return Response.json(null, { status: 400 });
}
