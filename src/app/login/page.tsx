import { redirect } from "next/navigation";
import { getProfile } from "@/lib/auth";
import { AuthPanel } from "./auth-panel";

export default async function LoginPage() {
  const profile = await getProfile();
  if (profile) redirect("/dashboard");

  return <AuthPanel />;
}
