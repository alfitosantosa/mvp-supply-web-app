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
  Package,
  DollarSign,
  Layers,
  TrendingUp,
} from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";

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
import { Textarea } from "@/components/ui/textarea";
import {
  useCreateProduct,
  useDeleteProduct,
  useGetProduct,
  useUpdateProduct,
} from "@/app/hooks/product/useProduct";

// ─── Types ───────────────────────────────────────────────────────────────────

export type ProductData = {
  id: string;
  name: string;
  price: number;
  description?: string | null;
  stock: number;
  total: number;
  createdAt: string;
  updatedAt: string;
};

type ProductForm = {
  name: string;
  price: number;
  description?: string;
  stock: number;
};

// ─── Schema ──────────────────────────────────────────────────────────────────

const productSchema = z.object({
  name: z.string().min(1, "Nama produk wajib diisi"),
  price: z.coerce.number().min(0, "Harga tidak boleh negatif"),
  description: z.string().optional(),
  stock: z.coerce.number().int().min(0, "Stok tidak boleh negatif"),
});

type ProductFormValues = z.infer<typeof productSchema>;

// ─── Formatter ───────────────────────────────────────────────────────────────

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value);

const getStockBadge = (stock: number) => {
  if (stock <= 0) {
    return <Badge variant="destructive">Habis</Badge>;
  } else if (stock <= 10) {
    return <Badge className="bg-yellow-500 hover:bg-yellow-600">Menipis</Badge>;
  } else {
    return <Badge className="bg-green-600 hover:bg-green-700">Tersedia</Badge>;
  }
  // if (stock === 0) return <Badge variant="destructive">Habis</Badge>;
  // if (stock <= 10)
  //   return <Badge className="bg-yellow-500 hover:bg-yellow-600">Menipis</Badge>;
  // return <Badge className="bg-green-600 hover:bg-green-700">Tersedia</Badge>;
};

// ─── Form Dialog ─────────────────────────────────────────────────────────────

function ProductFormDialog({
  open,
  onOpenChange,
  editData,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editData?: ProductData | null;
}) {
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      price: 0,
      description: "",
      stock: 0,
    },
  });

  React.useEffect(() => {
    if (editData) {
      reset({
        name: editData.name,
        price: editData.price,
        description: editData.description ?? "",
        stock: editData.stock,
      });
    } else {
      reset({ name: "", price: 0, description: "", stock: 0 });
    }
  }, [editData, reset]);

  const onSubmit = async (data: ProductFormValues) => {
    try {
      if (editData) {
        await updateProduct.mutateAsync({
          id: editData.id,
          name: data.name,
          price: data.price,
          description: data.description,
          stock: data.stock,
        });
        toast.success("Produk berhasil diperbarui!");
      } else {
        await createProduct.mutateAsync(data);
        console.log(data);
        toast.success("Produk berhasil ditambahkan!");
      }
      onOpenChange(false);
    } catch {
      toast.error("Terjadi kesalahan, coba lagi.");
    }
  };

  const isPending = createProduct.isPending || updateProduct.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {editData ? "Edit Produk" : "Tambah Produk Baru"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nama Produk</Label>
            <Input
              id="name"
              placeholder="Contoh: Laptop Gaming ASUS"
              {...register("name")}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Harga (Rp)</Label>
              <Input
                id="price"
                type="number"
                min={0}
                placeholder="0"
                {...register("price")}
              />
              {errors.price && (
                <p className="text-sm text-red-500">{errors.price.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="stock">Stok</Label>
              <Input
                id="stock"
                type="number"
                min={0}
                placeholder="0"
                {...register("stock")}
              />
              {errors.stock && (
                <p className="text-sm text-red-500">{errors.stock.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Deskripsi (Opsional)</Label>
            <Textarea
              id="description"
              placeholder="Deskripsi singkat produk..."
              rows={3}
              {...register("description")}
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
            <Button type="submit" disabled={isPending}>
              {isPending ? "Menyimpan..." : editData ? "Perbarui" : "Simpan"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Delete Dialog ────────────────────────────────────────────────────────────

function DeleteProductDialog({
  open,
  onOpenChange,
  productData,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productData: ProductData | null;
}) {
  const deleteProduct = useDeleteProduct();

  const handleDelete = async () => {
    if (!productData) return;
    try {
      await deleteProduct.mutateAsync(productData.id);
      toast.success("Produk berhasil dihapus!");
      onOpenChange(false);
    } catch {
      toast.error("Gagal menghapus produk.");
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Hapus Produk</AlertDialogTitle>
          <AlertDialogDescription>
            Apakah Anda yakin ingin menghapus produk{" "}
            <span className="font-semibold">"{productData?.name}"</span>?
            Tindakan ini tidak dapat dibatalkan.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Batal</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={deleteProduct.isPending}
            className="bg-red-600 hover:bg-red-700"
          >
            {deleteProduct.isPending ? "Menghapus..." : "Hapus"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// ─── Main DataTable ───────────────────────────────────────────────────────────

export default function ProductDataTable() {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [globalFilter, setGlobalFilter] = React.useState("");

  const [createDialogOpen, setCreateDialogOpen] = React.useState(false);
  const [editDialogOpen, setEditDialogOpen] = React.useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [selectedProduct, setSelectedProduct] =
    React.useState<ProductData | null>(null);

  const { data, isLoading } = useGetProduct();
  const products: ProductData[] = data?.product ?? [];

  const columns: ColumnDef<ProductData>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
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
          <Package className="mr-2 h-4 w-4" />
          Nama Produk
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("name")}</div>
      ),
    },
    {
      accessorKey: "price",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          <DollarSign className="mr-2 h-4 w-4" />
          Harga
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="font-mono">{formatCurrency(row.getValue("price"))}</div>
      ),
    },
    {
      accessorKey: "stock",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          <Layers className="mr-2 h-4 w-4" />
          Stok
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <span className="font-mono">{row.getValue("stock")}</span>
          {getStockBadge(row.getValue("stock"))}
        </div>
      ),
    },
    {
      accessorKey: "total",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          <TrendingUp className="mr-2 h-4 w-4" />
          Total Nilai
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="font-mono text-green-700 dark:text-green-400">
          {formatCurrency(row.getValue("total"))}
        </div>
      ),
    },
    {
      accessorKey: "description",
      header: "Deskripsi",
      cell: ({ row }) => (
        <div className="max-w-xs truncate text-muted-foreground text-sm">
          {row.getValue("description") || "-"}
        </div>
      ),
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const product = row.original;
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
                onClick={() => navigator.clipboard.writeText(product.id)}
              >
                Copy ID Produk
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  setSelectedProduct(product);
                  setEditDialogOpen(true);
                }}
              >
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setSelectedProduct(product);
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
    data: products,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
    },
  });

  // Summary calculations
  const totalValue = products.reduce(
    (acc, product) => acc + product.price * product.stock,
    0,
  );
  const outOfStock = products.filter((p) => p.stock === 0).length;
  const lowStock = products.filter((p) => p.stock > 0 && p.stock <= 10).length;

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-muted-foreground animate-pulse">
          Memuat data produk...
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl min-h-screen my-8 p-6">
      <div className="font-bold text-3xl mb-6">Manajemen Produk</div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center space-x-2">
            <Package className="h-5 w-5 text-blue-500" />
            <h3 className="font-semibold">Total Produk</h3>
          </div>
          <p className="text-2xl font-bold mt-2">{products.length}</p>
          {table.getFilteredRowModel().rows.length !== products.length && (
            <p className="text-sm text-muted-foreground">
              ({table.getFilteredRowModel().rows.length} terfilter)
            </p>
          )}
        </div>

        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-green-500" />
            <h3 className="font-semibold">Total Nilai Stok</h3>
          </div>
          <p className="text-2xl font-bold mt-2 text-green-600">
            {formatCurrency(totalValue)}
          </p>
        </div>

        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center space-x-2">
            <Layers className="h-5 w-5 text-yellow-500" />
            <h3 className="font-semibold">Stok Menipis</h3>
          </div>
          <p className="text-2xl font-bold mt-2 text-yellow-600">{lowStock}</p>
          <p className="text-sm text-muted-foreground">≤ 10 unit tersisa</p>
        </div>

        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center space-x-2">
            <Package className="h-5 w-5 text-red-500" />
            <h3 className="font-semibold">Stok Habis</h3>
          </div>
          <p className="text-2xl font-bold mt-2 text-red-600">{outOfStock}</p>
          <p className="text-sm text-muted-foreground">produk tidak tersedia</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between py-4 flex-wrap gap-y-2">
        <div className="flex items-center space-x-2 flex-wrap gap-y-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari nama atau deskripsi produk..."
              value={globalFilter ?? ""}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="max-w-sm pl-8"
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
                    name: "Nama Produk",
                    price: "Harga",
                    stock: "Stok",
                    total: "Total Nilai",
                    description: "Deskripsi",
                  };
                  return (
                    <DropdownMenuCheckboxItem
                      key={col.id}
                      className="capitalize"
                      checked={col.getIsVisible()}
                      onCheckedChange={(value) => col.toggleVisibility(!!value)}
                    >
                      {labels[col.id] ?? col.id}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Tambah Produk
          </Button>
        </div>
      </div>

      {/* Active filter badges */}
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

      {/* Table */}
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
                    <Package className="h-8 w-8 text-muted-foreground" />
                    <p className="text-muted-foreground">
                      {globalFilter
                        ? "Tidak ada produk yang sesuai."
                        : "Belum ada produk."}
                    </p>
                    {globalFilter && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setGlobalFilter("")}
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
          {table.getFilteredRowModel().rows.length !== products.length && (
            <span className="ml-2">
              (difilter dari {products.length} total)
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

      {/* Dialogs */}
      <ProductFormDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />
      <ProductFormDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        editData={selectedProduct}
      />
      <DeleteProductDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        productData={selectedProduct}
      />
    </div>
  );
}
