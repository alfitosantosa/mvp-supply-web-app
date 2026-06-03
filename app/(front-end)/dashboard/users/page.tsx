"use client";

import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";
import {
  ArrowUpDown,
  ChevronDown,
  MoreHorizontal,
  Pencil,
  Search,
  X,
  FileText,
  Users,
  ShieldCheck,
  ShieldOff,
  UserCheck,
  UserX,
  Mail,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";

import {
  useGetUserById,
  useGetUsers,
  useUpdateUser,
} from "@/app/(hooks)/hooks/users/useUsers";
import Loading from "@/components/loading";
import { useSession } from "@/lib/auth-client";
import { unauthorized } from "next/navigation";

// ─── Types ────────────────────────────────────────────────────────────────────
export type BetterAuthUser = {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  isActive: boolean;
  image?: string;
  createdAt: string;
  updatedAt: string;
  banExpires?: string;
  banReason?: string;
  banned?: boolean;
  role?: string;
};

// ─── Form Schema ──────────────────────────────────────────────────────────────
const editUserSchema = z.object({
  name: z.string().min(1, "Nama wajib diisi").max(100),
  email: z.string().email("Email tidak valid"),
  isActive: z.boolean(),
  role: z.string().optional(),
});
type EditUserFormValues = z.infer<typeof editUserSchema>;

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getInitials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

function RoleBadge({ role }: { role?: string }) {
  const cfg: Record<string, { label: string; className: string }> = {
    admin: { label: "Admin", className: "bg-purple-600 text-white" },
    user: { label: "User", className: "bg-blue-500 text-white" },
    bendahara: { label: "Bendahara", className: "bg-orange-500 text-white" },
  };
  const r = (role ?? "user").toLowerCase();
  const { label, className } = cfg[r] ?? {
    label: role ?? "User",
    className: "bg-gray-500 text-white",
  };
  return <Badge className={`${className} text-xs`}>{label}</Badge>;
}

// ─── Edit Dialog ──────────────────────────────────────────────────────────────
function EditUserDialog({
  open,
  onOpenChange,
  userData,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userData: BetterAuthUser | null;
  onSuccess: () => void;
}) {
  const updateUser = useUpdateUser();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm<EditUserFormValues>({
    resolver: zodResolver(editUserSchema),
    defaultValues: { isActive: false, role: "user" },
  });

  const isActive = watch("isActive");
  const selectedRole = watch("role");

  React.useEffect(() => {
    if (userData) {
      setValue("name", userData.name);
      setValue("email", userData.email);
      setValue("isActive", userData.isActive ?? false);
      setValue("role", userData.role ?? "user");
    } else {
      reset({ isActive: false, role: "user" });
    }
  }, [userData, setValue, reset]);

  const onSubmit = async (data: EditUserFormValues) => {
    if (!userData) return;
    console.log(userData);
    try {
      await updateUser.mutateAsync({
        id: userData.id,
        name: data.name,
        email: data.email,
        isActive: data.isActive,
      } as any);
      toast.success("User berhasil diperbarui!");
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || "Gagal memperbarui user");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pencil className="h-4 w-4" />
            Edit User
          </DialogTitle>
        </DialogHeader>

        {userData && (
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/40 mb-2">
            <Avatar className="h-10 w-10">
              <AvatarImage src={userData.image} />
              <AvatarFallback>{getInitials(userData.name)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">{userData.name}</p>
              <p className="text-xs text-muted-foreground">{userData.email}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">
              Nama <span className="text-red-500">*</span>
            </Label>
            <Input id="name" placeholder="Nama lengkap" {...register("name")} />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">
              Email <span className="text-red-500">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="user@example.com"
              {...register("email")}
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>

          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <Label className="text-sm font-medium">Status Aktif</Label>
              <p className="text-xs text-muted-foreground mt-0.5">
                {isActive
                  ? "User dapat login dan menggunakan aplikasi"
                  : "User tidak dapat login"}
              </p>
            </div>
            <Switch
              checked={isActive}
              onCheckedChange={(v) => setValue("isActive", v)}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Batal
            </Button>
            <Button type="submit" disabled={updateUser.isPending}>
              {updateUser.isPending ? "Menyimpan..." : "Simpan"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main DataTable ───────────────────────────────────────────────────────────
function BetterAuthUserDataTable() {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [activeFilter, setActiveFilter] = React.useState("all");
  const [verifiedFilter, setVerifiedFilter] = React.useState("all");
  const [bannedFilter, setBannedFilter] = React.useState("all");
  const [roleFilter, setRoleFilter] = React.useState("all");

  const [editDialogOpen, setEditDialogOpen] = React.useState(false);
  const [selectedUser, setSelectedUser] = React.useState<BetterAuthUser | null>(
    null,
  );

  const { data: rawUsers = [], isLoading, refetch } = useGetUsers();
  const users: BetterAuthUser[] = Array.isArray(rawUsers) ? rawUsers : [];

  const handleSuccess = () => refetch();

  // Derive unique roles for filter
  const uniqueRoles = React.useMemo(() => {
    const set = new Set<string>();
    users.forEach((u) => {
      if (u.role) set.add(u.role);
    });
    return Array.from(set);
  }, [users]);

  const globalFilterFn = React.useCallback(
    (row: any, _: string, filterValue: string) => {
      if (!filterValue) return true;
      const u = row.original as BetterAuthUser;
      return [u.name, u.email, u.role, u.id]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(filterValue.toLowerCase());
    },
    [],
  );

  const columns: ColumnDef<BetterAuthUser>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected()
              ? true
              : table.getIsSomePageRowsSelected()
                ? "indeterminate"
                : false
          }
          onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(v) => row.toggleSelected(!!v)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      id: "user",
      accessorFn: (row) => row.name,
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          <Users className="mr-2 h-4 w-4" />
          User
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const u = row.original;
        return (
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9 shrink-0">
              <AvatarImage src={u.image} />
              <AvatarFallback className="text-xs">
                {getInitials(u.name)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{u.name}</p>
              <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
                <Mail className="h-3 w-3 shrink-0" />
                {u.email}
              </p>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "role",
      header: "Role",
      cell: ({ row }) => <RoleBadge role={row.getValue("role")} />,
      filterFn: (row, _id, value) => {
        if (value === "all") return true;
        return (
          (row.original.role ?? "user").toLowerCase() === value.toLowerCase()
        );
      },
    },
    {
      accessorKey: "isActive",
      header: "Status Aktif",
      cell: ({ row }) => {
        const active = row.getValue("isActive") as boolean;
        return active ? (
          <Badge className="bg-green-600 text-white flex items-center gap-1 w-fit">
            <UserCheck className="h-3 w-3" />
            Aktif
          </Badge>
        ) : (
          <Badge className="bg-gray-400 text-white flex items-center gap-1 w-fit">
            <UserX className="h-3 w-3" />
            Nonaktif
          </Badge>
        );
      },
      filterFn: (row, _id, value) => {
        if (value === "all") return true;
        if (value === "active") return row.original.isActive === true;
        if (value === "inactive") return row.original.isActive === false;
        return true;
      },
    },
    {
      accessorKey: "emailVerified",
      header: "Email Verified",
      cell: ({ row }) => {
        const verified = row.getValue("emailVerified") as boolean;
        return verified ? (
          <Badge className="bg-blue-600 text-white flex items-center gap-1 w-fit">
            <ShieldCheck className="h-3 w-3" />
            Terverifikasi
          </Badge>
        ) : (
          <Badge
            variant="outline"
            className="flex items-center gap-1 w-fit text-muted-foreground"
          >
            <ShieldOff className="h-3 w-3" />
            Belum
          </Badge>
        );
      },
      filterFn: (row, _id, value) => {
        if (value === "all") return true;
        if (value === "verified") return row.original.emailVerified === true;
        if (value === "unverified") return row.original.emailVerified === false;
        return true;
      },
    },
    {
      accessorKey: "banned",
      header: "Status Ban",
      cell: ({ row }) => {
        const banned = row.original.banned;
        const reason = row.original.banReason;
        if (!banned)
          return (
            <Badge variant="outline" className="text-xs text-muted-foreground">
              Normal
            </Badge>
          );
        return (
          <div>
            <Badge variant="destructive" className="text-xs">
              Dibanned
            </Badge>
            {reason && (
              <p
                className="text-xs text-muted-foreground mt-0.5 truncate max-w-[120px]"
                title={reason}
              >
                {reason}
              </p>
            )}
          </div>
        );
      },
      filterFn: (row, _id, value) => {
        if (value === "all") return true;
        if (value === "banned") return row.original.banned === true;
        if (value === "normal") return !row.original.banned;
        return true;
      },
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Dibuat
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const d = row.getValue("createdAt") as string;
        if (!d) return <span className="text-muted-foreground text-xs">-</span>;
        return (
          <span className="text-sm">
            {format(new Date(d), "dd MMM yyyy", { locale: localeId })}
          </span>
        );
      },
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const u = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Aksi</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => navigator.clipboard.writeText(u.id)}
              >
                Copy ID
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => navigator.clipboard.writeText(u.email)}
              >
                Copy Email
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  setSelectedUser(u);
                  setEditDialogOpen(true);
                }}
              >
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const table = useReactTable({
    data: users,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    globalFilterFn,
    onGlobalFilterChange: setGlobalFilter,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
    },
  });

  React.useEffect(() => {
    table
      .getColumn("isActive")
      ?.setFilterValue(activeFilter !== "all" ? activeFilter : undefined);
  }, [activeFilter, table]);

  React.useEffect(() => {
    table
      .getColumn("emailVerified")
      ?.setFilterValue(verifiedFilter !== "all" ? verifiedFilter : undefined);
  }, [verifiedFilter, table]);

  React.useEffect(() => {
    table
      .getColumn("banned")
      ?.setFilterValue(bannedFilter !== "all" ? bannedFilter : undefined);
  }, [bannedFilter, table]);

  React.useEffect(() => {
    table
      .getColumn("role")
      ?.setFilterValue(roleFilter !== "all" ? roleFilter : undefined);
  }, [roleFilter, table]);

  if (isLoading) return <Loading />;

  const filteredRows = table.getFilteredRowModel().rows;
  const totalUsers = users.length;
  const activeCount = users.filter((u) => u.isActive).length;
  const verifiedCount = users.filter((u) => u.emailVerified).length;
  const bannedCount = users.filter((u) => u.banned).length;

  const columnLabels: Record<string, string> = {
    user: "User",
    role: "Role",
    isActive: "Status Aktif",
    emailVerified: "Email Verified",
    banned: "Status Ban",
    createdAt: "Dibuat",
  };

  const hasActiveFilter =
    globalFilter ||
    activeFilter !== "all" ||
    verifiedFilter !== "all" ||
    bannedFilter !== "all" ||
    roleFilter !== "all";

  const resetFilters = () => {
    setGlobalFilter("");
    setActiveFilter("all");
    setVerifiedFilter("all");
    setBannedFilter("all");
    setRoleFilter("all");
    table.resetColumnFilters();
  };

  return (
    <div className="mx-auto my-8 p-6 max-w-7xl min-h-screen">
      <div className="font-bold text-3xl mb-6">Manajemen User (Auth)</div>

      {/* ── Toolbar ── */}
      <div className="flex items-center justify-between py-4 flex-wrap gap-y-3">
        <div className="flex items-center space-x-2 flex-wrap gap-y-2">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari nama, email, role..."
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="pl-8 max-w-xs"
            />
          </div>

          {/* Role filter */}
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Role</SelectItem>
              {uniqueRoles.map((r) => (
                <SelectItem key={r} value={r}>
                  {r}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Active filter */}
          <Select value={activeFilter} onValueChange={setActiveFilter}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Status Aktif" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Status</SelectItem>
              <SelectItem value="active">Aktif</SelectItem>
              <SelectItem value="inactive">Nonaktif</SelectItem>
            </SelectContent>
          </Select>

          {/* Verified filter */}
          <Select value={verifiedFilter} onValueChange={setVerifiedFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Email Verified" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua</SelectItem>
              <SelectItem value="verified">Terverifikasi</SelectItem>
              <SelectItem value="unverified">Belum Verifikasi</SelectItem>
            </SelectContent>
          </Select>

          {/* Banned filter */}
          <Select value={bannedFilter} onValueChange={setBannedFilter}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Status Ban" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua</SelectItem>
              <SelectItem value="normal">Normal</SelectItem>
              <SelectItem value="banned">Dibanned</SelectItem>
            </SelectContent>
          </Select>

          {hasActiveFilter && (
            <Button variant="outline" size="sm" onClick={resetFilters}>
              <X className="mr-2 h-4 w-4" />
              Reset
            </Button>
          )}
        </div>

        {/* Column visibility */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              Kolom <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((c) => c.getCanHide())
              .map((column) => (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  className="capitalize"
                  checked={column.getIsVisible()}
                  onCheckedChange={(v) => column.toggleVisibility(!!v)}
                >
                  {columnLabels[column.id] ?? column.id}
                </DropdownMenuCheckboxItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* ── Active filter badges ── */}
      {hasActiveFilter && (
        <div className="flex items-center space-x-2 py-2 flex-wrap gap-y-1">
          <span className="text-sm text-muted-foreground">Filter aktif:</span>
          {globalFilter && (
            <Badge variant="secondary" className="gap-1">
              Pencarian: {globalFilter}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => setGlobalFilter("")}
              />
            </Badge>
          )}
          {roleFilter !== "all" && (
            <Badge variant="secondary" className="gap-1">
              Role: {roleFilter}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => setRoleFilter("all")}
              />
            </Badge>
          )}
          {activeFilter !== "all" && (
            <Badge variant="secondary" className="gap-1">
              {activeFilter === "active" ? "Aktif" : "Nonaktif"}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => setActiveFilter("all")}
              />
            </Badge>
          )}
          {verifiedFilter !== "all" && (
            <Badge variant="secondary" className="gap-1">
              {verifiedFilter === "verified"
                ? "Email Terverifikasi"
                : "Belum Verifikasi"}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => setVerifiedFilter("all")}
              />
            </Badge>
          )}
          {bannedFilter !== "all" && (
            <Badge variant="secondary" className="gap-1">
              {bannedFilter === "banned" ? "Dibanned" : "Normal"}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => setBannedFilter("all")}
              />
            </Badge>
          )}
        </div>
      )}

      {/* ── Table ── */}
      <div className="rounded-md border w-full overflow-hidden">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id}>
                {hg.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <FileText className="h-8 w-8 text-muted-foreground" />
                    <p className="text-muted-foreground">
                      {hasActiveFilter
                        ? "Tidak ada user yang sesuai filter."
                        : "Tidak ada data user."}
                    </p>
                    {hasActiveFilter && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={resetFilters}
                      >
                        Reset Filter
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* ── Pagination ── */}
      <div className="flex items-center justify-between space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} dari{" "}
          {filteredRows.length} baris dipilih.
          {filteredRows.length !== totalUsers && (
            <span className="ml-2">(difilter dari {totalUsers} total)</span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <p className="text-sm font-medium">
            Halaman {table.getState().pagination.pageIndex + 1} dari{" "}
            {table.getPageCount()}
          </p>
          <div className="space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Sebelumnya
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Selanjutnya
            </Button>
          </div>
        </div>
      </div>

      {/* ── Summary Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-blue-500" />
            <h3 className="font-semibold">Total User</h3>
          </div>
          <p className="text-2xl font-bold mt-2">{totalUsers}</p>
          {filteredRows.length !== totalUsers && (
            <p className="text-sm text-muted-foreground">
              ({filteredRows.length} terfilter)
            </p>
          )}
        </div>

        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center space-x-2">
            <UserCheck className="h-5 w-5 text-green-600" />
            <h3 className="font-semibold">Aktif</h3>
          </div>
          <p className="text-2xl font-bold mt-2">{activeCount}</p>
          <p className="text-sm text-muted-foreground">
            {totalUsers > 0 ? Math.round((activeCount / totalUsers) * 100) : 0}%
            dari total
          </p>
        </div>

        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="h-5 w-5 text-blue-500" />
            <h3 className="font-semibold">Email Verified</h3>
          </div>
          <p className="text-2xl font-bold mt-2">{verifiedCount}</p>
          <p className="text-sm text-muted-foreground">
            {totalUsers > 0
              ? Math.round((verifiedCount / totalUsers) * 100)
              : 0}
            % dari total
          </p>
        </div>

        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center space-x-2">
            <ShieldOff className="h-5 w-5 text-red-500" />
            <h3 className="font-semibold">Dibanned</h3>
          </div>
          <p className="text-2xl font-bold mt-2">{bannedCount}</p>
          {bannedCount > 0 && (
            <Button
              variant="link"
              size="sm"
              className="p-0 h-auto text-xs text-red-500 mt-1"
              onClick={() => setBannedFilter("banned")}
            >
              Lihat semua →
            </Button>
          )}
        </div>
      </div>

      {/* ── Edit Dialog ── */}
      <EditUserDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        userData={selectedUser}
        onSuccess={handleSuccess}
      />
    </div>
  );
}

// ─── Auth Wrapper ─────────────────────────────────────────────────────────────
export default function BetterAuthUserPage() {
  const { data: session, isPending } = useSession();
  const userId = session?.user?.id;
  const { data: userData, isLoading: isLoadingUserData } = useGetUserById(
    userId as string,
  );
  const userRole = userData?.role?.name;

  if (isPending || isLoadingUserData) return <Loading />;
  // if (userRole !== "Admin") {
  //   unauthorized();
  //   return null;
  // }

  return <BetterAuthUserDataTable />;
}
