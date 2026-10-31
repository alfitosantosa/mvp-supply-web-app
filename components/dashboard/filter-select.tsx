"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { FilterOption } from "@/lib/analytics";

export function FilterSelect({
  param,
  value,
  placeholder,
  allLabel,
  options,
}: {
  param: string;
  value: string;
  placeholder: string;
  allLabel: string;
  options: FilterOption[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const update = (next: string) => {
    const params = new URLSearchParams(searchParams);
    if (next === "ALL") {
      params.delete(param);
    } else {
      params.set(param, next);
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <Select value={value} onValueChange={update}>
      <SelectTrigger className="h-8 w-[170px]">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="z-[9999] max-h-56 overflow-y-auto">
        <SelectItem value="ALL">{allLabel}</SelectItem>
        {options.map((option) => (
          <SelectItem key={option.id} value={option.id}>
            {option.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
