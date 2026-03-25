import { redirect } from "next/navigation";
import { getSupabaseUser } from "@/lib/auth";
import { AuthPanel } from "./auth-panel";

export default async function LoginPage() {
  const user = await getSupabaseUser();
  if (user) redirect("/dashboard");

  return <AuthPanel />;
}
