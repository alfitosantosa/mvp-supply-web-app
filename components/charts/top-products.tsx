"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import type { ProductRow } from "@/lib/analytics";
import { idr, idrCompact, num } from "@/lib/format";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

const chartConfig = {
  revenue: { label: "Omzet", color: "var(--chart-3)" },
} satisfies ChartConfig;

export function TopProducts({ products }: { products: ProductRow[] }) {
  const data = products.slice(0, 8);
  const totalQuantity = products.reduce(
    (sum, product) => sum + product.quantity,
    0,
  );

  return (
    <Card className="pt-0">
      <CardHeader className="gap-1 border-b py-5">
        <CardTitle>Produk terlaris</CardTitle>
        <CardDescription>
          {data.length} produk teratas · {num(totalQuantity)} item terjual
        </CardDescription>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6">
        {data.length === 0 ? (
          <p className="py-16 text-center text-sm text-muted-foreground">
            Belum ada produk terjual pada filter ini.
          </p>
        ) : (
          <ChartContainer
            config={chartConfig}
            className="aspect-auto h-[300px] w-full"
          >
            <BarChart
              data={data}
              layout="vertical"
              margin={{ left: 0, right: 16 }}
            >
              <CartesianGrid horizontal={false} />
              <XAxis
                type="number"
                hide
                tickFormatter={(value: number) => idrCompact(value)}
              />
              <YAxis
                type="category"
                dataKey="name"
                width={140}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value: string) =>
                  value.length > 18 ? `${value.slice(0, 17)}…` : value
                }
              />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    formatter={(value) => ["Omzet", idr(Number(value))]}
                  />
                }
              />
              <Bar
                dataKey="revenue"
                fill="var(--color-revenue)"
                radius={4}
                barSize={18}
              />
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
