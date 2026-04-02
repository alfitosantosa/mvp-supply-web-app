"use client";

import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGetInvoice } from "@/app/(hooks)/hooks/invoice/useInvoice";
import { InvoiceData } from "@/app/types/invoice";

const chartConfig = {
  pendapatan: {
    label: "Pendapatan",
    color: "var(--chart-1)",
  },
  items: {
    label: "Jumlah Item",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

function buildChartData(invoices: InvoiceData[], days: number) {
  const now = new Date();
  const startDate = new Date(now);
  startDate.setDate(startDate.getDate() - days);

  // Group by date string YYYY-MM-DD
  const map = new Map<string, { pendapatan: number; items: number }>();

  invoices.forEach((inv) => {
    const d = new Date(inv.issuedAt);
    if (d < startDate) return;
    const key = d.toISOString().split("T")[0];
    const existing = map.get(key) ?? { pendapatan: 0, items: 0 };
    existing.pendapatan += Number(inv.totalAmount);
    existing.items += inv._count?.items ?? inv.items?.length ?? 0;
    map.set(key, existing);
  });

  // Sort by date and return array
  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, vals]) => ({ date, ...vals }));
}

const fmt = (v: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    notation: "compact",
  }).format(v);

export function ChartAreaInteractive() {
  const [timeRange, setTimeRange] = React.useState("90d");
  const { data: rawData, isLoading } = useGetInvoice();

  const invoices: InvoiceData[] = React.useMemo(() => {
    if (!rawData) return [];
    if (Array.isArray(rawData)) return rawData;
    return (rawData as any).invoices ?? [];
  }, [rawData]);

  const chartData = React.useMemo(() => {
    const days = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90;
    return buildChartData(invoices, days);
  }, [invoices, timeRange]);

  const totalPendapatan = chartData.reduce((s, d) => s + d.pendapatan, 0);
  const totalItems = chartData.reduce((s, d) => s + d.items, 0);

  if (isLoading) {
    return (
      <Card className="pt-0">
        <CardContent className="flex items-center justify-center h-[300px]">
          <div className="text-muted-foreground animate-pulse">
            Memuat data...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="pt-0">
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
        <div className="grid flex-1 gap-1">
          <CardTitle>Pendapatan Invoice</CardTitle>
          <CardDescription>
            Total {fmt(totalPendapatan)} · {totalItems} item
          </CardDescription>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger
            className="hidden w-[160px] rounded-lg sm:ml-auto sm:flex"
            aria-label="Pilih rentang waktu"
          >
            <SelectValue placeholder="3 bulan terakhir" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="90d" className="rounded-lg">
              3 bulan terakhir
            </SelectItem>
            <SelectItem value="30d" className="rounded-lg">
              30 hari terakhir
            </SelectItem>
            <SelectItem value="7d" className="rounded-lg">
              7 hari terakhir
            </SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        {chartData.length === 0 ? (
          <div className="flex items-center justify-center h-[250px] text-muted-foreground text-sm">
            Tidak ada data pada rentang waktu ini.
          </div>
        ) : (
          <ChartContainer
            config={chartConfig}
            className="aspect-auto h-[250px] w-full"
          >
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="fillPendapatan" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-pendapatan)"
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-pendapatan)"
                    stopOpacity={0.1}
                  />
                </linearGradient>
                <linearGradient id="fillItems" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-items)"
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-items)"
                    stopOpacity={0.1}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={32}
                tickFormatter={(value: string) =>
                  new Date(value).toLocaleDateString("id-ID", {
                    month: "short",
                    day: "numeric",
                  })
                }
              />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    labelFormatter={(value: string) =>
                      new Date(value).toLocaleDateString("id-ID", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      })
                    }
                    formatter={(value, name) => {
                      if (name === "pendapatan")
                        return ["Pendapatan : ", fmt(Number(value))];
                      return ["Jumlah Item : ", value];
                    }}
                    indicator="dot"
                  />
                }
              />
              <Area
                dataKey="pendapatan"
                type="natural"
                fill="url(#fillPendapatan)"
                stroke="var(--color-pendapatan)"
                stackId="a"
              />
              <Area
                dataKey="items"
                type="natural"
                fill="url(#fillItems)"
                stroke="var(--color-items)"
                stackId="b"
              />
              <ChartLegend content={<ChartLegendContent />} />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
