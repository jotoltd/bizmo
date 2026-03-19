import { redirect } from "next/navigation";
import { getSupabaseSession } from "@/lib/auth";
import { AuthPanel } from "./auth-panel";

export default async function LoginPage() {
  const session = await getSupabaseSession();
  if (session) redirect("/dashboard");

  return <AuthPanel />;
}
