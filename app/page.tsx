import { auth } from "../lib/auth";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const session = await auth();

  if (!session) {
    redirect("/auth/login");
  }

  // Ensure user role exists
  if (!session.user?.role) {
    // Default to user role if not set
    redirect("/sales");
  }

  // Redirect based on role
  if (session.user.role === "admin") {
    redirect("/admin");
  } else {
    redirect("/sales");
  }
}
