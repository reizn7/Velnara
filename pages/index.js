import { useEffect } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/contexts/AuthContext";

// Root page - redirect based on role
export default function Home() {
  const router = useRouter();
  const { user, userRole, initializing } = useAuth();

  useEffect(() => {
    if (initializing) return;

    if (!user) {
      router.replace("/login");
      return;
    }

    switch (userRole) {
      case "shop":
        router.replace("/shop");
        break;
      case "admin":
        router.replace("/admin");
        break;
      default:
        router.replace("/user");
    }
  }, [user, userRole, initializing, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600" />
    </div>
  );
}
