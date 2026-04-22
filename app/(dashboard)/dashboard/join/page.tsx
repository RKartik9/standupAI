import { connection } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { JoinTeamForm } from "@/components/dashboard/join-team-form";

export default async function JoinPage(props: {
  searchParams: Promise<{ code?: string }>;
}) {
  await connection();
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const searchParams = await props.searchParams;
  const code = searchParams.code ?? "";

  return (
    <div
      className="flex min-h-screen items-center justify-center px-4"
      style={{ background: "var(--bg)" }}
    >
      <JoinTeamForm code={code} />
    </div>
  );
}
