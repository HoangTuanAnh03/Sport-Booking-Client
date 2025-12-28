import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";
import Header from "@/components/header/header";
import { Toaster } from "@/components/ui/toaster";
import AppProvider from "@/components/app-provider";
import RefreshToken from "@/components/refresh-token";

const inter = Inter({ subsets: ["vietnamese"] });

export const metadata: Metadata = {
  title: "Admin - Sport Booking",
  description: "Admin - Sport Booking",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className}`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <AppProvider>
            {/* <Header /> */}
            <Toaster />
            {children}
            <RefreshToken />
          </AppProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
