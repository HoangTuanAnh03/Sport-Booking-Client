import authApiRequest from "@/apiRequests/auth";
import { LoginBodyType } from "@/schemaValidations/auth.schema";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  const body = (await request.json()) as LoginBodyType;
  const cookieStore = cookies();
  const { payload, status } = await authApiRequest.sLogin(body);

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
    status: 200,
  });
}
