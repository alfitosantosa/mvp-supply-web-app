// model Product {
//   id           String        @id @default(cuid())
//   name         String
//   price        Decimal       @default(0)
//   description  String?
//   createdAt    DateTime      @default(now())
//   updatedAt    DateTime      @updatedAt
//   stock        Decimal       @default(1)
//   imageUrl     String?
//   total        Decimal?      @default(0)
//   invoiceItems InvoiceItem[]

//   @@map("products")
// }

import prisma from "@/lib/prisma";
import { revalidateTag, unstable_cache } from "next/cache";
import { NextRequest } from "next/server";
import { DB_CACHE_TAG } from "@/lib/cache";

const getProducts = unstable_cache(
  () =>
    prisma.product.findMany({
      orderBy: {
        updatedAt: "desc",
      },
    }),
  ["products"],
  { revalidate: 300, tags: [DB_CACHE_TAG] },
);

export async function GET() {
  try {
    const product = await getProducts();
    return Response.json({ product });
  } catch (error) {
    console.error("Error fetching product:", error);
    return Response.json({ error: "Failed to fetch product" });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, price, description, stock, imageUrl } = await request.json();
    const createProduct = await prisma.product.create({
      data: {
        name,
        price,
        imageUrl,
        description,
        stock,
        total: price * stock,
      },
    });
    revalidateTag(DB_CACHE_TAG, { expire: 0 });
    return Response.json({ createProduct });
  } catch (error) {
    console.error("Error creating product:", error);
    return Response.json({ error: "Failed to create product" });
  }
}

export async function PUT(reuquest: NextRequest) {
  try {
    const { id, name, price, description, stock, imageUrl } =
      await reuquest.json();

    const updateProduct = await prisma.product.update({
      where: { id },
      data: {
        name,
        price,
        description,
        stock,
        imageUrl,
        total: price * stock,
      },
    });
    revalidateTag(DB_CACHE_TAG, { expire: 0 });
    return Response.json({ updateProduct });
  } catch (error) {
    console.error("Error updating product:", error);
    return Response.json({ error: "Failed to update product" });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();
    const deleteProduct = await prisma.product.delete({
      where: { id },
    });
    revalidateTag(DB_CACHE_TAG, { expire: 0 });
    return Response.json({ deleteProduct });
  } catch (error) {
    console.error("Error deleting product:", error);
    return Response.json({ error: "Failed to delete product" });
  }
}
