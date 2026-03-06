// model Company {
//   id        String    @id @default(cuid())
//   name      String    // Contoh: PT Multi Visi Primakreasi
//   brandName String    // Contoh: mvpsupply.id
//   address   String    // Jl. Cikatomas II No. 18...
//   email     String
//   phone     String
//   bankName  String    // BCA
//   bankAccount String  // 001-669-6999
//   senderName  String  // Vici Herlambang
//   senderTitle String  // Co-Founder
//   invoices  Invoice[]
// }

export interface companyForm {
  name: string;
  brandName: string;
  address: string;
  email: string;
  phone: string;
  bankName: string;
  bankAccount: string;
  senderName: string;
  senderTitle: string;
}

export interface companyData extends companyForm {
  id: string;
}
