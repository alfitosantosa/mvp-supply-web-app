"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { signOut } from "@/lib/auth-client";

export default function PendingNotice({
  name,
  email,
}: {
  name: string;
  email: string;
}) {
  const router = useRouter();
  const [checking, setChecking] = useState(false);
  const [leaving, setLeaving] = useState(false);

  function checkStatus() {
    setChecking(true);
    router.refresh();
    // The server page redirects to the dashboard once isActive is true.
    setTimeout(() => setChecking(false), 1500);
  }

  async function leave() {
    setLeaving(true);
    await signOut();
    router.replace("/auth/sign-in");
  }

  return (
    <main className="mx-auto w-full max-w-xl px-4 py-16 sm:py-24">
      <div className="relative border-t border-foreground/15 pt-5">
        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
          <p className="text-sm font-medium tracking-tight">MVP Supply</p>
          <p className="font-mono text-xs text-muted-foreground">
            Status akses
          </p>
        </div>

        <div
          aria-hidden
          className="pointer-events-none absolute -top-3 right-0 -rotate-3 select-none rounded-sm border-2 border-dashed border-amber-700/40 bg-background px-2 py-0.5 font-mono text-[10px] font-semibold tracking-[0.18em] text-amber-800 dark:border-amber-300/40 dark:text-amber-300"
        >
          BELUM AKTIF
        </div>

        <h1 className="mt-12 max-w-[22ch] text-3xl leading-[1.12] font-semibold tracking-tight text-balance sm:text-4xl">
          Akun kamu belum aktif.
        </h1>
        <p className="mt-4 max-w-[52ch] text-sm leading-relaxed text-muted-foreground sm:text-base">
          Admin perlu mengaktifkan akunmu sebelum dashboard bisa dibuka.
          Setelah aktif, kamu bisa langsung masuk tanpa mendaftar ulang.
        </p>

        <ol className="mt-10 space-y-5 text-sm">
          <li className="flex items-start gap-3">
            <span
              aria-hidden
              className="mt-1.5 size-2.5 shrink-0 rounded-full bg-foreground"
            />
            <span>
              <span className="block font-medium">Pendaftaran diterima</span>
              <span className="mt-0.5 block text-muted-foreground">
                Akun atas nama {name} sudah tercatat.
              </span>
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span
              aria-hidden
              className="mt-1 size-2.5 shrink-0 animate-pulse rounded-full border-2 border-foreground/60 motion-reduce:animate-none"
            />
            <span>
              <span className="flex items-baseline gap-2">
                <span className="font-medium">Menunggu aktivasi admin</span>
                <span className="font-mono text-xs text-muted-foreground">
                  berlangsung
                </span>
              </span>
              <span className="mt-0.5 block text-muted-foreground">
                Hubungi admin dan sebutkan email akunmu.
              </span>
            </span>
          </li>
        </ol>

        <p className="mt-8 border-y border-border py-3 font-mono text-sm break-all">
          {email}
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Button onClick={checkStatus} disabled={checking || leaving}>
            {checking ? (
              <>
                <Loader2 className="animate-spin" aria-hidden />
                Memeriksa
              </>
            ) : (
              "Cek status"
            )}
          </Button>
          <Button variant="ghost" onClick={leave} disabled={leaving || checking}>
            {leaving ? "Keluar..." : "Keluar"}
          </Button>
        </div>
      </div>
    </main>
  );
}
