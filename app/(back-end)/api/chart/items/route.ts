import prisma from "@/lib/prisma";

export async function GET() {
  const getChartItems = await prisma.invoiceItem.findMany({
    include: {
      invoice: true,
      product: true,
    },
    where: {
      invoice: {
        status: "PAID",
      },
    },
  });

  return Response.json(getChartItems);
}
