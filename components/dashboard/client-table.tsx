import type { ClientRow } from "@/lib/analytics";
import { dayLabel, idr, num } from "@/lib/format";
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

export function ClientTable({ clients }: { clients: ClientRow[] }) {
  const active = clients.filter((client) => client.invoices > 0);

  return (
    <Card className="pt-0">
      <CardHeader className="gap-1 border-b py-5">
        <CardTitle>Achievement per klien</CardTitle>
        <CardDescription>
          {active.length} dari {clients.length} klien punya transaksi pada
          filter ini
        </CardDescription>
      </CardHeader>
      <CardContent className="px-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-6">Klien</TableHead>
              <TableHead className="text-right">Omzet</TableHead>
              <TableHead className="text-right">Invoice</TableHead>
              <TableHead className="text-right">Item</TableHead>
              <TableHead className="text-right">Rata-rata</TableHead>
              <TableHead>Order terakhir</TableHead>
              <TableHead className="w-[160px] pr-6">Kontribusi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clients.map((client) => (
              <TableRow key={client.id}>
                <TableCell className="pl-6 font-medium">{client.name}</TableCell>
                <TableCell className="text-right tabular-nums">
                  {idr(client.revenue)}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {num(client.invoices)}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {num(client.items)}
                </TableCell>
                <TableCell className="text-right tabular-nums text-muted-foreground">
                  {idr(client.average)}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {dayLabel(client.lastOrder)}
                </TableCell>
                <TableCell className="pr-6">
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-[var(--chart-1)]"
                        style={{ width: `${Math.min(client.share, 100)}%` }}
                      />
                    </div>
                    <span className="w-10 text-right text-xs tabular-nums text-muted-foreground">
                      {client.share.toFixed(1)}%
                    </span>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {clients.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="py-10 text-center text-sm text-muted-foreground"
                >
                  Belum ada klien.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
