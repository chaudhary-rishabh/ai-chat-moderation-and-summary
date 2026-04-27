import "./globals.css";
import { AppProviders } from "@/components/providers/app-providers";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-chat-bg text-white antialiased h-screen overflow-hidden">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
