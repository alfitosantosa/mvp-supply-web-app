// model Invoice {
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
//   items         product[]

import prisma from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function GET() {
  try {
    const getInvoice = await prisma.invoice.findMany();
    return new Response(JSON.stringify(getInvoice));
  } catch (error) {
    return new Response(`Failed to fetch ${error}`);
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
  }
}
