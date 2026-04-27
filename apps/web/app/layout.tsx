import "./globals.css";
import { AppProviders } from "@/components/providers/app-providers";
import { Toaster } from "sonner";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-chat-bg text-ink antialiased h-screen overflow-hidden">
        <AppProviders>
          {children}
          <Toaster
            position="top-center"
            toastOptions={{
              style: {
                background: "rgba(255,255,255,0.18)",
                backdropFilter: "blur(28px) saturate(160%)",
                border: "1px solid rgba(255,255,255,0.35)",
                color: "#1c1d1f",
                borderRadius: "16px",
              },
            }}
          />
        </AppProviders>
      </body>
    </html>
  );
}
