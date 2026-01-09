"use client";

import { usePathname } from "next/navigation";
import { useAuth } from "./AuthProvider";
import Sidebar from "./Sidebar";

export default function ConditionalSidebar() {
  const pathname = usePathname();
  const { user } = useAuth();

  // Don't show sidebar on login page or public signing pages
  if (pathname === "/login" || pathname?.startsWith("/sign")) {
    return null;
  }

  // Only show sidebar if user is authenticated
  if (!user) {
    return null;
  }

  return <Sidebar />;
}

