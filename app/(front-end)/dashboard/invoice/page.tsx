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
  FileText,
  Calendar,
  DollarSign,
  Building2,
  User,
  Package,
  ChevronUp,
  Minus,
  Hash,
  Percent,
  Tag,
  FileDown,
} from "lucide-react";
import { createPDFInvoice } from "@/app/(action)/createPDF/createPDFInvoice";
import { createPDFOffering } from "@/app/(action)/createPDF/createPDFOffering";
import { createPDFTravelDocs } from "@/app/(action)/createPDF/createPDFTravelDocs";

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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Separator } from "@/components/ui/separator";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";

// Import hooks
import {
  useGetInvoice,
  useCreateInvoice,
  useUpdateInvoice,
  useDeleteInvoice,
} from "@/app/(hooks)/hooks/invoice/useInvoice";
import {
  useCreateInvoiceItems,
  useDeleteInvoiceItems,
} from "@/app/(hooks)/hooks/invoiceItems/useInvoiceItems";
import { useGetProduct } from "@/app/(hooks)/hooks/product/useProduct";
import { UseGetCustomer } from "@/app/(hooks)/hooks/customer/useCustomer";
import { useCompany } from "@/app/(hooks)/hooks/company/useCompany";

// ─── Types ────────────────────────────────────────────────────────────────────

export type ProductData = {
  id: string;
  name: string;
  price: number;
  description?: string | null;
  imageUrl?: string | null;
  stock: number;
};

export type InvoiceItemData = {
  id: string;
  invoiceId: string;
  productId: string;
  productName: string;
  imageUrl?: string | null;
  description?: string | null;
  price: number;
  quantity: number;
  total: number;
  product?: ProductData;
};

export type InvoiceData = {
  id: string;
  invoiceNumber: string;
  issuedAt: string;
  dueDate: string;
  companyId: string;
  customerId: string;
  subTotal: number;
  discountRate: number;
  discountValue: number;
  totalAmount: number;
  totalInWords: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  company?: { id: string; name: string; brandName: string };
  customer?: { id: string; name: string };
  items?: InvoiceItemData[];
};

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_OPTIONS = ["DRAFT", "SENT", "PAID", "OVERDUE", "CANCELLED"];

const STATUS_VARIANT: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  DRAFT: "secondary",
  SENT: "default",
  PAID: "default",
  OVERDUE: "destructive",
  CANCELLED: "outline",
};

const STATUS_COLOR: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-700",
  SENT: "bg-blue-100 text-blue-700",
  PAID: "bg-green-100 text-green-700",
  OVERDUE: "bg-red-100 text-red-700",
  CANCELLED: "bg-slate-100 text-slate-500",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatCurrency(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value);
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// Number to words (Terbilang) - Indonesian
function terbilang(n: number): string {
  const satuan = [
    "",
    "Satu",
    "Dua",
    "Tiga",
    "Empat",
    "Lima",
    "Enam",
    "Tujuh",
    "Delapan",
    "Sembilan",
    "Sepuluh",
    "Sebelas",
    "Dua Belas",
    "Tiga Belas",
    "Empat Belas",
    "Lima Belas",
    "Enam Belas",
    "Tujuh Belas",
    "Delapan Belas",
    "Sembilan Belas",
  ];
  if (n < 20) return satuan[n];
  if (n < 100)
    return (
      satuan[Math.floor(n / 10)] +
      " Puluh" +
      (n % 10 ? " " + satuan[n % 10] : "")
    );
  if (n < 1000)
    return (
      (n < 200 ? "Seratus" : satuan[Math.floor(n / 100)] + " Ratus") +
      (n % 100 ? " " + terbilang(n % 100) : "")
    );
  if (n < 1000000)
    return (
      (n < 2000 ? "Seribu" : terbilang(Math.floor(n / 1000)) + " Ribu") +
      (n % 1000 ? " " + terbilang(n % 1000) : "")
    );
  if (n < 1000000000)
    return (
      terbilang(Math.floor(n / 1000000)) +
      " Juta" +
      (n % 1000000 ? " " + terbilang(n % 1000000) : "")
    );
  return (
    terbilang(Math.floor(n / 1000000000)) +
    " Miliar" +
    (n % 1000000000 ? " " + terbilang(n % 1000000000) : "")
  );
}

function toTerbilang(amount: number): string {
  if (!amount || amount === 0) return "Nol Rupiah";
  return terbilang(Math.floor(amount)) + " Rupiah";
}

// ─── Zod Schema ───────────────────────────────────────────────────────────────

const invoiceItemSchema = z.object({
  productId: z.string().min(1, "Produk wajib dipilih"),
  productName: z.string().optional(),
  description: z.string().optional(),
  price: z.number().min(0, "Harga tidak boleh negatif"),
  quantity: z.number().min(1, "Kuantitas minimal 1"),
  total: z.number(),
  imageUrl: z.string().optional().nullable(),
});

const invoiceSchema = z.object({
  invoiceNumber: z.string().min(1, "Nomor invoice wajib diisi"),
  issuedAt: z.string().min(1, "Tanggal terbit wajib diisi"),
  dueDate: z.string().min(1, "Tanggal jatuh tempo wajib diisi"),
  companyId: z.string().min(1, "Perusahaan wajib dipilih"),
  customerId: z.string().min(1, "Pelanggan wajib dipilih"),
  discountRate: z.number().min(0).max(100),
  status: z.string().min(1, "Status wajib dipilih"),
  items: z.array(invoiceItemSchema).min(1, "Minimal satu item invoice"),
});

type InvoiceFormValues = z.infer<typeof invoiceSchema>;

// ─── Invoice Form Dialog ───────────────────────────────────────────────────────

function InvoiceFormDialog({
  open,
  onOpenChange,
  editData,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editData?: InvoiceData | null;
  onSuccess: () => void;
}) {
  const createInvoice = useCreateInvoice();
  const updateInvoice = useUpdateInvoice();
  const createItems = useCreateInvoiceItems();
  const deleteItems = useDeleteInvoiceItems();

  const { data: rawProducts } = useGetProduct();
  const { data: rawCustomers } = UseGetCustomer();
  const { data: rawCompanies } = useCompany();

  const products: ProductData[] = React.useMemo(() => {
    if (!rawProducts) return [];
    if (Array.isArray(rawProducts)) return rawProducts;
    return (rawProducts as any).product ?? [];
  }, [rawProducts]);

  const customers = React.useMemo(() => {
    if (!rawCustomers) return [];
    if (Array.isArray(rawCustomers)) return rawCustomers;
    return (rawCustomers as any).customer ?? [];
  }, [rawCustomers]);

  const companies = React.useMemo(() => {
    if (!rawCompanies) return [];
    if (Array.isArray(rawCompanies)) return rawCompanies;
    return (rawCompanies as any).companies ?? rawCompanies ?? [];
  }, [rawCompanies]);

  const today = new Date().toISOString().split("T")[0];

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      invoiceNumber: "",
      issuedAt: today,
      dueDate: "",
      companyId: "",
      customerId: "",
      discountRate: 0,
      status: "DRAFT",
      items: [
        {
          productId: "",
          productName: "",
          description: "",
          price: 0,
          quantity: 1,
          total: 0,
          imageUrl: null,
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "items" });

  const watchedItems = watch("items");
  const watchedDiscount = watch("discountRate");

  // Computed totals
  const subTotal = React.useMemo(
    () => watchedItems?.reduce((sum, item) => sum + (item.total || 0), 0) ?? 0,
    [watchedItems],
  );
  const discountValue = React.useMemo(
    () => (subTotal * (watchedDiscount || 0)) / 100,
    [subTotal, watchedDiscount],
  );
  const totalAmount = subTotal - discountValue;

  // Auto-populate price when product selected
  const handleProductChange = (index: number, productId: string) => {
    const product = products.find((p) => p.id === productId);
    if (product) {
      setValue(`items.${index}.productId`, productId);
      setValue(`items.${index}.productName`, product.name);
      setValue(`items.${index}.price`, Number(product.price));
      setValue(`items.${index}.imageUrl`, product.imageUrl ?? null);
      const qty = watchedItems?.[index]?.quantity ?? 1;
      setValue(`items.${index}.total`, Number(product.price) * qty);
    }
  };

  // Recalculate total when qty changes
  const handleQtyChange = (index: number, qty: number) => {
    const price = watchedItems?.[index]?.price ?? 0;
    setValue(`items.${index}.quantity`, qty);
    setValue(`items.${index}.total`, price * qty);
  };

  // Recalculate total when price changes
  const handlePriceChange = (index: number, price: number) => {
    const qty = watchedItems?.[index]?.quantity ?? 1;
    setValue(`items.${index}.price`, price);
    setValue(`items.${index}.total`, price * qty);
  };

  React.useEffect(() => {
    if (editData) {
      reset({
        invoiceNumber: editData.invoiceNumber,
        issuedAt: editData.issuedAt.split("T")[0],
        dueDate: editData.dueDate.split("T")[0],
        companyId: editData.companyId,
        customerId: editData.customerId,
        discountRate: editData.discountRate,
        status: editData.status,
        items: editData.items?.length
          ? editData.items.map((item) => ({
              productId: item.productId,
              productName: item.product?.name ?? item.productName ?? "",
              description: item.description ?? "",
              price: Number(item.price),
              quantity: item.quantity,
              total: Number(item.total),
              imageUrl: item.imageUrl ?? null,
            }))
          : [
              {
                productId: "",
                productName: "",
                description: "",
                price: 0,
                quantity: 1,
                total: 0,
                imageUrl: null,
              },
            ],
      });
    } else {
      reset({
        invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
        issuedAt: today,
        dueDate: "",
        companyId: "",
        customerId: "",
        discountRate: 0,
        status: "DRAFT",
        items: [
          {
            productId: "",
            productName: "",
            description: "",
            price: 0,
            quantity: 1,
            total: 0,
            imageUrl: null,
          },
        ],
      });
    }
  }, [editData, reset, today]);

  const onSubmit = async (data: InvoiceFormValues) => {
    try {
      const invoicePayload = {
        invoiceNumber: data.invoiceNumber,
        issuedAt: new Date(data.issuedAt).toISOString(),
        dueDate: new Date(data.dueDate).toISOString(),
        companyId: data.companyId,
        customerId: data.customerId,
        subTotal,
        discountRate: data.discountRate,
        discountValue,
        totalAmount,
        totalInWords: toTerbilang(totalAmount),
        status: data.status,
      };

      if (editData) {
        await updateInvoice.mutateAsync({
          id: editData.id,
          ...invoicePayload,
        } as any);

        // Delete old items then recreate
        if (editData.items?.length) {
          await deleteItems.mutateAsync(
            editData.items.map((i) => ({ id: i.id })),
          );
        }
        await createItems.mutateAsync(
          data.items.map((item) => ({
            invoiceId: editData.id,
            productId: item.productId,
            productName: item.productName ?? "",
            description: item.description ?? null,
            price: item.price,
            quantity: item.quantity,
            total: item.total,
            imageUrl: item.imageUrl ?? null,
          })) as any,
        );
        toast.success("Invoice berhasil diperbarui!");
      } else {
        const created = await createInvoice.mutateAsync(invoicePayload as any);
        const newInvoiceId = created?.id ?? created?.createInvoice?.id;
        if (newInvoiceId) {
          await createItems.mutateAsync(
            data.items.map((item) => ({
              invoiceId: newInvoiceId,
              productId: item.productId,
              productName: item.productName ?? "",
              description: item.description ?? null,
              price: item.price,
              quantity: item.quantity,
              total: item.total,
              imageUrl: item.imageUrl ?? null,
            })) as any,
          );
        }
        toast.success("Invoice berhasil dibuat!");
      }

      reset();
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || "Terjadi kesalahan");
    }
  };

  const isPending =
    createInvoice.isPending ||
    updateInvoice.isPending ||
    createItems.isPending ||
    deleteItems.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editData ? "Edit Invoice" : "Buat Invoice Baru"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Header Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="invoiceNumber">Nomor Invoice</Label>
              <Input
                id="invoiceNumber"
                placeholder="INV-001"
                {...register("invoiceNumber")}
              />
              {errors.invoiceNumber && (
                <p className="text-sm text-red-500">
                  {errors.invoiceNumber.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih Status" />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.status && (
                <p className="text-sm text-red-500">{errors.status.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="issuedAt">Tanggal Terbit</Label>
              <Input id="issuedAt" type="date" {...register("issuedAt")} />
              {errors.issuedAt && (
                <p className="text-sm text-red-500">
                  {errors.issuedAt.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="dueDate">Jatuh Tempo</Label>
              <Input id="dueDate" type="date" {...register("dueDate")} />
              {errors.dueDate && (
                <p className="text-sm text-red-500">{errors.dueDate.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Perusahaan</Label>
              <Controller
                name="companyId"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih Perusahaan" />
                    </SelectTrigger>
                    <SelectContent>
                      {companies.map((c: any) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.companyId && (
                <p className="text-sm text-red-500">
                  {errors.companyId.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Pelanggan</Label>
              <Controller
                name="customerId"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih Pelanggan" />
                    </SelectTrigger>
                    <SelectContent>
                      {customers.map((c: any) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.customerId && (
                <p className="text-sm text-red-500">
                  {errors.customerId.message}
                </p>
              )}
            </div>
          </div>

          <Separator />

          {/* Invoice Items */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">Item Invoice</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  append({
                    productId: "",
                    productName: "",
                    description: "",
                    price: 0,
                    quantity: 1,
                    total: 0,
                    imageUrl: null,
                  })
                }
              >
                <Plus className="mr-2 h-4 w-4" />
                Tambah Item
              </Button>
            </div>

            {errors.items &&
              typeof errors.items === "object" &&
              "message" in errors.items && (
                <p className="text-sm text-red-500">
                  {(errors.items as any).message}
                </p>
              )}

            <div className="space-y-3">
              {/* Items Header */}
              <div className="grid grid-cols-12 gap-2 text-xs font-medium text-muted-foreground px-1">
                <div className="col-span-3">Produk</div>
                <div className="col-span-3">Deskripsi</div>
                <div className="col-span-2">Harga</div>
                <div className="col-span-1 text-center">Qty</div>
                <div className="col-span-2 text-right">Total</div>
                <div className="col-span-1" />
              </div>

              {fields.map((field, index) => (
                <div key={field.id} className="flex mx-auto gap-2 ">
                  {/* Product Select */}
                  <div className="col-span-3 ">
                    <Controller
                      name={`items.${index}.productId`}
                      control={control}
                      render={({ field: f }) => (
                        <Select
                          value={f.value}
                          onValueChange={(val) =>
                            handleProductChange(index, val)
                          }
                        >
                          <SelectTrigger className="h-9 text-xs">
                            <SelectValue placeholder="Pilih Produk" />
                          </SelectTrigger>
                          <SelectContent>
                            {products.map((p) => (
                              <SelectItem key={p.id} value={p.id}>
                                <span className="text-xs">{p.name}</span>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.items?.[index]?.productId && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors.items[index]?.productId?.message}
                      </p>
                    )}
                  </div>

                  {/* Description */}
                  <div className="col-span-3">
                    <Input
                      className="h-9 text-xs"
                      placeholder="Deskripsi (opsional)"
                      {...register(`items.${index}.description`)}
                    />
                  </div>

                  {/* Price */}
                  <div className="col-span-2">
                    <Input
                      className="h-9 text-xs"
                      type="number"
                      min={0}
                      placeholder="Harga"
                      value={watchedItems?.[index]?.price ?? 0}
                      onChange={(e) =>
                        handlePriceChange(index, Number(e.target.value))
                      }
                    />
                  </div>

                  {/* Qty */}
                  <div className="col-span-1">
                    <Input
                      className="h-9 text-xs text-center"
                      type="number"
                      min={1}
                      placeholder="1"
                      value={watchedItems?.[index]?.quantity ?? 1}
                      onChange={(e) =>
                        handleQtyChange(index, Number(e.target.value))
                      }
                    />
                  </div>

                  {/* Total */}
                  <div className="col-span-2 flex items-center justify-end">
                    <span className="text-xs font-medium">
                      {formatCurrency(watchedItems?.[index]?.total ?? 0)}
                    </span>
                  </div>

                  {/* Remove */}
                  <div className="col-span-1 flex justify-center">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-9 w-9 p-0 text-red-500 hover:text-red-700"
                      onClick={() => remove(index)}
                      disabled={fields.length === 1}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Totals */}
          <div className="space-y-2 max-w-xs ml-auto">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-medium">{formatCurrency(subTotal)}</span>
            </div>

            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Diskon</span>
                <div className="relative w-20">
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    className="h-7 text-xs pr-6"
                    {...register("discountRate", { valueAsNumber: true })}
                  />
                  <Percent className="absolute right-1.5 top-1.5 h-3 w-3 text-muted-foreground" />
                </div>
              </div>
              <span className="text-sm font-medium text-red-500">
                -{formatCurrency(discountValue)}
              </span>
            </div>

            <Separator />
            <div className="flex justify-between">
              <span className="font-semibold">Total</span>
              <span className="font-bold text-lg">
                {formatCurrency(totalAmount)}
              </span>
            </div>
            <p className="text-xs text-muted-foreground italic text-right">
              {toTerbilang(totalAmount)}
            </p>
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

// ─── Delete Dialog ─────────────────────────────────────────────────────────────

function DeleteInvoiceDialog({
  open,
  onOpenChange,
  invoiceData,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoiceData: InvoiceData | null;
  onSuccess: () => void;
}) {
  const deleteInvoice = useDeleteInvoice();

  const handleDelete = async () => {
    if (!invoiceData) return;
    try {
      await deleteInvoice.mutateAsync(invoiceData.id as any);
      toast.success("Invoice berhasil dihapus!");
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || "Gagal menghapus invoice");
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Hapus Invoice</AlertDialogTitle>
          <AlertDialogDescription>
            Apakah Anda yakin ingin menghapus invoice "
            {invoiceData?.invoiceNumber}"? Semua item invoice akan ikut
            terhapus. Tindakan ini tidak dapat dibatalkan.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Batal</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={deleteInvoice.isPending}
            className="bg-red-600 hover:bg-red-700"
          >
            {deleteInvoice.isPending ? "Menghapus..." : "Hapus"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// ─── Expandable Items Row ──────────────────────────────────────────────────────

function ExpandedItemsRow({ items }: { items: InvoiceItemData[] }) {
  if (!items?.length)
    return (
      <div className="px-8 py-3 text-sm text-muted-foreground">
        Tidak ada item.
      </div>
    );

  return (
    <div className="px-8 py-3 bg-muted/20">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-xs text-muted-foreground border-b">
            <th className="text-left pb-2 font-medium">Produk</th>
            <th className="text-left pb-2 font-medium">Deskripsi</th>
            <th className="text-right pb-2 font-medium">Harga</th>
            <th className="text-center pb-2 font-medium">Qty</th>
            <th className="text-right pb-2 font-medium">Total</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} className="border-b last:border-0">
              <td className="py-2 font-medium">
                {item.product?.name ?? item.productId.slice(0, 8) + "..."}
              </td>
              <td className="py-2 text-muted-foreground text-xs">
                {item.description || "-"}
              </td>
              <td className="py-2 text-right">
                {formatCurrency(Number(item.price))}
              </td>
              <td className="py-2 text-center">{item.quantity}</td>
              <td className="py-2 text-right font-medium">
                {formatCurrency(Number(item.total))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Main DataTable ────────────────────────────────────────────────────────────

export default function InvoiceDataTable() {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  const [createDialogOpen, setCreateDialogOpen] = React.useState(false);
  const [editDialogOpen, setEditDialogOpen] = React.useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [selectedInvoice, setSelectedInvoice] =
    React.useState<InvoiceData | null>(null);
  const [expandedRows, setExpandedRows] = React.useState<Set<string>>(
    new Set(),
  );

  const [globalFilter, setGlobalFilter] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("all");

  const { data: rawInvoices, isLoading, refetch } = useGetInvoice();

  const invoices: InvoiceData[] = React.useMemo(() => {
    if (!rawInvoices) return [];
    if (Array.isArray(rawInvoices)) return rawInvoices;
    return (rawInvoices as any).invoices ?? [];
  }, [rawInvoices]);

  const handleSuccess = () => refetch();

  const toggleExpand = (id: string) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const globalFilterFn = React.useCallback(
    (row: any, _: string, filterValue: string) => {
      if (!filterValue) return true;
      const search = filterValue.toLowerCase();
      const inv = row.original;
      return [
        inv.invoiceNumber,
        inv.company?.name,
        inv.customer?.name,
        inv.status,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(search);
    },
    [],
  );

  const columns: ColumnDef<InvoiceData>[] = [
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
          onCheckedChange={(v) => row.toggleSelected(!!v)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      id: "expand",
      header: () => <span className="text-xs text-muted-foreground">Item</span>,
      cell: ({ row }) => {
        const inv = row.original;
        const isExpanded = expandedRows.has(inv.id);
        return (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={() => toggleExpand(inv.id)}
          >
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        );
      },
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "invoiceNumber",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          <Hash className="mr-2 h-4 w-4" />
          No. Invoice
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <span className="font-mono font-medium text-sm">
          {row.getValue("invoiceNumber")}
        </span>
      ),
    },
    {
      id: "status",
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status: string = row.getValue("status");
        return (
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLOR[status] ?? "bg-gray-100 text-gray-700"}`}
          >
            {status}
          </span>
        );
      },
      filterFn: (row, _, value) => {
        if (value === "all") return true;
        return row.original.status === value;
      },
    },
    {
      id: "customer",
      accessorFn: (row) => row.customer?.name ?? "",
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
        <div className="text-sm">{row.original.customer?.name ?? "-"}</div>
      ),
    },
    {
      id: "company",
      accessorFn: (row) => row.company?.name ?? "",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          <Building2 className="mr-2 h-4 w-4" />
          Perusahaan
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div>
          <div className="text-sm font-medium">
            {row.original.company?.name ?? "-"}
          </div>
          {row.original.company?.brandName && (
            <div className="text-xs text-muted-foreground">
              {row.original.company.brandName}
            </div>
          )}
        </div>
      ),
    },
    {
      accessorKey: "issuedAt",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          <Calendar className="mr-2 h-4 w-4" />
          Tanggal
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="text-sm">
          <div>{formatDate(row.original.issuedAt)}</div>
          <div className="text-xs text-muted-foreground">
            Jatuh: {formatDate(row.original.dueDate)}
          </div>
        </div>
      ),
    },
    {
      id: "totalAmount",
      accessorKey: "totalAmount",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          <DollarSign className="mr-2 h-4 w-4" />
          Total
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="text-right">
          <div className="font-semibold text-sm">
            {formatCurrency(Number(row.original.totalAmount))}
          </div>
          {row.original.discountRate > 0 && (
            <div className="text-xs text-muted-foreground">
              Diskon {row.original.discountRate}%
            </div>
          )}
        </div>
      ),
    },
    {
      id: "itemCount",
      header: () => (
        <div className="flex items-center gap-2 px-2">
          <Package className="h-4 w-4" />
          Item
        </div>
      ),
      cell: ({ row }) => (
        <Badge variant="secondary" className="text-xs">
          {row.original.items?.length ?? 0} item
        </Badge>
      ),
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const inv = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Aksi</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => navigator.clipboard.writeText(inv.id)}
              >
                Copy ID
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => navigator.clipboard.writeText(inv.invoiceNumber)}
              >
                Copy No. Invoice
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">
                Export PDF
              </DropdownMenuLabel>
              <DropdownMenuItem onClick={() => createPDFInvoice(inv as any)}>
                <FileDown className="mr-2 h-4 w-4" />
                Invoice PDF
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => createPDFOffering(inv as any)}>
                <FileDown className="mr-2 h-4 w-4" />
                Penawaran PDF
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => createPDFTravelDocs(inv as any)}>
                <FileDown className="mr-2 h-4 w-4" />
                Surat Jalan PDF
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  setSelectedInvoice(inv);
                  setEditDialogOpen(true);
                }}
              >
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setSelectedInvoice(inv);
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
    data: invoices,
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

  // Apply status filter
  React.useEffect(() => {
    if (statusFilter !== "all") {
      table.getColumn("status")?.setFilterValue(statusFilter);
    } else {
      table.getColumn("status")?.setFilterValue(undefined);
    }
  }, [statusFilter, table]);

  // Summary stats
  const totalRevenue = React.useMemo(
    () =>
      table
        .getFilteredRowModel()
        .rows.reduce((sum, r) => sum + Number(r.original.totalAmount), 0),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [table.getFilteredRowModel().rows],
  );

  const paidCount = React.useMemo(
    () => invoices.filter((i) => i.status === "PAID").length,
    [invoices],
  );

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
        <div className="font-bold text-3xl mb-6">Data Invoice</div>

        {/* Filters */}
        <div className="flex items-center justify-between py-4 flex-wrap gap-y-2">
          <div className="flex items-center space-x-2 flex-wrap gap-y-2">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari nomor invoice, pelanggan..."
                value={globalFilter}
                onChange={(e) => setGlobalFilter(e.target.value)}
                className="max-w-sm pl-8"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                {STATUS_OPTIONS.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {(globalFilter || statusFilter !== "all") && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setGlobalFilter("");
                  setStatusFilter("all");
                  table.resetColumnFilters();
                }}
              >
                <X className="mr-2 h-4 w-4" />
                Reset
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
                  .filter((c) => c.getCanHide())
                  .map((col) => {
                    const labels: Record<string, string> = {
                      invoiceNumber: "No. Invoice",
                      status: "Status",
                      customer: "Pelanggan",
                      company: "Perusahaan",
                      issuedAt: "Tanggal",
                      totalAmount: "Total",
                      itemCount: "Jumlah Item",
                    };
                    return (
                      <DropdownMenuCheckboxItem
                        key={col.id}
                        checked={col.getIsVisible()}
                        onCheckedChange={(v) => col.toggleVisibility(!!v)}
                      >
                        {labels[col.id] ?? col.id}
                      </DropdownMenuCheckboxItem>
                    );
                  })}
              </DropdownMenuContent>
            </DropdownMenu>

            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Buat Invoice
            </Button>
          </div>
        </div>

        {/* Active Filters */}
        {(globalFilter || statusFilter !== "all") && (
          <div className="flex items-center space-x-2 py-2">
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
            {statusFilter !== "all" && (
              <Badge variant="secondary" className="gap-1">
                Status: {statusFilter}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => setStatusFilter("all")}
                />
              </Badge>
            )}
          </div>
        )}

        {/* Table */}
        <div className="rounded-md border w-full overflow-hidden">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((hg) => (
                <TableRow key={hg.id}>
                  {hg.headers.map((h) => (
                    <TableHead key={h.id}>
                      {h.isPlaceholder
                        ? null
                        : flexRender(h.column.columnDef.header, h.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <React.Fragment key={row.id}>
                    <TableRow data-state={row.getIsSelected() && "selected"}>
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                    {expandedRows.has(row.original.id) && (
                      <TableRow className="hover:bg-transparent">
                        <TableCell colSpan={columns.length} className="p-0">
                          <ExpandedItemsRow items={row.original.items ?? []} />
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
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
                        {globalFilter || statusFilter !== "all"
                          ? "Tidak ada invoice yang sesuai filter."
                          : "Tidak ada data invoice."}
                      </p>
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
            {table.getFilteredRowModel().rows.length !== invoices.length && (
              <span className="ml-2">
                (difilter dari {invoices.length} total)
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

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-card rounded-lg border p-4">
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-blue-500" />
              <h3 className="font-semibold">Total Invoice</h3>
            </div>
            <p className="text-2xl font-bold mt-2">{invoices.length}</p>
            {table.getFilteredRowModel().rows.length !== invoices.length && (
              <p className="text-sm text-muted-foreground">
                ({table.getFilteredRowModel().rows.length} terfilter)
              </p>
            )}
          </div>

          <div className="bg-card rounded-lg border p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-green-500" />
              <h3 className="font-semibold">Total Pendapatan</h3>
            </div>
            <p className="text-xl font-bold mt-2">
              {formatCurrency(totalRevenue)}
            </p>
            <p className="text-xs text-muted-foreground">
              dari invoice terfilter
            </p>
          </div>

          <div className="bg-card rounded-lg border p-4">
            <div className="flex items-center space-x-2">
              <Tag className="h-5 w-5 text-purple-500" />
              <h3 className="font-semibold">Lunas</h3>
            </div>
            <p className="text-2xl font-bold mt-2">{paidCount}</p>
            <p className="text-sm text-muted-foreground">
              invoice berstatus PAID
            </p>
          </div>

          <div className="bg-card rounded-lg border p-4">
            <div className="flex items-center space-x-2">
              <Package className="h-5 w-5 text-orange-500" />
              <h3 className="font-semibold">Draft</h3>
            </div>
            <p className="text-2xl font-bold mt-2">
              {invoices.filter((i) => i.status === "DRAFT").length}
            </p>
            <p className="text-sm text-muted-foreground">
              invoice belum dikirim
            </p>
          </div>
        </div>

        {/* Dialogs */}
        <InvoiceFormDialog
          open={createDialogOpen}
          onOpenChange={setCreateDialogOpen}
          onSuccess={handleSuccess}
        />
        <InvoiceFormDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          editData={selectedInvoice}
          onSuccess={handleSuccess}
        />
        <DeleteInvoiceDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          invoiceData={selectedInvoice}
          onSuccess={handleSuccess}
        />
      </div>
    </>
  );
}
