"use client";

import { usePathname } from "next/navigation";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/lib/firebase";
import BottomNav from "./BottomNav";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [user] = useAuthState(auth);

  const hideNavRoutes = ["/", "/login", "/register", "/forgot-password"];
  const hideNav = hideNavRoutes.includes(pathname) || !user;

  return (
    <>
      {children}
      {!hideNav && <BottomNav />}
    </>
  );
}
