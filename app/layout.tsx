import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { ReactQueryProvider } from "@/src/lib/react-query/providers";
import "./globals.css";

// Optimized font loading with display swap for faster initial render
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap", // Show fallback font immediately
  preload: true, // Preload fonts
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap", // Show fallback font immediately
  preload: true, // Preload fonts
});

export const metadata: Metadata = {
  title: "Targetym AI - Gestion RH Intelligente",
  description: "Plateforme RH alimentée par l'IA pour les objectifs, le recrutement, la gestion de la performance et le développement de carrière",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Validate Clerk publishable key
  const clerkPublishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  
  if (!clerkPublishableKey) {
    console.error('❌ NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is missing. Please check your .env.local file.');
  }

  return (
    <ClerkProvider
      publishableKey={clerkPublishableKey}
      appearance={{
        baseTheme: undefined,
        variables: { colorPrimary: '#000000' }
      }}
      signInUrl="/auth/signin"
      signUpUrl="/auth/signup"
      afterSignInUrl="/dashboard"
      afterSignUpUrl="/dashboard"
      afterSignOutUrl="/"
    >
      <html lang="fr" suppressHydrationWarning>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased scroll-smooth`}
        >
          <a href="#main-content" className="skip-link">Aller au contenu</a>
          <ReactQueryProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              <div id="app-live-region" role="status" aria-live="polite" className="sr-only" />
              <main id="main-content" tabIndex={-1}>
                {children}
              </main>
              <Toaster richColors position="top-right" />
            </ThemeProvider>
          </ReactQueryProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
