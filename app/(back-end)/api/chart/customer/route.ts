import prisma from "@/lib/prisma";
import { unstable_cache } from "next/cache";
import { DB_CACHE_TAG } from "@/lib/cache";

const getChartCustomer = unstable_cache(
  () =>
    prisma.customer.findMany({
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
    }),
  ["chart-customer"],
  { revalidate: 300, tags: [DB_CACHE_TAG] },
);

export async function GET() {
  try {
    const customer = await getChartCustomer();
    return Response.json({ customer });
  } catch (error) {
    console.error("Error fetching customer chart:", error);
    return Response.json({ error: "Failed to fetch customer chart" });
  }
}
