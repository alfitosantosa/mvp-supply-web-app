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
  Building2,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  User,
  Briefcase,
  Globe,
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
import { Badge } from "@/components/ui/badge";
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
import { toast, Toaster } from "sonner";

// Import hooks
import {
  useCompany,
  useCreateCompany,
  useUpdateCompany,
  useDeleteCompany,
} from "@/app/(hooks)/hooks/company/useCompany";

// Type definition
export type CompanyData = {
  id: string;
  name: string;
  brandName: string;
  address: string;
  email: string;
  phone: string;
  bankName: string;
  bankAccount: string;
  senderName: string;
  senderTitle: string;
};

// Form schema
const companySchema = z.object({
  name: z.string().min(1, "Nama perusahaan wajib diisi"),
  brandName: z.string().min(1, "Brand name wajib diisi"),
  address: z.string().min(1, "Alamat wajib diisi"),
  email: z.string().email("Format email tidak valid"),
  phone: z.string().min(1, "Nomor telepon wajib diisi"),
  bankName: z.string().min(1, "Nama bank wajib diisi"),
  bankAccount: z.string().min(1, "Nomor rekening wajib diisi"),
  senderName: z.string().min(1, "Nama pengirim wajib diisi"),
  senderTitle: z.string().min(1, "Jabatan pengirim wajib diisi"),
});

type CompanyFormValues = z.infer<typeof companySchema>;

// Create/Edit Dialog Component
function CompanyFormDialog({
  open,
  onOpenChange,
  editData,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editData?: CompanyData | null;
  onSuccess: () => void;
}) {
  const { createCompany } = useCreateCompany();
  const { updateCompany } = useUpdateCompany();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<CompanyFormValues>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      name: "",
      brandName: "",
      address: "",
      email: "",
      phone: "",
      bankName: "",
      bankAccount: "",
      senderName: "",
      senderTitle: "",
    },
  });

  React.useEffect(() => {
    if (editData) {
      reset({
        name: editData.name,
        brandName: editData.brandName,
        address: editData.address,
        email: editData.email,
        phone: editData.phone,
        bankName: editData.bankName,
        bankAccount: editData.bankAccount,
        senderName: editData.senderName,
        senderTitle: editData.senderTitle,
      });
    } else {
      reset({
        name: "",
        brandName: "",
        address: "",
        email: "",
        phone: "",
        bankName: "",
        bankAccount: "",
        senderName: "",
        senderTitle: "",
      });
    }
  }, [editData, reset]);

  const onSubmit = async (data: CompanyFormValues) => {
    try {
      if (editData) {
        updateCompany({ id: editData.id, ...data });
        toast.success("Perusahaan berhasil diperbarui!");
      } else {
        createCompany(data as any);
        toast.success("Perusahaan berhasil ditambahkan!");
      }
      reset();
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || "Terjadi kesalahan");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editData ? "Edit Perusahaan" : "Tambah Perusahaan Baru"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Company Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nama Perusahaan</Label>
              <Input
                id="name"
                placeholder="PT Multi Visi Primakreasi"
                {...register("name")}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="brandName">Brand Name</Label>
              <Input
                id="brandName"
                placeholder="mvpsupply.id"
                {...register("brandName")}
              />
              {errors.brandName && (
                <p className="text-sm text-red-500">
                  {errors.brandName.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Alamat</Label>
            <Input
              id="address"
              placeholder="Jl. Cikatomas II No. 18..."
              {...register("address")}
            />
            {errors.address && (
              <p className="text-sm text-red-500">{errors.address.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="info@company.com"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Telepon</Label>
              <Input
                id="phone"
                placeholder="+62 812 3456 7890"
                {...register("phone")}
              />
              {errors.phone && (
                <p className="text-sm text-red-500">{errors.phone.message}</p>
              )}
            </div>
          </div>

          {/* Bank Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="bankName">Nama Bank</Label>
              <Input
                id="bankName"
                placeholder="BCA"
                {...register("bankName")}
              />
              {errors.bankName && (
                <p className="text-sm text-red-500">
                  {errors.bankName.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="bankAccount">Nomor Rekening</Label>
              <Input
                id="bankAccount"
                placeholder="001-669-6999"
                {...register("bankAccount")}
              />
              {errors.bankAccount && (
                <p className="text-sm text-red-500">
                  {errors.bankAccount.message}
                </p>
              )}
            </div>
          </div>

          {/* Sender Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="senderName">Nama Pengirim</Label>
              <Input
                id="senderName"
                placeholder="Vici Herlambang"
                {...register("senderName")}
              />
              {errors.senderName && (
                <p className="text-sm text-red-500">
                  {errors.senderName.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="senderTitle">Jabatan Pengirim</Label>
              <Input
                id="senderTitle"
                placeholder="Co-Founder"
                {...register("senderTitle")}
              />
              {errors.senderTitle && (
                <p className="text-sm text-red-500">
                  {errors.senderTitle.message}
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Batal
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Menyimpan..." : editData ? "Perbarui" : "Simpan"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Delete Confirmation Dialog
function DeleteCompanyDialog({
  open,
  onOpenChange,
  companyData,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyData: CompanyData | null;
  onSuccess: () => void;
}) {
  const { deleteCompany } = useDeleteCompany();
  const [isDeleting, setIsDeleting] = React.useState(false);

  const handleDelete = async () => {
    if (!companyData) return;
    setIsDeleting(true);
    try {
      deleteCompany(companyData.id);
      toast.success("Perusahaan berhasil dihapus!");
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || "Gagal menghapus perusahaan");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Hapus Perusahaan</AlertDialogTitle>
          <AlertDialogDescription>
            Apakah Anda yakin ingin menghapus perusahaan "{companyData?.name}"?
            Tindakan ini tidak dapat dibatalkan.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Batal</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700"
          >
            {isDeleting ? "Menghapus..." : "Hapus"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// Main DataTable Component
export default function CompanyDataTable() {
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
  const [selectedCompany, setSelectedCompany] =
    React.useState<CompanyData | null>(null);

  // Filter state
  const [globalFilter, setGlobalFilter] = React.useState<string>("");

  const { data: companies = [], isLoading, refetch } = useCompany();

  const handleSuccess = () => {
    refetch();
  };

  // Custom global filter function
  const globalFilterFn = React.useCallback(
    (row: any, _columnId: string, filterValue: string) => {
      if (!filterValue) return true;
      const searchValue = filterValue.toLowerCase();
      const company = row.original;
      const searchableText = [
        company.name,
        company.brandName,
        company.address,
        company.email,
        company.phone,
        company.bankName,
        company.bankAccount,
        company.senderName,
        company.senderTitle,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return searchableText.includes(searchValue);
    },
    [],
  );

  const columns: ColumnDef<CompanyData>[] = [
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
      accessorKey: "name",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          <Building2 className="mr-2 h-4 w-4" />
          Nama Perusahaan
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.getValue("name")}</div>
          <div className="text-sm text-muted-foreground flex items-center gap-1">
            <Globe className="h-3 w-3" />
            {row.original.brandName}
          </div>
        </div>
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
        <div className="max-w-[200px] truncate text-sm">
          {row.getValue("address")}
        </div>
      ),
    },
    {
      id: "contact",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          <Mail className="mr-2 h-4 w-4" />
          Kontak
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      accessorFn: (row) => row.email,
      cell: ({ row }) => (
        <div className="space-y-1">
          <div className="flex items-center gap-1 text-sm">
            <Mail className="h-3 w-3 text-muted-foreground" />
            {row.original.email}
          </div>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Phone className="h-3 w-3" />
            {row.original.phone}
          </div>
        </div>
      ),
    },
    {
      id: "bank",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          <CreditCard className="mr-2 h-4 w-4" />
          Info Bank
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      accessorFn: (row) => row.bankName,
      cell: ({ row }) => (
        <div>
          <Badge variant="outline">{row.original.bankName}</Badge>
          <div className="text-sm text-muted-foreground mt-1 font-mono">
            {row.original.bankAccount}
          </div>
        </div>
      ),
    },
    {
      id: "sender",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          <User className="mr-2 h-4 w-4" />
          Pengirim
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      accessorFn: (row) => row.senderName,
      cell: ({ row }) => (
        <div>
          <div className="font-medium text-sm">{row.original.senderName}</div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Briefcase className="h-3 w-3" />
            {row.original.senderTitle}
          </div>
        </div>
      ),
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const companyData = row.original;
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
                onClick={() => navigator.clipboard.writeText(companyData.id)}
              >
                Copy ID
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  setSelectedCompany(companyData);
                  setEditDialogOpen(true);
                }}
              >
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setSelectedCompany(companyData);
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
    data: companies,
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
        <div className="font-bold text-3xl mb-6">Data Perusahaan</div>

        <div className="flex items-center justify-between py-4 flex-wrap gap-y-2">
          <div className="flex items-center space-x-2 flex-wrap gap-y-2">
            {/* Global Search */}
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari perusahaan, email, atau bank..."
                value={globalFilter ?? ""}
                onChange={(event) => setGlobalFilter(event.target.value)}
                className="max-w-sm pl-8"
                disabled={isLoading}
              />
            </div>

            {/* Clear Filters */}
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
                  .filter((column) => column.getCanHide())
                  .map((column) => {
                    const getColumnLabel = (columnId: string) => {
                      switch (columnId) {
                        case "name":
                          return "Nama Perusahaan";
                        case "address":
                          return "Alamat";
                        case "contact":
                          return "Kontak";
                        case "bank":
                          return "Info Bank";
                        case "sender":
                          return "Pengirim";
                        default:
                          return columnId;
                      }
                    };
                    return (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        className="capitalize"
                        checked={column.getIsVisible()}
                        onCheckedChange={(value) =>
                          column.toggleVisibility(!!value)
                        }
                      >
                        {getColumnLabel(column.id)}
                      </DropdownMenuCheckboxItem>
                    );
                  })}
              </DropdownMenuContent>
            </DropdownMenu>

            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Tambah Perusahaan
            </Button>
          </div>
        </div>

        {/* Active Filters Display */}
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
                      <Building2 className="h-8 w-8 text-muted-foreground" />
                      <p className="text-muted-foreground">
                        {globalFilter
                          ? "Tidak ada perusahaan yang sesuai dengan pencarian."
                          : "Tidak ada data perusahaan."}
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

        <div className="flex items-center justify-between space-x-2 py-4">
          <div className="flex-1 text-sm text-muted-foreground">
            {table.getFilteredSelectedRowModel().rows.length} dari{" "}
            {table.getFilteredRowModel().rows.length} baris dipilih.
            {table.getFilteredRowModel().rows.length !== companies.length && (
              <span className="ml-2">
                (difilter dari {companies.length} total)
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
              <Building2 className="h-5 w-5 text-blue-500" />
              <h3 className="font-semibold">Total Perusahaan</h3>
            </div>
            <p className="text-2xl font-bold mt-2">{companies.length}</p>
            {table.getFilteredRowModel().rows.length !== companies.length && (
              <p className="text-sm text-muted-foreground">
                ({table.getFilteredRowModel().rows.length} terfilter)
              </p>
            )}
          </div>

          <div className="bg-card rounded-lg border p-4">
            <div className="flex items-center space-x-2">
              <CreditCard className="h-5 w-5 text-green-500" />
              <h3 className="font-semibold">Bank Terdaftar</h3>
            </div>
            <p className="text-2xl font-bold mt-2">
              {
                new Set(
                  table
                    .getFilteredRowModel()
                    .rows.map((row) => row.original.bankName),
                ).size
              }
            </p>
          </div>

          <div className="bg-card rounded-lg border p-4">
            <div className="flex items-center space-x-2">
              <User className="h-5 w-5 text-purple-500" />
              <h3 className="font-semibold">Pengirim Unik</h3>
            </div>
            <p className="text-2xl font-bold mt-2">
              {
                new Set(
                  table
                    .getFilteredRowModel()
                    .rows.map((row) => row.original.senderName),
                ).size
              }
            </p>
          </div>
        </div>

        {/* Dialogs */}
        <CompanyFormDialog
          open={createDialogOpen}
          onOpenChange={setCreateDialogOpen}
          onSuccess={handleSuccess}
        />

        <CompanyFormDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          editData={selectedCompany}
          onSuccess={handleSuccess}
        />

        <DeleteCompanyDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          companyData={selectedCompany}
          onSuccess={handleSuccess}
        />
      </div>
    </>
  );
}
