import "./globals.css";
import { Providers } from "@/components/providers/Providers";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Glass Chat Admin",
  description: "Admin dashboard for Glass Chat",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
