import authApiRequest from "@/apiRequests/auth";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  const cookieStore = cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  cookieStore.delete("accessToken");

  if (!accessToken) {
    return Response.json(
      { message: "Không nhận được refresh token" },
      {
        status: 200,
      }
    );
  }
  try {
    const res = await authApiRequest.sLogout();

    return Response.json(res.payload, {
      status: 200,
    });
  } catch (error) {
    return Response.json(
      {
        message: "Lỗi khi gọi API đến server backend",
      },
      {
        status: 200,
      }
    );
  }
}
