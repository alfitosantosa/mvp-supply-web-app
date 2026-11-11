// model InvoiceItem {
//   id          String   @id @default(cuid())
//   invoiceId   String
//   productId   String
//   description String?
//   price       Decimal
//   quantity    Int
//   total       Decimal
//   createdAt   DateTime @default(now())
//   updatedAt   DateTime @updatedAt
//   imageUrl    String?
//   productName String?
//   invoice     invoice  @relation(fields: [invoiceId], references: [id], onDelete: Cascade)
//   product     Product  @relation(fields: [productId], references: [id])
//   @@map("invoice_items")
// }

import prisma from "@/lib/prisma";
import { revalidateTag, unstable_cache } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { DB_CACHE_TAG } from "@/lib/cache";

const getInvoiceItems = unstable_cache(
  () =>
    prisma.invoiceItem.findMany({
      include: {
        product: true,
        invoice: true,
      },
    }),
  ["invoice-items"],
  { revalidate: 300, tags: [DB_CACHE_TAG] },
);

export async function GET() {
  const invoiceItems = await getInvoiceItems();
  return Response.json(invoiceItems);
}

//post for create invoice items from products

export async function POST(request: NextRequest) {
  const { invoiceItems } = await request.json();

  const CreateInvoiceItems = await prisma.invoiceItem.createMany({
    data: invoiceItems.map(({ productName, ...item }: any) => item),
  });

  revalidateTag(DB_CACHE_TAG, { expire: 0 });
  return NextResponse.json(CreateInvoiceItems);
}

//put when update invoice Items

export async function PUT(request: NextRequest) {
  const { invoiceItems } = await request.json();

  const UpdateInvoiceItems = await prisma.invoiceItem.updateMany({
    data: invoiceItems,
  });

  revalidateTag(DB_CACHE_TAG, { expire: 0 });
  return NextResponse.json(UpdateInvoiceItems);
}

//delete when delete invoiceItems in invoice
export async function DELETE(request: NextRequest) {
  const { invoiceItems } = await request.json();

  const DeleteInvoiceItems = await prisma.invoiceItem.deleteMany({
    where: {
      id: {
        in: invoiceItems.map((item: any) => item.id),
      },
    },
  });

  revalidateTag(DB_CACHE_TAG, { expire: 0 });
  return NextResponse.json(DeleteInvoiceItems);
}
