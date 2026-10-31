"use client";

import { Cell, Pie, PieChart, Tooltip } from "recharts";

import type { ClientProductRow, ClientRow } from "@/lib/analytics";
import { dayLabel, idr, num } from "@/lib/format";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChartContainer, type ChartConfig } from "@/components/ui/chart";

const COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "var(--muted-foreground)",
];

type Slice = {
  key: string;
  label: string;
  value: number;
  quantity: number;
  color: string;
};

function toSlices(rows: ClientProductRow[]): Slice[] {
  const sorted = [...rows].sort((a, b) => b.revenue - a.revenue);
  const head = sorted.slice(0, 5);
  const rest = sorted.slice(5);
  const slices: Slice[] = head.map((row, index) => ({
    key: `p${index}`,
    label: row.productName,
    value: row.revenue,
    quantity: row.quantity,
    color: COLORS[index],
  }));
  if (rest.length > 0) {
    slices.push({
      key: `p${slices.length}`,
      label: `${rest.length} produk lain`,
      value: rest.reduce((sum, row) => sum + row.revenue, 0),
      quantity: rest.reduce((sum, row) => sum + row.quantity, 0),
      color: COLORS[COLORS.length - 1],
    });
  }
  return slices;
}

function SliceTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload?: Slice }[];
}) {
  const slice = payload?.[0]?.payload;
  if (!active || !slice) return null;

  return (
    <div className="rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-card">
      <div className="flex items-center gap-2">
        <span
          className="h-2 w-2 shrink-0 rounded-[2px]"
          style={{ background: slice.color }}
        />
        <span className="text-muted-foreground">{slice.label}</span>
        <span className="ml-auto pl-3 font-mono font-medium tabular-nums">
          {idr(slice.value)}
        </span>
      </div>
      <p className="pl-4 text-muted-foreground">{num(slice.quantity)} item</p>
    </div>
  );
}

export function ClientSalesPie({
  clients,
  clientProducts,
}: {
  clients: ClientRow[];
  clientProducts: ClientProductRow[];
}) {
  const active = clients.filter((client) => client.invoices > 0);
  const rowsByClient = new Map<string, ClientProductRow[]>();
  for (const row of clientProducts) {
    const list = rowsByClient.get(row.clientId) ?? [];
    list.push(row);
    rowsByClient.set(row.clientId, list);
  }

  return (
    <Card className="pt-0">
      <CardHeader className="gap-1 border-b py-5">
        <CardTitle>Achievement per klien</CardTitle>
        <CardDescription>
          {active.length} dari {clients.length} klien punya transaksi pada
          filter ini · barang terjual per klien
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3 p-4 sm:grid-cols-2 xl:grid-cols-3">
        {active.map((client) => {
          const slices = toSlices(rowsByClient.get(client.id) ?? []);
          const config: ChartConfig = Object.fromEntries(
            slices.map((slice) => [
              slice.key,
              { label: slice.label, color: slice.color },
            ]),
          );

          return (
            <div key={client.id} className="rounded-lg border p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{client.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {idr(client.revenue)} · {num(client.invoices)} invoice
                  </p>
                </div>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {dayLabel(client.lastOrder)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <ChartContainer
                  config={config}
                  className="aspect-square h-[150px] w-[150px] shrink-0"
                >
                  <PieChart>
                    <Tooltip content={<SliceTooltip />} cursor={false} />
                    <Pie
                      data={slices}
                      dataKey="value"
                      nameKey="key"
                      innerRadius={38}
                      outerRadius={72}
                      paddingAngle={2}
                      strokeWidth={0}
                    >
                      {slices.map((slice) => (
                        <Cell key={slice.key} fill={slice.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ChartContainer>
                <ul className="min-w-0 flex-1 space-y-1 text-xs">
                  {slices.map((slice) => (
                    <li key={slice.key} className="flex items-center gap-1.5">
                      <span
                        className="h-2 w-2 shrink-0 rounded-[2px]"
                        style={{ background: slice.color }}
                      />
                      <span className="truncate" title={slice.label}>
                        {slice.label}
                      </span>
                      <span className="ml-auto tabular-nums text-muted-foreground">
                        {num(slice.quantity)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}
        {active.length === 0 && (
          <p className="col-span-full py-10 text-center text-sm text-muted-foreground">
            Belum ada transaksi pada filter ini.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
