import type { Metadata } from "next";
import CommandPalette from "@/components/command-palette";
import "./globals.css";

export const metadata: Metadata = {
  title: "SCOUT — Client Intelligence",
  description: "Client intelligence for Studio Gayas",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
        <CommandPalette />
      </body>
    </html>
  );
}