import prisma from "@/lib/prisma";
import { monthLabel } from "@/lib/format";

export const STATUS_FILTERS = ["ALL", "PAID", "SENT", "DRAFT"] as const;
export type StatusFilter = (typeof STATUS_FILTERS)[number];

export type MonthPoint = {
  month: string;
  label: string;
  revenue: number;
  invoices: number;
  items: number;
  growth: number | null;
};

export type ClientRow = {
  id: string;
  name: string;
  revenue: number;
  invoices: number;
  items: number;
  average: number;
  lastOrder: string | null;
  share: number;
};

export type ProductRow = {
  id: string;
  name: string;
  revenue: number;
  quantity: number;
  invoices: number;
};

export type DashboardTotals = {
  revenue: number;
  invoices: number;
  items: number;
  averageInvoice: number;
  activeClients: number;
  totalClients: number;
  growth: number | null;
  latestMonth: MonthPoint | null;
  previousMonth: MonthPoint | null;
  bestMonth: MonthPoint | null;
};

export type DashboardData = {
  from: string;
  to: string;
  status: StatusFilter;
  months: MonthPoint[];
  clients: ClientRow[];
  products: ProductRow[];
  totals: DashboardTotals;
};

type RawMonth = {
  month: string;
  invoices: number;
  revenue: number;
  items: number;
};

type RawClient = {
  id: string;
  name: string;
  invoices: number;
  revenue: number;
  items: number;
  lastOrder: string | null;
};

type RawProduct = {
  id: string;
  name: string;
  quantity: number;
  revenue: number;
  invoices: number;
};

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export async function getDashboardData(params: {
  from?: string;
  to?: string;
  status?: string;
}): Promise<DashboardData> {
  const status = STATUS_FILTERS.includes(params.status as StatusFilter)
    ? (params.status as StatusFilter)
    : "ALL";

  const latestYearRows = await prisma.$queryRawUnsafe<{ year: number | null }[]>(
    `SELECT EXTRACT(YEAR FROM max("issuedAt"))::int AS year FROM invoices`,
  );
  const latestYear = latestYearRows[0]?.year ?? new Date().getFullYear();
  const defaultFrom = `${latestYear}-01-01`;
  const defaultTo = `${latestYear}-12-31`;

  const from = DATE_PATTERN.test(params.from ?? "")
    ? (params.from as string)
    : defaultFrom;
  const to = DATE_PATTERN.test(params.to ?? "")
    ? (params.to as string)
    : defaultTo;
  // Swap when the user picks the range backwards so filters never return empty
  // by accident.
  const [startDate, endDate] = from <= to ? [from, to] : [to, from];

  const [monthlyRows, clientRows, productRows] = await Promise.all([
    prisma.$queryRawUnsafe<RawMonth[]>(
      `SELECT to_char(date_trunc('month', i."issuedAt"), 'YYYY-MM') AS month,
              count(*)::int AS invoices,
              coalesce(sum(i."totalAmount"), 0)::float8 AS revenue,
              coalesce(sum(items.qty), 0)::int AS items
       FROM invoices i
       LEFT JOIN LATERAL (
         SELECT coalesce(sum(ii.quantity), 0) AS qty
         FROM invoice_items ii
         WHERE ii."invoiceId" = i.id
       ) items ON true
       WHERE i."issuedAt" >= $1::date AND i."issuedAt" < ($2::date + 1)
         AND ($3 = 'ALL' OR i.status = $3)
       GROUP BY 1
       ORDER BY 1`,
      startDate,
      endDate,
      status,
    ),
    prisma.$queryRawUnsafe<RawClient[]>(
      `SELECT c.id,
              c.name,
              count(i.id)::int AS invoices,
              coalesce(sum(i."totalAmount"), 0)::float8 AS revenue,
              coalesce(sum(items.qty), 0)::int AS items,
              to_char(max(i."issuedAt"), 'YYYY-MM-DD') AS "lastOrder"
       FROM "Customer" c
       LEFT JOIN invoices i ON i."customerId" = c.id
         AND i."issuedAt" >= $1::date AND i."issuedAt" < ($2::date + 1)
         AND ($3 = 'ALL' OR i.status = $3)
       LEFT JOIN LATERAL (
         SELECT coalesce(sum(ii.quantity), 0) AS qty
         FROM invoice_items ii
         WHERE ii."invoiceId" = i.id
       ) items ON true
       GROUP BY c.id, c.name
       ORDER BY revenue DESC, c.name`,
      startDate,
      endDate,
      status,
    ),
    prisma.$queryRawUnsafe<RawProduct[]>(
      `SELECT p.id,
              p.name,
              sum(ii.quantity)::int AS quantity,
              sum(ii.total)::float8 AS revenue,
              count(DISTINCT ii."invoiceId")::int AS invoices
       FROM invoice_items ii
       JOIN invoices i ON i.id = ii."invoiceId"
       JOIN products p ON p.id = ii."productId"
       WHERE i."issuedAt" >= $1::date AND i."issuedAt" < ($2::date + 1)
         AND ($3 = 'ALL' OR i.status = $3)
       GROUP BY p.id, p.name
       ORDER BY revenue DESC`,
      startDate,
      endDate,
      status,
    ),
  ]);

  const byMonth = new Map(monthlyRows.map((row) => [row.month, row]));
  const monthKeys: string[] = [];
  const cursor = new Date(
    Date.UTC(
      Number(startDate.slice(0, 4)),
      Number(startDate.slice(5, 7)) - 1,
      1,
    ),
  );
  const lastMonth = new Date(
    Date.UTC(Number(endDate.slice(0, 4)), Number(endDate.slice(5, 7)) - 1, 1),
  );
  while (cursor <= lastMonth) {
    monthKeys.push(
      `${cursor.getUTCFullYear()}-${String(cursor.getUTCMonth() + 1).padStart(2, "0")}`,
    );
    cursor.setUTCMonth(cursor.getUTCMonth() + 1);
  }

  const months: MonthPoint[] = monthKeys.map((key) => {
    const row = byMonth.get(key);
    return {
      month: key,
      label: monthLabel(key),
      revenue: row?.revenue ?? 0,
      invoices: row?.invoices ?? 0,
      items: row?.items ?? 0,
      growth: null,
    };
  });
  months.forEach((point, index) => {
    const previous = months[index - 1]?.revenue ?? 0;
    point.growth =
      index === 0 || previous === 0
        ? null
        : ((point.revenue - previous) / previous) * 100;
  });

  const revenue = months.reduce((sum, point) => sum + point.revenue, 0);
  const invoices = months.reduce((sum, point) => sum + point.invoices, 0);
  const items = months.reduce((sum, point) => sum + point.items, 0);

  const clients: ClientRow[] = clientRows.map((row) => ({
    ...row,
    average: row.invoices > 0 ? row.revenue / row.invoices : 0,
    share: revenue > 0 ? (row.revenue / revenue) * 100 : 0,
  }));

  const activeMonths = months.filter((point) => point.invoices > 0);
  const latestMonth = activeMonths.at(-1) ?? null;
  const previousMonth = activeMonths.at(-2) ?? null;

  return {
    from: startDate,
    to: endDate,
    status,
    months,
    clients,
    products: productRows,
    totals: {
      revenue,
      invoices,
      items,
      averageInvoice: invoices > 0 ? revenue / invoices : 0,
      activeClients: clients.filter((client) => client.invoices > 0).length,
      totalClients: clients.length,
      growth:
        latestMonth && previousMonth && previousMonth.revenue > 0
          ? ((latestMonth.revenue - previousMonth.revenue) /
              previousMonth.revenue) *
            100
          : null,
      latestMonth,
      previousMonth,
      bestMonth:
        revenue > 0
          ? months.reduce((best, point) =>
              point.revenue > best.revenue ? point : best,
            )
          : null,
    },
  };
}
