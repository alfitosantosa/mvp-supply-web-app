"use client";
import { ChartAreaInteractive } from "@/components/charts/charts-hero-invoice";

export default function Home() {
  return (
    <>
      {/* chart pendapatan invoice perhari perbulan per 3 bulan  */}
      <div className="mx-auto mt-2 h-screen max-w-7xl justify-center ">
        <ChartAreaInteractive />
      </div>
    </>
  );
}
