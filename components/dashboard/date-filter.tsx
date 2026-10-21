"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { Input } from "@/components/ui/input";

export function DateFilter({ from, to }: { from: string; to: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const update = (key: "from" | "to", value: string) => {
    if (!value) return;
    const params = new URLSearchParams(searchParams);
    params.set(key, value);
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="flex items-center gap-1.5">
      <Input
        type="date"
        aria-label="Dari tanggal"
        className="h-8 w-[130px] sm:w-[150px]"
        value={from}
        max={to}
        onChange={(event) => update("from", event.target.value)}
      />
      <span className="text-xs text-muted-foreground">s/d</span>
      <Input
        type="date"
        aria-label="Sampai tanggal"
        className="h-8 w-[130px] sm:w-[150px]"
        value={to}
        min={from}
        onChange={(event) => update("to", event.target.value)}
      />
    </div>
  );
}
