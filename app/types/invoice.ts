interface Items {
  description: string;
  quantity: number;
  price: number;
  total: number;
}

export interface InvoiceForm {
  invoiceNumber: string;
  issuedAt: string;
  dueDate: string;
  companyId: string;
  customerId: string;
  subTotal: number;
  discountRate: number;
  discountValue: number;
  taxRate: number;
  taxValue: number;
  totalAmount: number;
  totalInWords: string;
  status: string;
}

export interface InvoiceData extends InvoiceForm {
  id: string;
  createdAt: string;
  updatedAt: string;
  items?: Items[];
  company?: {
    id: string;
    name: string;
    brandName: string;
    imageUrl?: string | null;
  };
  customer?: { id: string; name: string };
  _count?: { items: number };
}
