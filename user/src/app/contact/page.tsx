"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Mail, MapPin, Phone, Clock, Send, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Footer from "@/components/layout/Footer";

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 1500));

    toast({
      title: "Gửi tin nhắn thành công!",
      description: "Chúng tôi sẽ liên hệ với bạn trong thời gian sớm nhất.",
    });

    setIsSubmitting(false);
    // Reset form
    e.currentTarget.reset();
  };

  return (
    <>
      <main className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <section className="mb-16 text-center">
          <h1 className="text-4xl font-bold mb-4">Liên hệ với chúng tôi</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ bạn. Hãy liên hệ với
            chúng tôi qua các kênh dưới đây hoặc gửi tin nhắn trực tiếp.
          </p>
        </section>

        {/* Contact Info Cards */}
        <section className="mb-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6 flex flex-col items-center text-center">
                <div className="bg-primary/10 h-12 w-12 rounded-full flex items-center justify-center mb-4">
                  <MapPin className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Địa chỉ</h3>
                <p className="text-muted-foreground">
                  55 Giải Phóng, Đồng Tâm, Hai Bà Trưng, Hà Nội
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 flex flex-col items-center text-center">
                <div className="bg-primary/10 h-12 w-12 rounded-full flex items-center justify-center mb-4">
                  <Mail className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Email</h3>
                <a
                  href="mailto:anhht17703@gmail.com"
                  className="text-primary hover:underline"
                >
                  anhht17703@gmail.com
                </a>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 flex flex-col items-center text-center">
                <div className="bg-primary/10 h-12 w-12 rounded-full flex items-center justify-center mb-4">
                  <Phone className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Điện thoại</h3>
                <a
                  href="tel:0984292224"
                  className="text-primary hover:underline"
                >
                  0984292224
                </a>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 flex flex-col items-center text-center">
                <div className="bg-primary/10 h-12 w-12 rounded-full flex items-center justify-center mb-4">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Giờ làm việc</h3>
                <p className="text-muted-foreground">
                  Thứ 2 - Thứ 6: 8:00 - 18:00
                </p>
                <p className="text-muted-foreground">Thứ 7: 8:00 - 12:00</p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Contact Form and Map */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <h2 className="text-2xl font-bold mb-6">
              Gửi tin nhắn cho chúng tôi
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Họ và tên</Label>
                  <Input
                    id="name"
                    placeholder="Nhập họ và tên của bạn"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Nhập email của bạn"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Số điện thoại</Label>
                <Input id="phone" placeholder="Nhập số điện thoại của bạn" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="subject">Tiêu đề</Label>
                <Input
                  id="subject"
                  placeholder="Nhập tiêu đề tin nhắn"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Nội dung</Label>
                <Textarea
                  id="message"
                  placeholder="Nhập nội dung tin nhắn của bạn"
                  className="min-h-[150px]"
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Đang
                    gửi...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" /> Gửi tin nhắn
                  </>
                )}
              </Button>
            </form>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-6">Bản đồ</h2>
            <div className="relative h-[400px] rounded-lg overflow-hidden border">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1862.3714359403723!2d105.84178111058958!3d21.002941775641965!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3135ac773026b415%3A0x499b8b613889f78a!2zVHLGsOG7nW5nIMSQ4bqhaSBI4buNYyBYw6J5IEThu7FuZyBIw6AgTuG7mWkgLSBIVUNF!5e0!3m2!1svi!2s!4v1746204240900!5m2!1svi!2s"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>

            <div className="mt-6 bg-muted p-6 rounded-lg">
              <h3 className="font-semibold mb-4">Thông tin chi tiết</h3>
              <div className="space-y-3">
                <div className="flex items-start">
                  <MapPin className="h-5 w-5 text-primary mr-3 mt-0.5" />
                  <div>
                    <p className="font-medium">Trụ sở chính</p>
                    <p className="text-muted-foreground">
                      55 Giải Phóng, Đồng Tâm, Hai Bà Trưng, Hà Nội
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Phone className="h-5 w-5 text-primary mr-3 mt-0.5" />
                  <div>
                    <p className="font-medium">Hotline</p>
                    <p className="text-muted-foreground">
                      0984292224 (8:00 - 18:00)
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Mail className="h-5 w-5 text-primary mr-3 mt-0.5" />
                  <div>
                    <p className="font-medium">Email hỗ trợ</p>
                    <p className="text-muted-foreground">
                      anhht17703@gmail.com
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="mt-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Câu hỏi thường gặp</h2>
            <p className="text-muted-foreground max-w-3xl mx-auto">
              Dưới đây là một số câu hỏi thường gặp. Nếu bạn không tìm thấy câu
              trả lời cho câu hỏi của mình, vui lòng liên hệ với chúng tôi.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-2">Làm thế nào để đặt sân?</h3>
                <p className="text-muted-foreground">
                  Bạn có thể đặt sân bằng cách tìm kiếm sân phù hợp, chọn ngày
                  giờ và hoàn tất thanh toán trực tuyến hoặc tại sân.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-2">
                  Tôi có thể hủy đặt sân không?
                </h3>
                <p className="text-muted-foreground">
                  Có, bạn có thể hủy đặt sân trước 24 giờ so với thời gian đã
                  đặt và được hoàn tiền 100%.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-2">
                  Làm thế nào để đăng ký sân của tôi lên nền tảng?
                </h3>
                <p className="text-muted-foreground">
                  Chủ sân có thể đăng ký bằng cách liên hệ với chúng tôi qua
                  email hoặc hotline để được hướng dẫn chi tiết.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-2">
                  Các phương thức thanh toán được chấp nhận?
                </h3>
                <p className="text-muted-foreground">
                  Chúng tôi chấp nhận thanh toán qua thẻ ngân hàng, ví điện tử
                  (MoMo, ZaloPay), và thanh toán trực tiếp tại sân.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
