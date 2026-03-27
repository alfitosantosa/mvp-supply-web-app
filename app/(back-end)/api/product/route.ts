// model Product {
//   id          String   @id @default(cuid())
//   name        String
//   price       Decimal  @default(0)
//   description String?
//   createdAt   DateTime @default(now())
//   updatedAt   DateTime @updatedAt

//   invoiceItems InvoiceItem[]

//   @@map("products")
// }

import prisma from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function GET() {
  try {
    const product = await prisma.product.findMany();
    return Response.json({ product });
  } catch (error) {
    console.error("Error fetching product:", error);
    return Response.json({ error: "Failed to fetch product" });
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, price, description, stock } = await request.json();
    const createProduct = await prisma.product.create({
      data: {
        name,
        price,
        description,
        stock,
        total: price * stock,
      },
    });
    return Response.json({ createProduct });
  } catch (error) {
    console.error("Error creating product:", error);
    return Response.json({ error: "Failed to create product" });
  } finally {
    await prisma.$disconnect();
  }
}

export async function PUT(reuquest: NextRequest) {
  try {
    const { id, name, price, description, stock } = await reuquest.json();

    const updateProduct = await prisma.product.update({
      where: { id },
      data: {
        name,
        price,
        description,
        stock,
        total: price * stock,
      },
    });
    return Response.json({ updateProduct });
  } catch (error) {
    console.error("Error updating product:", error);
    return Response.json({ error: "Failed to update product" });
  } finally {
    await prisma.$disconnect();
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();
    const deleteProduct = await prisma.product.delete({
      where: { id },
    });
    return Response.json({ deleteProduct });
  } catch (error) {
    console.error("Error deleting product:", error);
    return Response.json({ error: "Failed to delete product" });
  } finally {
    await prisma.$disconnect();
  }
}
