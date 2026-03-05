"use client";
import { companyData } from "@/app/types/company";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useCompany = () => {
  return useQuery({
    queryKey: ["company"],
    queryFn: () => fetch("/api/company").then((res) => res.json()),
  });
};


export const useCreateCompany = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (newCompany: companyData) =>
      fetch("/api/company", {
        method: "POST",
        body: JSON.stringify(newCompany),
      }),
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["company"] });
      },
    onError: () => {
      console.error("Failed to create company");
    }
  });
  return { createCompany: mutation.mutate };
}

