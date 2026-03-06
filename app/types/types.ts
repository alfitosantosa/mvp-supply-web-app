// model Product {
//   id          String   @id @default(cuid())
//   name        String
//   price       Decimal  @default(0)
//   description String?
//   imageUrl    String?
//   stock       Decimal  @default(1)
//   total       Decimal
//   createdAt   DateTime @default(now())
//   updatedAt   DateTime @updatedAt

//   invoiceItems InvoiceItem[]

//   @@map("products")
// }

// product
export interface productForm {
  name: string;
  price: number;
  description?: string;
  imageUrl?: string;
  stock: number;
}

export interface ProductData extends productForm {
  id: string;
}

// invoice Items
export interface invoiceItemsData {
  id: string;
  invoiceId: string;
  productId: string;
  imageUrl: string;
  description: string;
  price: number;
  quantity: number;
  total: number;
  createdAt: Date;
  updatedAt: Date;
  product?: ProductData[];
}
