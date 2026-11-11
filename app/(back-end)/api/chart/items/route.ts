import prisma from "@/lib/prisma";
import { unstable_cache } from "next/cache";
import { DB_CACHE_TAG } from "@/lib/cache";

const getChartItems = unstable_cache(
  () =>
    prisma.invoiceItem.findMany({
      include: {
        invoice: true,
        product: true,
      },
      where: {
        invoice: {
          status: "PAID",
        },
      },
    }),
  ["chart-items"],
  { revalidate: 300, tags: [DB_CACHE_TAG] },
);

export async function GET() {
  const chartItems = await getChartItems();
  return Response.json(chartItems);
}
