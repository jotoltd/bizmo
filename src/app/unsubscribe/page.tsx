import { notFound } from "next/navigation";
import UnsubscribePage from "./client";

type UnsubscribePageProps = {
  searchParams: Promise<{
    userId?: string;
    type?: string;
    token?: string;
  }>;
};

export default async function Unsubscribe({ searchParams }: UnsubscribePageProps) {
  const query = await searchParams;
  
  if (!query.userId || !query.type || !query.token) {
    notFound();
  }

  return (
    <UnsubscribePage
      userId={query.userId}
      emailType={query.type}
      token={query.token}
    />
  );
}
