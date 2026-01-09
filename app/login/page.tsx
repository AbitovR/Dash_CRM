"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { SignInFlo } from "@/components/ui/sign-in-flo";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string>("");
  const [allowSignUp, setAllowSignUp] = useState(false);

  // Check if any users exist - only allow signup if no users exist
  useEffect(() => {
    fetch("/api/auth/check-users")
      .then((res) => res.json())
      .then((data) => {
        setAllowSignUp(data.userCount === 0);
      })
      .catch(() => {
        // If check fails, don't allow signup
        setAllowSignUp(false);
      });
  }, []);

  const handleSignIn = async (email: string, password: string) => {
    try {
      setError("");
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to sign in");
        return;
      }

      // Cookie is already set by the API route, just redirect
      router.push("/");
      router.refresh();
    } catch (err) {
      setError("An error occurred. Please try again.");
      console.error("Sign in error:", err);
    }
  };

  const handleSignUp = async (email: string, password: string, name: string) => {
    try {
      setError("");
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to create account");
        return;
      }

      // Disable signup after first user is created
      setAllowSignUp(false);
      
      // Auto sign in after signup
      await handleSignIn(email, password);
    } catch (err) {
      setError("An error occurred. Please try again.");
      console.error("Sign up error:", err);
    }
  };

  return <SignInFlo onSignIn={handleSignIn} onSignUp={handleSignUp} error={error} allowSignUp={allowSignUp} />;
}

