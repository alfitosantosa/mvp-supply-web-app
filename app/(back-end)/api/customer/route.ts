// model Customer {
//   id            String    @id @default(cuid())
//   name          String
//   address       String
//   imageUrl      String?
//   phone         String
//   createdAt     DateTime  @default(now())
//   updatedAt     DateTime  @updatedAt
//   invoices invoice[]

import prisma from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function GET() {
  try {
    const customer = await prisma.customer.findMany();
    return Response.json({ customer });
  } catch (error) {
    console.error("Error fetching product:", error);
    return Response.json({ error: "Failed to fetch product" });
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, address, imageUrl, phone } = await request.json();
    const createCustomer = await prisma.customer.create({
      data: {
        name,
        address,
        imageUrl,
        phone,
      },
    });
    return Response.json({ createCustomer });
  } catch (error) {
    console.error("Error creating customer:", error);
    return Response.json({ error: "Failed to create customer" });
  } finally {
    await prisma.$disconnect();
  }
}

export async function PUT(reuquest: NextRequest) {
  try {
    const { id, name, address, imageUrl, phone } = await reuquest.json();

    const updateCustomer = await prisma.customer.update({
      where: { id },
      data: {
        name,
        address,
        imageUrl,
        phone,
      },
    });
    return Response.json({ updateCustomer });
  } catch (error) {
    console.error("Error updating customer:", error);
    return Response.json({ error: "Failed to update customer" });
  } finally {
    await prisma.$disconnect();
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();
    const deleteCustomer = await prisma.customer.delete({
      where: { id },
    });
    return Response.json({ deleteCustomer });
  } catch (error) {
    console.error("Error deleting customer:", error);
    return Response.json({ error: "Failed to delete customer" });
  } finally {
    await prisma.$disconnect();
  }
}
