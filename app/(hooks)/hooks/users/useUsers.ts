import { User } from "@/app/types/user";
import { useMutation, useQuery } from "@tanstack/react-query";

export const useGetUsers = () => {
  return useQuery({
    queryKey: ["users"],
    queryFn: () => fetch("/api/user").then((res) => res.json()),
  });
};

export const useUpdateUser = () => {
  return useMutation({
    mutationFn: (data: User[]) =>
      fetch(`/api/user`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }).then((res) => res.json()),
  });
};

export const useGetUserById = (id: string) => {
  return useQuery({
    queryKey: ["user", id],
    queryFn: () => fetch(`/api/user/${id}`).then((res) => res.json()),
  });
};
