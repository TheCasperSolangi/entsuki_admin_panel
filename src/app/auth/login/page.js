// app/(auth)/page.js
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ShoppingBag } from "lucide-react";

export default function AuthPage() {
  const router = useRouter();

  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ type: "", message: "" });

  // Common fields
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");

  // SignUp additional fields
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [addresses, setAddresses] = useState("");
  const [userType, setUserType] = useState("user");

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setAlert({ type: "", message: "" });

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emailOrUsername, password }), // updated here
      });

      const data = await res.json();
      setLoading(false);

      if (res.ok) {
        Cookies.set("token", data.token, { expires: 1 });
        router.push("/dashboard");
      } else {
        setAlert({ type: "error", message: data.message || "Invalid credentials" });
      }
    } catch (err) {
      setLoading(false);
      setAlert({ type: "error", message: "Something went wrong!" });
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setAlert({ type: "", message: "" });

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          full_name: fullName,
          addresses: [addresses],
          user_type: userType,
        }),
      });

      const data = await res.json();
      setLoading(false);

      if (res.ok) {
        Cookies.set("token", data.token, { expires: 1 });
        router.push("/dashboard");
      } else {
        setAlert({ type: "error", message: data.message || "Sign up failed" });
      }
    } catch (err) {
      setLoading(false);
      setAlert({ type: "error", message: "Something went wrong!" });
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left Panel */}
      <div className="flex-1 bg-red-600 text-white flex flex-col justify-center items-center p-12">
        <h1 className="text-5xl font-bold mb-4">ShopEase</h1>
        <ShoppingBag className="w-24 h-24 mb-4" />
        <h2 className="text-4xl font-semibold mb-2">{isLogin ? "Welcome Back" : "Join Us"}</h2>
        <p className="text-lg max-w-xs text-center">
          {isLogin
            ? "Enter your credentials to access your account and continue your shopping journey."
            : "Create an account to start your shopping experience with us."}
        </p>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex flex-col justify-center items-center p-12 bg-gray-50">
        <div className="w-full max-w-md bg-white shadow-xl rounded-2xl p-8">
          <h2 className="text-3xl font-semibold mb-6 text-center">{isLogin ? "Sign In" : "Sign Up"}</h2>

          {/* Alert */}
          {alert.message && (
            <Alert variant={alert.type === "error" ? "destructive" : "default"} className="mb-4">
              <AlertTitle>{alert.type === "error" ? "Error" : "Success"}</AlertTitle>
              <AlertDescription>{alert.message}</AlertDescription>
            </Alert>
          )}

          {/* Form */}
          <form onSubmit={isLogin ? handleLogin : handleSignUp} className="space-y-4">
            {!isLogin && (
              <>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="Enter your email"
                  />
                </div>
                <div>
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    placeholder="Enter your full name"
                  />
                </div>
                <div>
                  <Label htmlFor="addresses">Address</Label>
                  <Input
                    id="addresses"
                    type="text"
                    value={addresses}
                    onChange={(e) => setAddresses(e.target.value)}
                    required
                    placeholder="Enter your address"
                  />
                </div>
              </>
            )}
            <div>
              <Label htmlFor="emailOrUsername">{isLogin ? "Email or Username" : "Username"}</Label>
              <Input
                id="emailOrUsername"
                type="text"
                value={emailOrUsername}
                onChange={(e) => setEmailOrUsername(e.target.value)}
                required
                placeholder={isLogin ? "Enter your email or username" : "Enter your username"}
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter your password"
              />
            </div>
            <Button type="submit" className="w-full mt-4" disabled={loading}>
              {loading ? (isLogin ? "Signing In..." : "Signing Up...") : isLogin ? "Sign In" : "Sign Up"}
            </Button>
          </form>

          {/* Toggle link */}
          <p className="text-sm text-gray-500 mt-4 text-center">
            {isLogin ? (
              <>
                Don&apos;t have an account?{" "}
                <button className="text-red-600 font-medium" onClick={() => setIsLogin(false)}>
                  Sign Up
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button className="text-red-600 font-medium" onClick={() => setIsLogin(true)}>
                  Sign In
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
