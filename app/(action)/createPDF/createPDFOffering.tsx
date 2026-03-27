"use client";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export type OfferingPDFData = {
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

export function createPDFOffering(offering: OfferingPDFData) {
  const doc = new jsPDF();
  const pageW = doc.internal.pageSize.getWidth();

  // Header
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text(
    offering.company?.brandName ?? offering.company?.name ?? "PENAWARAN",
    14,
    20,
  );

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100);
  if (offering.company?.address) doc.text(offering.company.address, 14, 27);
  if (offering.company?.email) doc.text(offering.company.email, 14, 32);
  if (offering.company?.phone) doc.text(offering.company.phone, 14, 37);

  // Title right side
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30);
  doc.text("PENAWARAN", pageW - 14, 20, { align: "right" });

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(80);
  doc.text(`No: ${offering.invoiceNumber}`, pageW - 14, 28, { align: "right" });
  doc.text(`Tanggal: ${formatDate(offering.issuedAt)}`, pageW - 14, 34, {
    align: "right",
  });
  doc.text(`Berlaku s/d: ${formatDate(offering.dueDate)}`, pageW - 14, 40, {
    align: "right",
  });

  // Divider
  doc.setDrawColor(200);
  doc.line(14, 50, pageW - 14, 50);

  // Kepada
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(100);
  doc.text("DITUJUKAN KEPADA:", 14, 58);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(30);
  doc.text(offering.customer?.name ?? "-", 14, 65);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(80);
  if (offering.customer?.address) doc.text(offering.customer.address, 14, 71);
  if (offering.customer?.phone) doc.text(offering.customer.phone, 14, 76);

  // Intro text
  doc.setFontSize(9);
  doc.setTextColor(60);
  doc.text(
    "Dengan hormat, bersama ini kami sampaikan penawaran harga sebagai berikut:",
    14,
    83,
  );

  // Items table
  const tableRows = (offering.items ?? []).map((item, i) => [
    i + 1,
    item.product?.name ?? item.productName ?? item.productId.slice(0, 8),
    item.description ?? "-",
    formatCurrency(Number(item.price)),
    item.quantity,
    formatCurrency(Number(item.total)),
  ]);

  autoTable(doc, {
    startY: 88,
    head: [
      ["#", "Produk / Jasa", "Keterangan", "Harga Satuan", "Qty", "Total"],
    ],
    body: tableRows,
    styles: { fontSize: 9 },
    headStyles: { fillColor: [60, 100, 180], textColor: 255 },
    columnStyles: {
      0: { cellWidth: 8, halign: "center" },
      3: { halign: "right" },
      4: { halign: "center", cellWidth: 12 },
      5: { halign: "right" },
    },
  });

  const finalY = (doc as any).lastAutoTable.finalY + 8;
  const rightX = pageW - 14;
  const labelX = pageW - 70;

  // Totals
  doc.setFontSize(9);
  doc.setTextColor(80);
  doc.text("Subtotal:", labelX, finalY);
  doc.text(formatCurrency(offering.subTotal), rightX, finalY, {
    align: "right",
  });

  if (offering.discountRate > 0) {
    doc.text(`Diskon (${offering.discountRate}%):`, labelX, finalY + 6);
    doc.text(`-${formatCurrency(offering.discountValue)}`, rightX, finalY + 6, {
      align: "right",
    });
  }

  doc.setDrawColor(180);
  doc.line(labelX, finalY + 10, rightX, finalY + 10);

  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30);
  doc.text("TOTAL:", labelX, finalY + 17);
  doc.text(formatCurrency(offering.totalAmount), rightX, finalY + 17, {
    align: "right",
  });

  doc.setFontSize(8);
  doc.setFont("helvetica", "italic");
  doc.setTextColor(100);
  doc.text(`Terbilang: ${offering.totalInWords}`, 14, finalY + 17);

  // Closing note
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(60);
  doc.text(
    "Demikian penawaran ini kami sampaikan. Atas perhatian dan kerjasamanya kami ucapkan terima kasih.",
    14,
    finalY + 28,
  );

  // Signature
  if (offering.company?.senderName) {
    doc.setFontSize(9);
    doc.setTextColor(80);
    doc.text("Hormat kami,", rightX - 40, finalY + 38);
    doc.text(offering.company.senderName, rightX - 40, finalY + 58);
    doc.text(offering.company.senderTitle ?? "", rightX - 40, finalY + 64);
  }

  doc.save(`Penawaran-${offering.invoiceNumber}.pdf`);
}
