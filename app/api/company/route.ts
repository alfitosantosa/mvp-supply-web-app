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

import prisma from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function GET(){
   try {
   const GetInvoice = await prisma.company.findMany()
   return Response.json(GetInvoice)
   }catch (error){
       return Response.json(error)
   }

}

export async function POST(request : NextRequest){
try{
const { name, brandName, address, email, phone, bankName, bankAccount, senderName,senderTitle  } = await request.json()
   const createCompany = await prisma.company.create({
    data:{
        name,
        brandName,
        address,
        email,
        phone,
        bankName,
        bankAccount,
        senderName,
        senderTitle,
    }
   })
   return Response.json(createCompany)        
}catch(error){
   return Response.json(error)
}

}

export async function PUT(request: NextRequest){
  try {
    const { id, name, brandName, address, email, phone, bankName, bankAccount, senderName,senderTitle  } = await request.json()

    const updateCompany = await prisma.company.update({
        where: { id },
        data: {
          name,
          brandName,
          address,
          email,
          phone,
          bankName,
          bankAccount,
          senderName,
          senderTitle,
        }
    })
    return Response.json(updateCompany)
  } catch(error) {
    return Response.json(error)
  }
}

export async function DELETE(request:NextRequest){
   try {
      const {id} = await request.json()

      const DeleteCompany = await prisma.company.delete({
         where: {id}
      })
      return Response.json(DeleteCompany)
   } catch(error) {
      return Response.json(error)
   }
}

