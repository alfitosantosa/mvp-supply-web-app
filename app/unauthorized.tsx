import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function Unauthorized() {
  return (
    <main className="mx-auto flex min-h-[60dvh] w-full max-w-xl flex-col justify-center px-4 py-16">
      <p className="font-mono text-xs text-muted-foreground">Akses ditolak</p>
      <h1 className="mt-4 text-3xl font-semibold tracking-tight">
        Halaman ini khusus admin.
      </h1>
      <p className="mt-3 max-w-[52ch] text-sm text-muted-foreground">
        Akunmu belum punya peran admin. Minta admin mengubah peran akunmu, lalu
        buka halaman ini lagi.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Button asChild>
          <Link href="/">Kembali ke dashboard</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/dashboard/invoice">Buka invoice</Link>
        </Button>
      </div>
    </main>
  );
}
