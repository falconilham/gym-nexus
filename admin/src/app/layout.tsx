import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Sidebar from '@/components/Sidebar';
import "./globals.css";
import { Box } from "@mui/material";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GymNexus Admin",
  description: "Gym Administration Portal",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        style={{ margin: 0, padding: 0 }}
        suppressHydrationWarning
      >
        <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: '#0F0F0F' }}>
            <Sidebar />
             <Box component="main" sx={{ flex: 1, p: 4, backgroundColor: '#0F0F0F' }}>
                {children}
            </Box>
        </Box>
      </body>
    </html>
  );
}
