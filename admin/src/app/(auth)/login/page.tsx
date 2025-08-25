import LoginForm from "@/app/(auth)/login/login-form";
import Image from "next/image";
import { CheckIcon } from "@radix-ui/react-icons";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import Google from "@/app/(auth)/login/google";
// import Icon from "";

export default function LoginPage() {
  return (
    <div className="flex mt-2 w-full justify-center text-[#121212]">
      <div className=" flex flex-col max-w-[1340px] w-full">
        <div className="flex items-center my-6">
          <h3 className="text-xl font-bold">Chào mừng bạn đến với</h3>
          <div className="pl-2">
            <span className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-green-500 bg-clip-text text-transparent">
              Sport Booking
            </span>
          </div>
        </div>
        <div className="flex justify-between w-full gap-[10%] ">
          <div className="flex-[4_4_0%]">
            <div className="mb-4 text-[#414042] text-sm font-normal">
              Bằng việc đăng nhập, bạn đồng ý với các{" "}
              <Link href={"#"} className="text-[#0e2eed]">
                Điều khoản dịch vụ
              </Link>{" "}
              và{" "}
              <Link href={"#"} className="text-[#0e2eed]">
                Chính sách quyền riêng tư
              </Link>{" "}
              của SportBooking liên quan đến thông tin riêng tư của bạn.
            </div>
            <Google title={"Đăng nhập bằng Google"} />
            <div className="relative flex items-center py-4">
              <Separator className="absolute" />
              <div className="relative flex w-full  justify-center  ">
                <span className="bg-background px-3 text-sm">hoặc</span>
              </div>
            </div>
            <LoginForm />
          </div>
          <div className="flex-[5_5_0%] ">
            <h2 className="text-2xl font-bold mb-4">
              Đăng nhập để quản lý và đặt sân thể thao một cách dễ dàng
            </h2>
            <ul className="text-base font-normal space-y-4">
              <li className="flex">
                <CheckIcon color="#0ab305" width={25} height={25} />
                Xem và quản lý tất cả các sân thể thao có sẵn trong khu vực
              </li>
              <li className="flex">
                <CheckIcon
                  fontWeight={400}
                  color="#0ab305"
                  width={25}
                  height={25}
                />
                Theo dõi lịch đặt sân và quản lý thông tin khách hàng
              </li>
              <li className="flex">
                <CheckIcon color="#0ab305" width={25} height={25} />
                Cập nhật trạng thái sân và giá cả theo thời gian thực
              </li>
              <li className="flex">
                <CheckIcon color="#0ab305" width={25} height={25} /> Quản lý
                doanh thu và thống kê hoạt động kinh doanh
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
