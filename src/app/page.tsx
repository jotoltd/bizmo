import { redirect } from "next/navigation";
import { getSupabaseSession } from "@/lib/auth";

export default async function Home() {
  const session = await getSupabaseSession();
  if (!session) redirect("/login");
  redirect("/dashboard");
}
