import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import Sidebar from "@/components/Sidebar";

export const metadata: Metadata = {
  title: "Caravan Transport CRM",
  description: "Customer Relationship Management for Caravan Transport",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider defaultTheme="system" storageKey="caravan-crm-theme">
          <Sidebar />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}

