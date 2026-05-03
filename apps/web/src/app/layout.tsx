import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { FileManagerProvider } from "@/context/FileManagerContext";
import { AuthProvider } from "@/context/AuthContext";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SmartWrite - 智能写作平台",
  description: "支持多人实时协作的智能写作平台",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <AuthProvider>
          <FileManagerProvider>
            {children}
          </FileManagerProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
