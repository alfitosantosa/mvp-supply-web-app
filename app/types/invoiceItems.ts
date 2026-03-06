// // model InvoiceItem {
// //   id          String   @id @default(cuid())
// //   invoiceId   String
// //   productId   String
// //   imageUrl    String?
// //   description String?
// //   price       Decimal
// //   quantity    Int
// //   total       Decimal
// //   invoice     invoice @relation(fields: [invoiceId], references: [id], onDelete: Cascade)
// //   product     Product @relation(fields: [productId], references: [id])
// //   createdAt   DateTime @default(now())
// //   updatedAt   DateTime @updatedAt

// //   @@map("invoice_items")
// // }

// export interface invoiceItemsData {
//   id: string;
//   invoiceId: string;
//   productId: string;
//   imageUrl: string;
//   description: string;
//   price: number;
//   quantity: number;
//   total: number;
//   createdAt: Date;
//   updatedAt: Date;
//   product?: ProductData[];
// }
