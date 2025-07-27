import authApiRequest from "@/apiRequests/auth";
import { NextRequest } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  const code = (await request.json()) as string;
  const cookieStore = cookies();
  const { payload, status } = await authApiRequest.sVerifyRegister(code!);

  if (status == 200) {
    const { access_token } = payload.data!;
    const now = new Date();
    cookieStore.set("accessToken", access_token, {
      path: "/",
      httpOnly: true,
      sameSite: true,
      secure: true,
      expires: new Date(now.setDate(now.getDate() + 30)),
    });
  }
  return Response.json(payload, {
    status: status,
  });
}
