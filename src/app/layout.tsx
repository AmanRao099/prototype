import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { THEME_INIT_SCRIPT } from "@/components/layout/theme-toggle";
import { APP_CONFIG } from "@/lib/config";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: APP_CONFIG.productName,
    template: `%s - ${APP_CONFIG.productName}`,
  },
  description:
    "Accounts, inventory and common system modules: Phase 1 MVP front end for the ERP delivery proposal.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} h-full`} suppressHydrationWarning>
      <head>
        {/* applies a stored theme before first paint */}
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="min-h-full antialiased">{children}</body>
    </html>
  );
}
