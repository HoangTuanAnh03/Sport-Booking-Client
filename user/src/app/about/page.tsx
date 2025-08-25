import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Users, Target, TrendingUp, Award } from "lucide-react";
import Footer from "@/components/layout/Footer";

export default function AboutPage() {
  return (
    <>
      <main className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <section className="mb-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl font-bold mb-6">Về Sport Booking</h1>
              <p className="text-xl text-muted-foreground mb-8">
                Chúng tôi kết nối người chơi thể thao với những sân chơi tốt
                nhất. Nền tảng đặt sân thể thao trực tuyến hàng đầu Việt Nam.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-primary mr-2" />
                  <span>Hơn 500+ sân thể thao</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-primary mr-2" />
                  <span>Phục vụ 50.000+ người dùng</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-primary mr-2" />
                  <span>Hoạt động tại 10+ tỉnh thành</span>
                </div>
              </div>
            </div>
            <div className="relative h-[400px] rounded-lg overflow-hidden">
              <Image
                src="/about_1.png"
                alt="Sport Booking Team"
                fill
                priority
              />
            </div>
          </div>
        </section>

        {/* Our Story */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">
              Câu chuyện của chúng tôi
            </h2>
            <p className="text-muted-foreground max-w-3xl mx-auto">
              Từ ý tưởng đơn giản đến nền tảng đặt sân thể thao hàng đầu
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center mb-4">
                  <div className="bg-primary/10 h-12 w-12 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Khởi đầu</h3>
                </div>
                <p className="text-muted-foreground">
                  Sport Booking được thành lập vào năm 2020 bởi một nhóm những
                  người đam mê thể thao, với mong muốn giải quyết vấn đề tìm và
                  đặt sân thể thao một cách dễ dàng.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center mb-4">
                  <div className="bg-primary/10 h-12 w-12 rounded-full flex items-center justify-center mx-auto mb-4">
                    <TrendingUp className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Phát triển</h3>
                </div>
                <p className="text-muted-foreground">
                  Sau 2 năm hoạt động, chúng tôi đã mở rộng dịch vụ đến nhiều
                  tỉnh thành trên cả nước, với hàng trăm sân thể thao đa dạng
                  các loại hình.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center mb-4">
                  <div className="bg-primary/10 h-12 w-12 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Award className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Hiện tại</h3>
                </div>
                <p className="text-muted-foreground">
                  Ngày nay, Sport Booking là nền tảng đặt sân thể thao trực
                  tuyến hàng đầu Việt Nam, kết nối hàng nghìn người chơi mỗi
                  ngày với các sân thể thao chất lượng.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Mission & Vision */}
        <section className="mb-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="bg-primary/5 p-8 rounded-lg">
              <div className="flex items-center mb-4">
                <div className="bg-primary/10 h-12 w-12 rounded-full flex items-center justify-center mr-4">
                  <Target className="h-6 w-6 text-primary" />
                </div>
                <h2 className="text-2xl font-bold">Sứ mệnh</h2>
              </div>
              <p className="text-muted-foreground mb-6">
                Chúng tôi cam kết kết nối mọi người với các sân thể thao chất
                lượng, thúc đẩy lối sống năng động và khỏe mạnh cho cộng đồng.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-primary mr-2 mt-0.5" />
                  <span>Cung cấp trải nghiệm đặt sân dễ dàng, nhanh chóng</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-primary mr-2 mt-0.5" />
                  <span>
                    Đảm bảo chất lượng sân thể thao với hệ thống đánh giá minh
                    bạch
                  </span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-primary mr-2 mt-0.5" />
                  <span>
                    Hỗ trợ các chủ sân quản lý hiệu quả và tăng doanh thu
                  </span>
                </li>
              </ul>
            </div>

            <div className="bg-primary/5 p-8 rounded-lg">
              <div className="flex items-center mb-4">
                <div className="bg-primary/10 h-12 w-12 rounded-full flex items-center justify-center mr-4">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
                <h2 className="text-2xl font-bold">Tầm nhìn</h2>
              </div>
              <p className="text-muted-foreground mb-6">
                Trở thành nền tảng đặt sân thể thao hàng đầu Đông Nam Á, góp
                phần xây dựng cộng đồng thể thao năng động và kết nối.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-primary mr-2 mt-0.5" />
                  <span>
                    Mở rộng dịch vụ đến tất cả các tỉnh thành trên cả nước
                  </span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-primary mr-2 mt-0.5" />
                  <span>
                    Phát triển các tính năng mới như giải đấu, cộng đồng người
                    chơi
                  </span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-primary mr-2 mt-0.5" />
                  <span>Mở rộng ra các quốc gia trong khu vực Đông Nam Á</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Contact CTA */}
        <section className="bg-primary/5 p-12 rounded-lg text-center">
          <h2 className="text-3xl font-bold mb-4">Liên hệ với chúng tôi</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
            Bạn có câu hỏi hoặc đề xuất? Đừng ngần ngại liên hệ với chúng tôi.
            Đội ngũ Sport Booking luôn sẵn sàng hỗ trợ bạn.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <div className="flex items-center justify-center">
              <span className="font-medium">Địa chỉ:</span>
              <span className="ml-2 text-muted-foreground">
                55 Giải Phóng, Đồng Tâm, Hai Bà Trưng, Hà Nội
              </span>
            </div>
            <div className="flex items-center justify-center">
              <span className="font-medium">Email:</span>
              <a
                href="mailto:anhht17703@gmail.com"
                className="ml-2 text-primary hover:underline"
              >
                anhht17703@gmail.com
              </a>
            </div>
            <div className="flex items-center justify-center">
              <span className="font-medium">Điện thoại:</span>
              <a
                href="tel:0984292224"
                className="ml-2 text-primary hover:underline"
              >
                0984292224
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
