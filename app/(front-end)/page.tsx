import Link from "next/link";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";

import {
  getDashboardData,
  STATUS_FILTERS,
  type StatusFilter,
} from "@/lib/analytics";
import { idr, num, pct, dayLabel } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ClientTable } from "@/components/dashboard/client-table";
import { DateFilter } from "@/components/dashboard/date-filter";
import { RevenueTrend } from "@/components/charts/revenue-trend";
import { TopProducts } from "@/components/charts/top-products";

const STATUS_LABEL: Record<StatusFilter, string> = {
  ALL: "Semua status",
  PAID: "Lunas",
  SENT: "Terkirim",
  DRAFT: "Draft",
};

function Kpi({
  label,
  value,
  hint,
}: {
  label: string;
  value: React.ReactNode;
  hint?: React.ReactNode;
}) {
  return (
    <Card className="min-w-0 gap-2 py-4">
      <CardHeader className="min-w-0 gap-1 px-4">
        <CardDescription className="text-xs">{label}</CardDescription>
        <CardTitle className="min-w-0 text-lg leading-tight tabular-nums break-words sm:text-xl">
          {value}
        </CardTitle>
      </CardHeader>
      {hint && (
        <CardContent className="px-4 text-xs text-muted-foreground">
          {hint}
        </CardContent>
      )}
    </Card>
  );
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string; status?: string }>;
}) {
  const params = await searchParams;
  const data = await getDashboardData(params);
  const { totals, months, from, to, status } = data;
  const filterHref = (nextStatus: StatusFilter) =>
    `/?from=${from}&to=${to}&status=${nextStatus}`;
  const growthUp = (totals.growth ?? 0) >= 0;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">
            Ringkasan bisnis
          </h2>
          <p className="text-sm text-muted-foreground">
            Periode {dayLabel(from)} – {dayLabel(to)} · filter{" "}
            {STATUS_LABEL[status].toLowerCase()}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {STATUS_FILTERS.map((option) => (
            <Button
              key={option}
              asChild
              size="sm"
              variant={option === status ? "default" : "outline"}
            >
              <Link href={filterHref(option)} scroll={false}>
                {STATUS_LABEL[option]}
              </Link>
            </Button>
          ))}
          <span className="mx-1 h-5 w-px bg-border" />
          <DateFilter from={from} to={to} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 2xl:grid-cols-6">
        <Kpi
          label="Omzet"
          value={idr(totals.revenue)}
          hint={
            totals.growth === null ? (
              "Belum ada pembanding bulan sebelumnya"
            ) : (
              <span className="flex flex-wrap items-center gap-1">
                <Badge
                  variant="secondary"
                  className={
                    growthUp
                      ? "bg-emerald-500/10 text-emerald-600"
                      : "bg-red-500/10 text-red-600"
                  }
                >
                  {growthUp ? <ArrowUpRight /> : <ArrowDownRight />}
                  {pct(totals.growth)}
                </Badge>
                <span>vs {totals.previousMonth?.label}</span>
              </span>
            )
          }
        />
        <Kpi
          label="Invoice diterbitkan"
          value={num(totals.invoices)}
          hint={totals.latestMonth ? `Terakhir: ${totals.latestMonth.label}` : "—"}
        />
        <Kpi
          label="Rata-rata per invoice"
          value={idr(totals.averageInvoice)}
          hint={`${num(totals.items)} item terjual`}
        />
        <Kpi
          label="Klien aktif"
          value={num(totals.activeClients)}
          hint={`Total ${num(totals.totalClients)} klien terdaftar`}
        />
        <Kpi
          label="Bulan terbaik"
          value={totals.bestMonth?.label ?? "—"}
          hint={totals.bestMonth ? idr(totals.bestMonth.revenue) : "Belum ada data"}
        />
        <Kpi
          label="SKU terjual"
          value={num(data.products.length)}
          hint={
            data.products[0]
              ? `Top: ${data.products[0].name}`
              : "Belum ada produk"
          }
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <RevenueTrend months={months} growth={totals.growth} />
        </div>
        <TopProducts products={data.products} />
      </div>

      <ClientTable clients={data.clients} />

      <Card className="pt-0">
        <CardHeader className="gap-1 border-b py-5">
          <CardTitle>Achievement bulan ke bulan</CardTitle>
          <CardDescription>
            Rincian omzet, invoice, dan pertumbuhan tiap bulan pada periode
            terpilih
          </CardDescription>
        </CardHeader>
        <CardContent className="px-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-6">Bulan</TableHead>
                <TableHead className="text-right">Invoice</TableHead>
                <TableHead className="text-right">Item</TableHead>
                <TableHead className="text-right">Omzet</TableHead>
                <TableHead className="pr-6 text-right">Pertumbuhan</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {months.map((month) => (
                <TableRow
                  key={month.month}
                  className={
                    month.month === totals.bestMonth?.month
                      ? "bg-muted/50"
                      : undefined
                  }
                >
                  <TableCell className="pl-6 font-medium">
                    {month.label}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {num(month.invoices)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {num(month.items)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {idr(month.revenue)}
                  </TableCell>
                  <TableCell
                    className={`pr-6 text-right tabular-nums ${
                      month.growth === null
                        ? "text-muted-foreground"
                        : month.growth >= 0
                          ? "text-emerald-600"
                          : "text-red-600"
                    }`}
                  >
                    {pct(month.growth)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
