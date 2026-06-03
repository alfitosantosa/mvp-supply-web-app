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
  Plus,
  Pencil,
  Trash2,
  Search,
  X,
  User,
  Phone,
  MapPin,
  Users,
  Calendar,
  ImageIcon,
  Eye,
  Upload,
} from "lucide-react";
import Image from "next/image";

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
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";

// Import hooks
import {
  UseGetCustomer,
  UsePostCustomer,
  useUpdateCustomer,
  useDeleteCustomer,
} from "@/app/(hooks)/hooks/customer/useCustomer";
import { useSession } from "@/lib/auth-client";
import { unauthorized } from "next/navigation";

// Type definitions
export type CustomerData = {
  id: string;
  name: string;
  address: string;
  imageUrl?: string | null;
  phone: string;
  createdAt: string;
  updatedAt: string;
};

// Form schema
const customerSchema = z.object({
  name: z.string().min(1, "Nama pelanggan wajib diisi"),
  address: z.string().min(1, "Alamat wajib diisi"),
  phone: z.string().min(1, "Nomor telepon wajib diisi"),
  imageUrl: z.string().optional().or(z.literal("")),
});

type CustomerFormValues = z.infer<typeof customerSchema>;

// Helper: get initials from name
function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

// Helper: format date
function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// ─── AvatarUpload ─────────────────────────────────────────────────────────────

function AvatarUpload({
  currentAvatarUrl,
  onUploadSuccess,
  disabled = false,
}: {
  currentAvatarUrl?: string;
  onUploadSuccess: (url: string) => void;
  disabled?: boolean;
}) {
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(
    currentAvatarUrl || null,
  );
  const [isUploading, setIsUploading] = React.useState(false);
  const [showPreview, setShowPreview] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    setPreviewUrl(currentAvatarUrl || null);
  }, [currentAvatarUrl]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File tidak boleh lebih dari 5MB");
      return;
    }
    if (!file.type.startsWith("image/")) {
      toast.error("File harus berupa gambar");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => setPreviewUrl(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleRemove = () => {
    if (fileInputRef.current) {
      try {
        fileInputRef.current.value = "";
      } catch {}
    }
    setPreviewUrl(null);
    setShowPreview(false);
    onUploadSuccess("");
    toast.success("Avatar dihapus");
  };

  const handleUpload = async () => {
    const file = fileInputRef.current?.files?.[0];
    if (!file) {
      toast.error("Silakan pilih file terlebih dahulu");
      return;
    }
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch(`${process.env.NEXT_PUBLIC_FILESERVER_URL}`, {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const e = await res.json().catch(() => ({}));
        throw new Error(e.message || "Failed to upload");
      }
      const data = await res.json();
      if (!data.fileUrl) throw new Error("No file URL returned from server");
      setPreviewUrl(data.fileUrl);
      onUploadSuccess(data.fileUrl);
      toast.success("Avatar berhasil diunggah!");
    } catch (error: any) {
      toast.error(error.message || "Gagal mengunggah avatar");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Label htmlFor="picture-customer">Avatar</Label>
      <div className="flex gap-4 items-start">
        <div className="relative">
          {previewUrl ? (
            <div className="relative group">
              <Image
                src={previewUrl}
                alt="Avatar preview"
                width={96}
                height={96}
                className="w-24 h-24 rounded-full object-cover border-2"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="text-white hover:text-white"
                  onClick={() => setShowPreview(true)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center border-2 border-dashed">
              <User className="h-10 w-10 text-muted-foreground" />
            </div>
          )}
        </div>
        <div className="flex-1 space-y-2">
          <Input
            ref={fileInputRef}
            id="picture-customer"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={disabled || isUploading}
          />
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleUpload}
              disabled={
                disabled || isUploading || !fileInputRef.current?.files?.[0]
              }
              className="flex-1"
            >
              <Upload className="h-4 w-4 mr-2" />
              {isUploading ? "Mengunggah..." : "Upload Avatar"}
            </Button>
            {previewUrl && (
              <Button
                type="button"
                variant="outline"
                onClick={handleRemove}
                disabled={disabled || isUploading}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            Format: JPG, PNG, GIF. Maksimal 5MB.
          </p>
        </div>
      </div>
      {previewUrl && (
        <Dialog open={showPreview} onOpenChange={setShowPreview}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Preview Avatar</DialogTitle>
            </DialogHeader>
            <div className="flex items-center justify-center p-4">
              <Image
                src={previewUrl}
                alt="Avatar preview"
                className="max-w-full max-h-[70vh] rounded-lg"
                width={500}
                height={500}
              />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

// Create/Edit Dialog Component
function CustomerFormDialog({
  open,
  onOpenChange,
  editData,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editData?: CustomerData | null;
  onSuccess: () => void;
}) {
  const postCustomer = UsePostCustomer();
  const updateCustomer = useUpdateCustomer();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
    setValue,
  } = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      name: "",
      address: "",
      phone: "",
      imageUrl: "",
    },
  });

  const imageUrlValue = watch("imageUrl");

  React.useEffect(() => {
    if (editData) {
      reset({
        name: editData.name,
        address: editData.address,
        phone: editData.phone,
        imageUrl: editData.imageUrl ?? "",
      });
    } else {
      reset({ name: "", address: "", phone: "", imageUrl: "" });
    }
  }, [editData, reset]);

  const onSubmit = async (data: CustomerFormValues) => {
    try {
      const payload = {
        ...data,
        imageUrl: data.imageUrl || null,
      };

      if (editData) {
        await updateCustomer.mutateAsync({
          id: editData.id,
          ...payload,
        } as any);
        toast.success("Pelanggan berhasil diperbarui!");
      } else {
        await postCustomer.mutateAsync(payload as any);
        toast.success("Pelanggan berhasil ditambahkan!");
      }
      reset();
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || "Terjadi kesalahan");
    }
  };

  const isPending = postCustomer.isPending || updateCustomer.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editData ? "Edit Pelanggan" : "Tambah Pelanggan Baru"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Avatar Preview */}
          <div className="flex justify-center">
            <Avatar className="h-20 w-20">
              <AvatarImage src={imageUrlValue || ""} />
              <AvatarFallback className="text-lg bg-muted">
                {watch("name") ? (
                  getInitials(watch("name"))
                ) : (
                  <User className="h-8 w-8 text-muted-foreground" />
                )}
              </AvatarFallback>
            </Avatar>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Nama Pelanggan</Label>
            <Input
              id="name"
              placeholder="Contoh: Budi Santoso"
              {...register("name")}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Nomor Telepon</Label>
            <Input
              id="phone"
              placeholder="+62 812 3456 7890"
              {...register("phone")}
            />
            {errors.phone && (
              <p className="text-sm text-red-500">{errors.phone.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Alamat</Label>
            <Input
              id="address"
              placeholder="Jl. Contoh No. 1, Jakarta"
              {...register("address")}
            />
            {errors.address && (
              <p className="text-sm text-red-500">{errors.address.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <AvatarUpload
              currentAvatarUrl={editData?.imageUrl || undefined}
              onUploadSuccess={(url) =>
                setValue("imageUrl", url, { shouldValidate: true })
              }
              disabled={isPending}
            />
            {errors.imageUrl && (
              <p className="text-sm text-red-500">{errors.imageUrl.message}</p>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Batal
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Menyimpan..." : editData ? "Perbarui" : "Simpan"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Delete Confirmation Dialog
function DeleteCustomerDialog({
  open,
  onOpenChange,
  customerData,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customerData: CustomerData | null;
  onSuccess: () => void;
}) {
  const deleteCustomer = useDeleteCustomer();

  const handleDelete = async () => {
    if (!customerData) return;
    try {
      await deleteCustomer.mutateAsync(customerData.id as any);
      toast.success("Pelanggan berhasil dihapus!");
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || "Gagal menghapus pelanggan");
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Hapus Pelanggan</AlertDialogTitle>
          <AlertDialogDescription>
            Apakah Anda yakin ingin menghapus pelanggan "{customerData?.name}"?
            Tindakan ini tidak dapat dibatalkan.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Batal</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={deleteCustomer.isPending}
            className="bg-red-600 hover:bg-red-700"
          >
            {deleteCustomer.isPending ? "Menghapus..." : "Hapus"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// Main DataTable Component
function CustomerDataTableUI() {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = React.useState(false);
  const [editDialogOpen, setEditDialogOpen] = React.useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [selectedCustomer, setSelectedCustomer] =
    React.useState<CustomerData | null>(null);

  // Filter state
  const [globalFilter, setGlobalFilter] = React.useState<string>("");

  const { data: rawData, isLoading, refetch } = UseGetCustomer();

  // API returns { customer: [...] }
  const customers: CustomerData[] = React.useMemo(() => {
    if (!rawData) return [];
    // Handle both array response and { customer: [...] } shape
    if (Array.isArray(rawData)) return rawData;
    if ((rawData as any).customer) return (rawData as any).customer;
    return [];
  }, [rawData]);

  const handleSuccess = () => {
    refetch();
  };

  // Global filter function
  const globalFilterFn = React.useCallback(
    (row: any, _columnId: string, filterValue: string) => {
      if (!filterValue) return true;
      const searchValue = filterValue.toLowerCase();
      const c = row.original;
      const searchableText = [c.name, c.address, c.phone]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return searchableText.includes(searchValue);
    },
    [],
  );

  const columns: ColumnDef<CustomerData>[] = [
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
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      id: "customer",
      accessorFn: (row) => row.name,
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          <User className="mr-2 h-4 w-4" />
          Pelanggan
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarImage src={row.original.imageUrl ?? ""} />
            <AvatarFallback className="text-xs bg-muted">
              {getInitials(row.original.name)}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{row.original.name}</div>
            <div className="text-xs text-muted-foreground">
              ID: {row.original.id.slice(0, 8)}...
            </div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "phone",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          <Phone className="mr-2 h-4 w-4" />
          Telepon
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="text-sm font-mono">{row.getValue("phone")}</div>
      ),
    },
    {
      accessorKey: "address",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          <MapPin className="mr-2 h-4 w-4" />
          Alamat
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="max-w-[220px] truncate text-sm">
          {row.getValue("address")}
        </div>
      ),
    },
    {
      id: "hasImage",
      header: () => (
        <div className="flex items-center gap-2 px-2">
          <ImageIcon className="h-4 w-4" />
          Foto
        </div>
      ),
      accessorFn: (row) => !!row.imageUrl,
      cell: ({ row }) =>
        row.original.imageUrl ? (
          <Badge variant="secondary">Ada</Badge>
        ) : (
          <Badge variant="outline" className="text-muted-foreground">
            Tidak
          </Badge>
        ),
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          <Calendar className="mr-2 h-4 w-4" />
          Bergabung
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="text-sm text-muted-foreground">
          {formatDate(row.getValue("createdAt"))}
        </div>
      ),
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const customer = row.original;
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
                onClick={() => navigator.clipboard.writeText(customer.id)}
              >
                Copy ID
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  setSelectedCustomer(customer);
                  setEditDialogOpen(true);
                }}
              >
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setSelectedCustomer(customer);
                  setDeleteDialogOpen(true);
                }}
                className="text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Hapus
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const table = useReactTable({
    data: customers,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    globalFilterFn: globalFilterFn,
    onGlobalFilterChange: setGlobalFilter,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-muted-foreground">Memuat data...</div>
      </div>
    );
  }

  return (
    <>
      <div className="mx-auto min-h-screen my-8 p-6 max-w-7xl">
        <div className="font-bold text-3xl mb-6">Data Pelanggan</div>

        <div className="flex items-center justify-between py-4 flex-wrap gap-y-2">
          <div className="flex items-center space-x-2 flex-wrap gap-y-2">
            {/* Global Search */}
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari nama, telepon, atau alamat..."
                value={globalFilter ?? ""}
                onChange={(e) => setGlobalFilter(e.target.value)}
                className="max-w-sm pl-8"
                disabled={isLoading}
              />
            </div>

            {globalFilter && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setGlobalFilter("");
                  table.resetColumnFilters();
                }}
              >
                <X className="mr-2 h-4 w-4" />
                Reset Filter
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Column visibility */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  Kolom <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {table
                  .getAllColumns()
                  .filter((col) => col.getCanHide())
                  .map((col) => {
                    const labels: Record<string, string> = {
                      customer: "Pelanggan",
                      phone: "Telepon",
                      address: "Alamat",
                      hasImage: "Foto",
                      createdAt: "Bergabung",
                    };
                    return (
                      <DropdownMenuCheckboxItem
                        key={col.id}
                        className="capitalize"
                        checked={col.getIsVisible()}
                        onCheckedChange={(value) =>
                          col.toggleVisibility(!!value)
                        }
                      >
                        {labels[col.id] ?? col.id}
                      </DropdownMenuCheckboxItem>
                    );
                  })}
              </DropdownMenuContent>
            </DropdownMenu>

            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Tambah Pelanggan
            </Button>
          </div>
        </div>

        {/* Active Filter Badge */}
        {globalFilter && (
          <div className="flex items-center space-x-2 py-2">
            <span className="text-sm text-muted-foreground">Filter aktif:</span>
            <Badge variant="secondary" className="gap-1">
              Pencarian: {globalFilter}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => setGlobalFilter("")}
              />
            </Badge>
          </div>
        )}

        <div className="rounded-md border w-full overflow-hidden">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
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
                      <Users className="h-8 w-8 text-muted-foreground" />
                      <p className="text-muted-foreground">
                        {globalFilter
                          ? "Tidak ada pelanggan yang sesuai dengan pencarian."
                          : "Tidak ada data pelanggan."}
                      </p>
                      {globalFilter && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setGlobalFilter("");
                            table.resetColumnFilters();
                          }}
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

        {/* Pagination */}
        <div className="flex items-center justify-between space-x-2 py-4">
          <div className="flex-1 text-sm text-muted-foreground">
            {table.getFilteredSelectedRowModel().rows.length} dari{" "}
            {table.getFilteredRowModel().rows.length} baris dipilih.
            {table.getFilteredRowModel().rows.length !== customers.length && (
              <span className="ml-2">
                (difilter dari {customers.length} total)
              </span>
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

        {/* Summary Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="bg-card rounded-lg border p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-500" />
              <h3 className="font-semibold">Total Pelanggan</h3>
            </div>
            <p className="text-2xl font-bold mt-2">{customers.length}</p>
            {table.getFilteredRowModel().rows.length !== customers.length && (
              <p className="text-sm text-muted-foreground">
                ({table.getFilteredRowModel().rows.length} terfilter)
              </p>
            )}
          </div>

          <div className="bg-card rounded-lg border p-4">
            <div className="flex items-center space-x-2">
              <ImageIcon className="h-5 w-5 text-green-500" />
              <h3 className="font-semibold">Punya Foto</h3>
            </div>
            <p className="text-2xl font-bold mt-2">
              {customers.filter((c) => c.imageUrl).length}
            </p>
            <p className="text-sm text-muted-foreground">
              dari {customers.length} pelanggan
            </p>
          </div>

          <div className="bg-card rounded-lg border p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-purple-500" />
              <h3 className="font-semibold">Terbaru</h3>
            </div>
            <p className="text-sm font-bold mt-2">
              {customers.length > 0
                ? formatDate(
                    [...customers].sort(
                      (a, b) =>
                        new Date(b.createdAt).getTime() -
                        new Date(a.createdAt).getTime(),
                    )[0].createdAt,
                  )
                : "-"}
            </p>
            <p className="text-sm text-muted-foreground">
              pelanggan terakhir ditambahkan
            </p>
          </div>
        </div>

        {/* Dialogs */}
        <CustomerFormDialog
          open={createDialogOpen}
          onOpenChange={setCreateDialogOpen}
          onSuccess={handleSuccess}
        />

        <CustomerFormDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          editData={selectedCustomer}
          onSuccess={handleSuccess}
        />

        <DeleteCustomerDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          customerData={selectedCustomer}
          onSuccess={handleSuccess}
        />
      </div>
    </>
  );
}

export default function CustomerPage() {
  const session = useSession();
  console.log(session);

  if (!session.data) {
    unauthorized();
  }
  return <CustomerDataTableUI />;
}
