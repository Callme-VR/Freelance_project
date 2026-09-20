import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CertGen — Certificate Management System",
  description:
    "Upload Excel files, generate professional PDF certificates in bulk, and manage your certificate batches with ease.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
