import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { AuthProvider } from "../context/authContext";
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen "><AuthProvider>{children}</AuthProvider></body>
    </html>
  )
}