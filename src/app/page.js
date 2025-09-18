"use client";

import Image from "next/image";
import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "../context/authContext"; // adjust path if needed

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Skip auth check for transaction verification route
    if (pathname.startsWith("/transactions/verification/")) {
      return;
    }

    if (!loading) {
      if (user) {
        router.push("/dashboard");
      } else {
        router.push("/auth/login");
      }
    }
  }, [user, loading, router, pathname]);

  // Optionally, show nothing or a loading indicator while checking auth
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>Checking authentication...</p>
      </div>
    );
  }

  return null; // this will not render anything because redirect happens
}