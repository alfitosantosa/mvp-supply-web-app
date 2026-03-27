export interface InvoiceItemForm {
  invoiceId: string;
  productId: string;
  productName?: string;
  imageUrl?: string | null;
  description?: string | null;
  price: number;
  quantity: number;
  total: number;
}

export interface InvoiceItemData extends InvoiceItemForm {
  id: string;
  createdAt: string;
  updatedAt: string;
  product?: { id: string; name: string };
}
