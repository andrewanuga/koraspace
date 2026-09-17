import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { PreferencesProvider } from "@/components/preferences/PreferencesProvider";
import { ToastProvider } from "@/components/ui/toast";
import { ImpersonationBanner } from "@/components/admin/ImpersonationBanner";

import { LanguageProvider } from "@/components/i18n/LanguageProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
<<<<<<< HEAD
  title: "Koraspace AI - Your Personal Social Agent",
=======
  title: "Koraspace - Your Personal Social Agent",
>>>>>>> main
  description:
    "Social, understood. Deploy an AI agent that creates, engages, and converts around the clock - powered by Llama 3.3 70B.",
  keywords: [
    "social media management",
    "AI content creation",
    "social media scheduling",
    "AI agents",
    "content calendar",
    "social media analytics",
    "Nigeria",
    "Africa",
  ],
  icons: {
    icon: "/logo.png",
  },
  openGraph: {
<<<<<<< HEAD
    title: "Koraspace AI - AI-Powered Social Media Manager",
    description:
      "Stop managing social media. Start delegating it. Koraspace AI deploys autonomous AI agents that create content, engage followers, and convert leads 24/7.",
=======
    title: "Koraspace - AI-Powered Social Media Manager",
    description:
      "Stop managing social media. Start delegating it. Koraspace deploys autonomous AI agents that create content, engage followers, and convert leads 24/7.",
>>>>>>> main
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} sai-js h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <link
          rel="stylesheet"
          href="https://api.fontshare.com/v2/css?f[]=general-sans@400,500,600,700&display=swap"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&family=IBM+Plex+Sans:ital,wght@0,300..700;1,300..700&family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&family=Manrope:wght@300..800&family=Plus+Jakarta+Sans:ital,wght@0,300..800;1,300..800&family=Space+Grotesk:wght@300..700&display=swap"
        />
      </head>
      <body className="min-h-full flex flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <PreferencesProvider>
            <LanguageProvider>
              <ToastProvider>
                <ImpersonationBanner />
                {children}
              </ToastProvider>
            </LanguageProvider>
          </PreferencesProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
