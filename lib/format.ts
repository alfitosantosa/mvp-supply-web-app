const idrFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

const compactFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  notation: "compact",
  maximumFractionDigits: 1,
});

const numberFormatter = new Intl.NumberFormat("id-ID");

export const idr = (value: number) => idrFormatter.format(value);

export const idrCompact = (value: number) => compactFormatter.format(value);

export const num = (value: number) => numberFormatter.format(value);

export const pct = (value: number | null) =>
  value === null
    ? "—"
    : `${value > 0 ? "+" : ""}${numberFormatter.format(Number(value.toFixed(1)))}%`;

/** "2026-03" -> "Mar 2026" */
export const monthLabel = (key: string) => {
  const [year, month] = key.split("-").map(Number);
  return new Date(year, month - 1, 1).toLocaleDateString("id-ID", {
    month: "short",
    year: "numeric",
  });
};

/** "2026-03-01" -> "01 Mar 2026" */
export const dayLabel = (value: string | null) =>
  value
    ? new Date(`${value}T00:00:00`).toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—";
