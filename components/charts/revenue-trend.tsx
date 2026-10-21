"use client";

import {
  Area,
  Bar,
  CartesianGrid,
  ComposedChart,
  XAxis,
  YAxis,
} from "recharts";

import type { MonthPoint } from "@/lib/analytics";
import { idr, idrCompact, num, pct } from "@/lib/format";
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

const chartConfig = {
  revenue: { label: "Omzet", color: "var(--chart-1)" },
  invoices: { label: "Invoice", color: "var(--chart-2)" },
} satisfies ChartConfig;

export function RevenueTrend({
  months,
  growth,
}: {
  months: MonthPoint[];
  growth: number | null;
}) {
  const revenue = months.reduce((sum, point) => sum + point.revenue, 0);
  const invoices = months.reduce((sum, point) => sum + point.invoices, 0);
  const period =
    months.length > 0
      ? `${months[0].label} – ${months[months.length - 1].label}`
      : "—";

  return (
    <Card className="pt-0">
      <CardHeader className="gap-1 border-b py-5">
        <CardTitle>Tren omzet</CardTitle>
        <CardDescription>
          {period} · Total {idr(revenue)} dari {num(invoices)} invoice ·
          pertumbuhan bulan terakhir {pct(growth)}
        </CardDescription>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[300px] w-full"
        >
          <ComposedChart data={months} margin={{ left: 4, right: 4 }}>
            <defs>
              <linearGradient id="fillRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-revenue)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-revenue)"
                  stopOpacity={0.05}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <YAxis
              yAxisId="revenue"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              width={64}
              tickFormatter={(value: number) => idrCompact(value)}
            />
            <YAxis
              yAxisId="invoices"
              orientation="right"
              tickLine={false}
              axisLine={false}
              width={28}
              allowDecimals={false}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  formatter={(value, name) =>
                    name === "revenue"
                      ? ["Omzet", idr(Number(value))]
                      : ["Invoice", num(Number(value))]
                  }
                />
              }
            />
            <Area
              yAxisId="revenue"
              dataKey="revenue"
              type="monotone"
              fill="url(#fillRevenue)"
              stroke="var(--color-revenue)"
              strokeWidth={2}
            />
            <Bar
              yAxisId="invoices"
              dataKey="invoices"
              fill="var(--color-invoices)"
              radius={[4, 4, 0, 0]}
              barSize={12}
            />
            <ChartLegend content={<ChartLegendContent />} />
          </ComposedChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
