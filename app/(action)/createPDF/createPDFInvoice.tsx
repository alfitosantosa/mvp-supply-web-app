"use client";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export type InvoicePDFData = {
  id: string;
  invoiceNumber: string;
  issuedAt: string;
  dueDate: string;
  status: string;
  subTotal: number;
  discountRate: number;
  discountValue: number;
  totalAmount: number;
  totalInWords: string;
  company?: {
    name: string;
    brandName?: string;
    address?: string;
    email?: string;
    phone?: string;
    bankName?: string;
    bankAccount?: string;
    senderName?: string;
    senderTitle?: string;
  };
  customer?: {
    name: string;
    address?: string;
    phone?: string;
  };
  items?: {
    product?: { name: string };
    productId: string;
    productName?: string;
    description?: string | null;
    price: number;
    quantity: number;
    total: number;
  }[];
};

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
    month: "long",
    year: "numeric",
  });
}

export function createPDFInvoice(invoice: InvoicePDFData) {
  const doc = new jsPDF();
  const pageW = doc.internal.pageSize.getWidth();

  // Header
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text(
    invoice.company?.brandName ?? invoice.company?.name ?? "INVOICE",
    14,
    20,
  );

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100);
  if (invoice.company?.address) doc.text(invoice.company.address, 14, 27);
  if (invoice.company?.email) doc.text(invoice.company.email, 14, 32);
  if (invoice.company?.phone) doc.text(invoice.company.phone, 14, 37);

  // Invoice title & number (right side)
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30);
  doc.text("INVOICE", pageW - 14, 20, { align: "right" });

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(80);
  doc.text(`No: ${invoice.invoiceNumber}`, pageW - 14, 28, { align: "right" });
  doc.text(`Tanggal: ${formatDate(invoice.issuedAt)}`, pageW - 14, 34, {
    align: "right",
  });
  doc.text(`Jatuh Tempo: ${formatDate(invoice.dueDate)}`, pageW - 14, 40, {
    align: "right",
  });
  doc.text(`Status: ${invoice.status}`, pageW - 14, 46, { align: "right" });

  // Divider
  doc.setDrawColor(200);
  doc.line(14, 50, pageW - 14, 50);

  // Bill To
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(100);
  doc.text("TAGIHAN KEPADA:", 14, 58);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(30);
  doc.text(invoice.customer?.name ?? "-", 14, 65);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(80);
  if (invoice.customer?.address) doc.text(invoice.customer.address, 14, 71);
  if (invoice.customer?.phone) doc.text(invoice.customer.phone, 14, 76);

  // Items table
  const tableRows = (invoice.items ?? []).map((item, i) => [
    i + 1,
    item.product?.name ?? item.productName ?? item.productId.slice(0, 8),
    item.description ?? "-",
    formatCurrency(Number(item.price)),
    item.quantity,
    formatCurrency(Number(item.total)),
  ]);

  autoTable(doc, {
    startY: 85,
    head: [["#", "Produk", "Deskripsi", "Harga", "Qty", "Total"]],
    body: tableRows,
    styles: { fontSize: 9 },
    headStyles: { fillColor: [40, 40, 40], textColor: 255 },
    columnStyles: {
      0: { cellWidth: 8, halign: "center" },
      3: { halign: "right" },
      4: { halign: "center", cellWidth: 12 },
      5: { halign: "right" },
    },
  });

  const finalY = (doc as any).lastAutoTable.finalY + 8;

  // Totals
  const rightX = pageW - 14;
  const labelX = pageW - 70;

  doc.setFontSize(9);
  doc.setTextColor(80);
  doc.text("Subtotal:", labelX, finalY);
  doc.text(formatCurrency(invoice.subTotal), rightX, finalY, {
    align: "right",
  });

  if (invoice.discountRate > 0) {
    doc.text(`Diskon (${invoice.discountRate}%):`, labelX, finalY + 6);
    doc.text(`-${formatCurrency(invoice.discountValue)}`, rightX, finalY + 6, {
      align: "right",
    });
  }

  doc.setDrawColor(180);
  doc.line(labelX, finalY + 10, rightX, finalY + 10);

  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30);
  doc.text("TOTAL:", labelX, finalY + 17);
  doc.text(formatCurrency(invoice.totalAmount), rightX, finalY + 17, {
    align: "right",
  });

  doc.setFontSize(8);
  doc.setFont("helvetica", "italic");
  doc.setTextColor(100);
  doc.text(`Terbilang: ${invoice.totalInWords}`, 14, finalY + 17);

  // Bank info
  if (invoice.company?.bankName) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(60);
    doc.text("Informasi Pembayaran:", 14, finalY + 28);
    doc.text(`Bank: ${invoice.company.bankName}`, 14, finalY + 34);
    doc.text(
      `No. Rekening: ${invoice.company.bankAccount ?? "-"}`,
      14,
      finalY + 40,
    );
    doc.text(`A/N: ${invoice.company.senderName ?? "-"}`, 14, finalY + 46);
  }

  // Signature
  if (invoice.company?.senderName) {
    doc.setFontSize(9);
    doc.setTextColor(80);
    doc.text("Hormat kami,", rightX - 40, finalY + 28);
    doc.text(invoice.company.senderName, rightX - 40, finalY + 50);
    doc.text(invoice.company.senderTitle ?? "", rightX - 40, finalY + 56);
  }

  doc.save(`Invoice-${invoice.invoiceNumber}.pdf`);
}
