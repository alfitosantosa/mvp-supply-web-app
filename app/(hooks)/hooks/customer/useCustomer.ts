"use client";

import { CustomerData, CustomerForm } from "@/app/types/customer";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const UseGetCustomer = () => {
  return useQuery<CustomerData[]>({
    queryKey: ["customer"],
    queryFn: async () => {
      const res = await fetch("/api/customer");
      return res.json();
    },
  });
};

export const UsePostCustomer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newCustomer: CustomerForm) => {
      const res = await fetch("/api/customer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newCustomer),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customer"] });
    },
  });
};

export const useUpdateCustomer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updatedCustomer: CustomerData) => {
      const res = await fetch(`/api/customer/`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedCustomer),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customer"] });
    },
  });
};

export const useDeleteCustomer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/customer/`, {
        method: "DELETE",
        body: JSON.stringify({ id }),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customer"] });
    },
  });
};
