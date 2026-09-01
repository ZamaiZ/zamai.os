import { Geist_Mono, Inter } from "next/font/google"
import type { Metadata, Viewport } from "next"

import "./globals.css"
import { ThemeProvider } from "@/components/layout/ThemeProvider"
import { Toaster } from "@/components/primitives/toast"
import { cn } from "@/lib/utils"
import { PwaProvider } from "@/components/pwa/PwaProvider"

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export const metadata: Metadata = {
  title: {
    default: "Zamai.OS",
    template: "%s | Zamai.OS",
  },
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false },
  },
}

export const viewport: Viewport = {
  themeColor: "#247e8c",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="pt-BR"
      suppressHydrationWarning
      className={cn(
        "antialiased",
        fontMono.variable,
        "font-sans",
        inter.variable
      )}
    >
      <body suppressHydrationWarning>
        <ThemeProvider>
          <PwaProvider>
          {children}
          <Toaster />
          </PwaProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
