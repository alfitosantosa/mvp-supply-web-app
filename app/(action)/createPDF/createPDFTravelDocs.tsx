"use client";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export type TravelDocsPDFData = {
  id: string;
  invoiceNumber: string;
  issuedAt: string;
  dueDate: string;
  status: string;
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

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export function createPDFTravelDocs(data: TravelDocsPDFData) {
  const doc = new jsPDF();
  const pageW = doc.internal.pageSize.getWidth();

  // Header bar
  doc.setFillColor(30, 30, 30);
  doc.rect(0, 0, pageW, 18, "F");
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(255);
  doc.text("SURAT JALAN", 14, 12);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(
    data.company?.brandName ?? data.company?.name ?? "",
    pageW - 14,
    12,
    { align: "right" },
  );

  // Company info
  doc.setTextColor(60);
  doc.setFontSize(9);
  if (data.company?.address) doc.text(data.company.address, 14, 26);
  if (data.company?.email) doc.text(data.company.email, 14, 31);
  if (data.company?.phone) doc.text(data.company.phone, 14, 36);

  // Doc info right
  doc.setTextColor(40);
  doc.text(`No. Surat Jalan: ${data.invoiceNumber}`, pageW - 14, 24, {
    align: "right",
  });
  doc.text(`Tanggal: ${formatDate(data.issuedAt)}`, pageW - 14, 30, {
    align: "right",
  });

  doc.setDrawColor(180);
  doc.line(14, 42, pageW - 14, 42);

  // Pengirim
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(100);
  doc.text("PENGIRIM:", 14, 50);
  doc.setFontSize(10);
  doc.setTextColor(30);
  doc.text(data.company?.name ?? "-", 14, 57);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(80);
  if (data.company?.address) doc.text(data.company.address, 14, 63);
  if (data.company?.phone) doc.text(data.company.phone, 14, 68);

  // Penerima
  const mid = pageW / 2;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(100);
  doc.text("PENERIMA:", mid, 50);
  doc.setFontSize(10);
  doc.setTextColor(30);
  doc.text(data.customer?.name ?? "-", mid, 57);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(80);
  if (data.customer?.address) doc.text(data.customer.address, mid, 63);
  if (data.customer?.phone) doc.text(data.customer.phone, mid, 68);

  // Items table
  const tableRows = (data.items ?? []).map((item, i) => [
    i + 1,
    item.product?.name ?? item.productName ?? item.productId.slice(0, 8),
    item.description ?? "-",
    item.quantity,
    "Baik",
  ]);

  autoTable(doc, {
    startY: 76,
    head: [["#", "Nama Barang", "Keterangan", "Qty", "Kondisi"]],
    body: tableRows,
    styles: { fontSize: 9 },
    headStyles: { fillColor: [30, 30, 30], textColor: 255 },
    columnStyles: {
      0: { cellWidth: 8, halign: "center" },
      3: { halign: "center", cellWidth: 14 },
      4: { halign: "center", cellWidth: 20 },
    },
  });

  const finalY = (doc as any).lastAutoTable.finalY + 12;

  doc.setFontSize(9);
  doc.setTextColor(60);
  doc.text("Catatan:", 14, finalY);
  doc.text(
    "1. Barang yang sudah diterima tidak dapat dikembalikan.",
    14,
    finalY + 6,
  );
  doc.text(
    "2. Harap periksa barang sebelum menandatangani surat jalan ini.",
    14,
    finalY + 12,
  );

  // Signatures
  const sigY = finalY + 30;
  const col1 = 14;
  const col2 = mid - 10;
  const col3 = pageW - 60;

  doc.setFontSize(9);
  doc.setTextColor(60);
  doc.text("Pengirim,", col1, sigY);
  doc.text("Pengemudi,", col2, sigY);
  doc.text("Penerima,", col3, sigY);

  doc.setDrawColor(150);
  doc.line(col1, sigY + 20, col1 + 45, sigY + 20);
  doc.line(col2, sigY + 20, col2 + 45, sigY + 20);
  doc.line(col3, sigY + 20, col3 + 45, sigY + 20);

  doc.setFontSize(8);
  doc.setTextColor(60);
  doc.text(data.company?.senderName ?? "( ________________ )", col1, sigY + 26);
  doc.text("( ________________ )", col2, sigY + 26);
  doc.text(data.customer?.name ?? "( ________________ )", col3, sigY + 26);

  doc.save(`SuratJalan-${data.invoiceNumber}.pdf`);
}
