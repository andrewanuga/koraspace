"use server";

import { prisma } from "@/lib/db";
import { auth } from "@/auth";

export async function getUserWorkspaces() {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
  
  const profile = await prisma.profile.findUnique({
    where: { id: session.user.id },
    select: { persona: true, plan: true }
  });
  
  // Create a default workspace since we don't have a workspaces table mapped yet
  const defaultWorkspace = {
    id: "default",
    name: "My Workspace",
    role: "owner"
  };
  
  return {
    workspaces: [defaultWorkspace],
    persona: profile?.persona || "creator",
    plan: profile?.plan || "free"
  };
}

export async function updateUserPersona(newPersona: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
  
  await prisma.profile.update({
    where: { id: session.user.id },
    data: { persona: newPersona }
  });
  return true;
}
