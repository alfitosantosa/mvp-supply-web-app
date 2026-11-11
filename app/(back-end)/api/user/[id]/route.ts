import prisma from "@/lib/prisma";
import { unstable_cache } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { DB_CACHE_TAG } from "@/lib/cache";

const getUserById = unstable_cache(
  (id: string) => prisma.user.findMany({ where: { id } }),
  ["user"],
  { revalidate: 300, tags: [DB_CACHE_TAG] },
);

//get user by id
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const users = await getUserById(id);
    return NextResponse.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 },
    );
  }
}
