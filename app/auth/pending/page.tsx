import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

import PendingNotice from "./pending-notice";

export const metadata = {
  title: "Menunggu aktivasi — MVP Supply",
};

export default async function PendingPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect("/auth/sign-in");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { isActive: true },
  });

  if (user?.isActive) {
    redirect("/");
  }

  return (
    <PendingNotice name={session.user.name} email={session.user.email} />
  );
}
