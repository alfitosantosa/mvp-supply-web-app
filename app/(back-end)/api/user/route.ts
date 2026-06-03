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

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const users = await prisma.user.findMany();
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
    return NextResponse.json(updateUser);
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 },
    );
  }
}

