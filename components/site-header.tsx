"use client";

import { usePathname } from "next/navigation";

import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/theme-toggle";

const TITLES: Record<string, string> = {
  "/": "Dashboard",
  "/dashboard/invoice": "Invoice",
  "/dashboard/products": "Products",
  "/dashboard/customer": "Customer",
  "/dashboard/company": "Company",
  "/dashboard/users": "Users",
};

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b bg-background/80 px-4 backdrop-blur">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-1 data-[orientation=vertical]:h-4" />
      <h1 className="text-sm font-medium">
        {TITLES[pathname] ?? "Dashboard"}
      </h1>
      <div className="ml-auto">
        <ThemeToggle />
      </div>
    </header>
  );
}
