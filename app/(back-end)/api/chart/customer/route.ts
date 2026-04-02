import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const customer = await prisma.customer.findMany({
      include: {
        invoices: {
          select: {
            id: true,
            totalAmount: true,
            status: true,
            issuedAt: true,
          },
        },
        _count: {
          select: {
            invoices: true,
          },
        },
      },
    });
    return Response.json({ customer });
  } catch (error) {
    console.error("Error fetching customer chart:", error);
    return Response.json({ error: "Failed to fetch customer chart" });
  } finally {
    await prisma.$disconnect();
  }
}
