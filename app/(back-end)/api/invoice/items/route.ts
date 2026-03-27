// model InvoiceItem {
//   id          String   @id @default(cuid())
//   invoiceId   String
//   productId   String
//   imageUrl    String?
//   description String?
//   price       Decimal
//   quantity    Int
//   total       Decimal
//   invoice     invoice @relation(fields: [invoiceId], references: [id], onDelete: Cascade)
//   product     Product @relation(fields: [productId], references: [id])
//   createdAt   DateTime @default(now())
//   updatedAt   DateTime @updatedAt

//   @@map("invoice_items")
// }

// model Product {
//   id          String   @id @default(cuid())
//   name        String
//   price       Decimal  @default(0)
//   description String?
//   imageUrl    String?
//   stock       Decimal  @default(1)
//   total       Decimal?  @default(0)
//   createdAt   DateTime @default(now())
//   updatedAt   DateTime @updatedAt

//   invoiceItems InvoiceItem[]

//   @@map("products")
// }

//crud for invoice items

import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const invoiceItems = await prisma.invoiceItem.findMany({
    include: {
      product: true,
      invoice: true,
    },
  });
  return Response.json(invoiceItems);
}

//post for create invoice items from products

export async function POST(request: NextRequest) {
  const { invoiceItems } = await request.json();

  const CreateInvoiceItems = await prisma.invoiceItem.createMany({
    data: invoiceItems,
  });

  return NextResponse.json(CreateInvoiceItems);
}

//put when update invoice Items

export async function PUT(request: NextRequest) {
  const { invoiceItems } = await request.json();

  const UpdateInvoiceItems = await prisma.invoiceItem.updateMany({
    data: invoiceItems,
  });

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

  return NextResponse.json(DeleteInvoiceItems);
}
