import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "What Is Your Home Worth? | Free Home Value Estimate",
  description:
    "Get a free, no-obligation home value estimate from a local real estate expert. No algorithms, just personalized market analysis for Charlotte homeowners.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="font-sans antialiased bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100">
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
