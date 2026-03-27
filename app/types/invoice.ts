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
  totalAmount: number;
  totalInWords: string;
  status: string;
}

export interface InvoiceData extends InvoiceForm {
  id: string;
  createdAt: string;
  updatedAt: string;
}
