// model User {
//   id            String    @id @unique
//   name          String
//   email         String    @unique
//   emailVerified Boolean
//   isActive      Boolean   @default(false)
//   image         String?
//   createdAt     DateTime  @default(now())
//   updatedAt     DateTime  @updatedAt
//   banExpires    DateTime?
//   banReason     String?
//   banned        Boolean?  @default(false)
//   role          String?   @default("user")
//   isActice      Boolean?  @default(false)
//   accounts      Account[]
//   sessions      Session[]

//   @@map("user")
// }

import { revalidateTag, unstable_cache } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { DB_CACHE_TAG } from "@/lib/cache";

const getUsers = unstable_cache(() => prisma.user.findMany(), ["users"], {
  // Shorter than the rest: sign-ups arrive through /api/auth, not through a
  // route that purges DB_CACHE_TAG.
  revalidate: 60,
  tags: [DB_CACHE_TAG],
});

export async function GET() {
  try {
    const users = await getUsers();
    return NextResponse.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, name, email, isActive } = await request.json();
    const updateUser = await prisma.user.update({
      where: { id },
      data: { name, email, isActive },
    });
    revalidateTag(DB_CACHE_TAG, { expire: 0 });
    return NextResponse.json(updateUser);
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 },
    );
  }
}

