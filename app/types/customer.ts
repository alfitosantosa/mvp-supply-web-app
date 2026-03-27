// model Customer {
//   id            String    @id @default(cuid())
//   name          String
//   address       String
//   imageUrl      String?
//   phone         String
//   createdAt     DateTime  @default(now())
//   updatedAt     DateTime  @updatedAt
//   invoices invoice[]

export interface CustomerForm {
  name: string;
  address: string;
  phone: string;
  imageUrl?: string;
}

export interface CustomerData extends CustomerForm {
  id: string;
  createdAt: string;
  updatedAt: string;
}
