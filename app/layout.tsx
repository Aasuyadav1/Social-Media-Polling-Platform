import type { Metadata } from "next";
import {Inter,Open_Sans} from 'next/font/google'
import "./globals.css";
import Topbar from "@/components/molecules/navigation/Topbar";
import { auth } from "@/auth"
import { SessionProvider } from "next-auth/react"

export const metadata: Metadata = {
  title: "PollVerse",
  description: "Create and share polls with the world",
};

const inter = Inter({ subsets: ["latin"] });
const openSans = Open_Sans({
  subsets: ["latin"],
  display: "swap",
});

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  
  return (
    <html lang="en">
      <body className={`${inter.className} ${openSans.className} antialiased`}>
        <SessionProvider session={session}>
          <Topbar/>
          <main className="relative top-4 px-2 md:px-8 ">
            {children}
          </main>
        </SessionProvider>
      </body>
    </html>
  );
}
