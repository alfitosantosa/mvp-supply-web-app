"use client";

import { InvoiceItemData, InvoiceItemForm } from "@/app/types/invoiceItems";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useGetInvoiceItems = () => {
  return useQuery<InvoiceItemData[]>({
    queryKey: ["invoiceItems"],
    queryFn: async () => {
      const res = await fetch("/api/invoice/items");
      return res.json();
    },
  });
};

export const useCreateInvoiceItems = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (invoiceItems: InvoiceItemForm[]) => {
      const res = await fetch("/api/invoice/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invoiceItems }),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoiceItems"] });
    },
  });
};

export const useUpdateInvoiceItems = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (invoiceItems: InvoiceItemData[]) => {
      const res = await fetch("/api/invoice/items", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invoiceItems }),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoiceItems"] });
    },
  });
};

export const useDeleteInvoiceItems = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (invoiceItems: Pick<InvoiceItemData, "id">[]) => {
      const res = await fetch("/api/invoice/items", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invoiceItems }),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoiceItems"] });
    },
  });
};
