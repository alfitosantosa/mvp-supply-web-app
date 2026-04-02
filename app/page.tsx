"use client";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useGetInvoice } from "./(hooks)/hooks/invoice/useInvoice";
import { ChartAreaInteractive } from "@/components/charts/charts-hero-invoice";

export default function Home() {
  const { data, isLoading } = useGetInvoice();

  console.log(data);
  return (
    <>
      {/* chart pendapatan invoice perhari perbulan per 3 bulan  */}
      <div className="mx-auto mt-2 h-screen max-w-7xl justify-center ">
        <ChartAreaInteractive />
      </div>
    </>
  );
}
