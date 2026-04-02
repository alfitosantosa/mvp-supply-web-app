// model invoice {
//   id            String    @id @default(cuid())
//   invoiceNumber String    @unique
//   issuedAt      DateTime  @default(now())
//   dueDate       DateTime
//   companyId     String
//   customerId    String
//   subTotal      Decimal   @default(0)
//   discountRate  Float     @default(0)
//   discountValue Decimal   @default(0)
//   totalAmount   Decimal   @default(0)
//   totalInWords  String
//   status        String    @default("DRAFT")
//   createdAt     DateTime  @default(now())
//   updatedAt     DateTime  @updatedAt
//   company       Company   @relation(fields: [companyId], references: [id])
//   customer      Customer  @relation(fields: [customerId], references: [id])

//   items         InvoiceItem[]

//   @@map("invoices")
// }

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

import prisma from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function GET() {
  try {
    const getInvoice = await prisma.invoice.findMany({
      include: {
        items: {
          include: {
            product: true,
          },
        },
        company: true,
        customer: true,
        _count: {
          select: {
            items: true,
          },
        },
      },
    });
    return new Response(JSON.stringify(getInvoice));
  } catch (error) {
    return new Response(`Failed to fetch ${error}`);
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(request: NextRequest) {
  try {
    const {
      invoiceNumber,
      issuedAt,
      dueDate,
      companyId,
      customerId,
      subTotal,
      discountRate,
      discountValue,
      totalAmount,
      totalInWords,
      status,
    } = await request.json();

    const createInvoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        issuedAt,
        dueDate,
        companyId,
        customerId,
        subTotal,
        discountRate,
        discountValue,
        totalAmount,
        totalInWords,
        status,
      },
    });
    return new Response(JSON.stringify(createInvoice));
  } catch (error) {
    return new Response(`Failed to create ${error}`);
  } finally {
    await prisma.$disconnect();
  }
}

export async function PUT(request: NextRequest) {
  const {
    id,
    invoiceNumber,
    issuedAt,
    dueDate,
    companyId,
    customerId,
    subTotal,
    discountRate,
    discountValue,
    totalAmount,
    totalInWords,
    status,
  } = await request.json();
  try {
    const createInvoice = await prisma.invoice.update({
      where: {
        id,
      },
      data: {
        invoiceNumber,
        issuedAt,
        dueDate,
        companyId,
        customerId,
        subTotal,
        discountRate,
        discountValue,
        totalAmount,
        totalInWords,
        status,
      },
    });
    return new Response(JSON.stringify(createInvoice));
  } catch (Error) {
    return new Response(`Failed to update ${Error}`);
  } finally {
    await prisma.$disconnect;
  }
}

export async function DELETE(request: NextRequest) {
  const { id } = await request.json();
  try {
    const deleteInvoice = await prisma.invoice.delete({
      where: {
        id,
      },
    });
    return new Response(JSON.stringify(deleteInvoice));
  } catch (error) {
    return new Response(`Failed to delete ${error}`);
  } finally {
    await prisma.$disconnect();
  }
}
