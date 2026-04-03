"use client";

import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
  pdf,
} from "@react-pdf/renderer";

export type InvoicePDFData = {
  id: string;
  invoiceNumber: string;
  issuedAt: string;
  dueDate: string;
  status: string;
  subTotal: number;
  discountRate: number;
  discountValue: number;
  taxRate: number;
  taxValue: number;
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
    imageUrl?: string | null;
  };
  customer?: {
    name: string;
    address?: string;
    phone?: string;
  };
  items?: {
    product?: { name: string; imageUrl?: string | null };
    productId: string;
    productName?: string;
    description?: string | null;
    price: number;
    quantity: number;
    total: number;
  }[];
};

const fmt = (v: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(v);

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

// colour palette
const C = {
  dark: "#1a1a2e",
  accent: "#16213e",
  mid: "#0f3460",
  light: "#e8eaf6",
  muted: "#888",
  border: "#dde1f0",
};

const S = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 9,
    color: "#222",
    backgroundColor: "#fff",
  },

  // ── header band ──────────────────────────────────────────────────────────
  headerBand: {
    backgroundColor: C.dark,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 32,
    paddingVertical: 14,
  },
  appLogo: { width: 36, height: 36, objectFit: "contain" },
  companyLogoWrap: { alignItems: "flex-end" },
  companyLogo: { width: 44, height: 44, objectFit: "contain" },
  docTypeLabel: {
    color: "#fff",
    fontSize: 18,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 2,
  },
  headerRight: { alignItems: "flex-end" },
  invoiceNoText: { color: "#aab4d4", fontSize: 8 },
  invoiceNoVal: { color: "#fff", fontSize: 11, fontFamily: "Helvetica-Bold" },

  // ── meta strip ───────────────────────────────────────────────────────────
  metaStrip: {
    backgroundColor: C.light,
    flexDirection: "row",
    paddingHorizontal: 32,
    paddingVertical: 8,
    justifyContent: "space-between",
  },
  metaItem: { alignItems: "center" },
  metaLabel: {
    fontSize: 7,
    color: C.muted,
    fontFamily: "Helvetica-Bold",
    marginBottom: 1,
  },
  metaValue: { fontSize: 8, color: C.dark, fontFamily: "Helvetica-Bold" },

  // ── body ─────────────────────────────────────────────────────────────────
  body: { paddingHorizontal: 32, paddingTop: 16, paddingBottom: 24 },

  // ── parties ──────────────────────────────────────────────────────────────
  partiesRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  partyBox: { width: "47%" },
  partyLabel: {
    fontSize: 7,
    color: C.muted,
    fontFamily: "Helvetica-Bold",
    marginBottom: 3,
    textTransform: "uppercase",
  },
  partyName: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: C.dark,
    marginBottom: 2,
  },
  partyInfo: { fontSize: 8, color: "#555", lineHeight: 1.5 },

  // ── table ────────────────────────────────────────────────────────────────
  tableHead: {
    flexDirection: "row",
    backgroundColor: C.mid,
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  thText: { color: "#fff", fontSize: 7, fontFamily: "Helvetica-Bold" },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    paddingVertical: 5,
    paddingHorizontal: 4,
  },
  tableRowAlt: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    paddingVertical: 5,
    paddingHorizontal: 4,
    backgroundColor: "#f7f8fc",
  },
  td: { fontSize: 8, color: "#333" },
  c0: { width: "4%" },
  c1: { width: "24%" },
  c2: { width: "28%" },
  c3: { width: "18%", textAlign: "right" },
  c4: { width: "8%", textAlign: "center" },
  c5: { width: "18%", textAlign: "right" },

  // ── totals ───────────────────────────────────────────────────────────────
  totalsWrap: { alignItems: "flex-end", marginTop: 10 },
  totalLine: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: 220,
    marginBottom: 3,
  },
  totalLbl: { fontSize: 8, color: "#555" },
  totalVal: { fontSize: 8, color: "#333" },
  totalDivider: {
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    width: 220,
    marginVertical: 4,
  },
  grandRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: 220,
    backgroundColor: C.dark,
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderRadius: 3,
  },
  grandLbl: { fontSize: 10, fontFamily: "Helvetica-Bold", color: "#fff" },
  grandVal: { fontSize: 10, fontFamily: "Helvetica-Bold", color: "#fff" },
  terbilang: {
    fontSize: 7,
    color: C.muted,
    fontFamily: "Helvetica-Oblique",
    marginTop: 5,
    maxWidth: 220,
    textAlign: "right",
  },

  // ── footer ───────────────────────────────────────────────────────────────
  footerDivider: {
    borderTopWidth: 1,
    borderTopColor: C.border,
    marginTop: 20,
    marginBottom: 12,
  },
  footerRow: { flexDirection: "row", justifyContent: "space-between" },
  bankBox: {},
  bankTitle: {
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    color: C.muted,
    marginBottom: 4,
    textTransform: "uppercase",
  },
  bankInfo: { fontSize: 8, color: "#444", lineHeight: 1.6 },
  sigBox: { alignItems: "center", width: 130 },
  sigLabel: { fontSize: 8, color: "#555", marginBottom: 32 },
  sigLine: {
    borderBottomWidth: 1,
    borderBottomColor: "#999",
    width: 120,
    marginBottom: 4,
  },
  sigName: { fontSize: 8, fontFamily: "Helvetica-Bold" },
  sigTitle: { fontSize: 7, color: C.muted },
});

function InvoiceDocument({ invoice }: { invoice: InvoicePDFData }) {
  const items = invoice.items ?? [];
  const taxRate = invoice.taxRate ?? 11;
  const taxValue = invoice.taxValue ?? invoice.totalAmount * (taxRate / 100);
  const grandTotal = Math.round(invoice.totalAmount);

  return (
    <Document>
      <Page size="A4" style={S.page}>
        {/* ── Header Band ── */}
        <View style={S.headerBand}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <Image src="/logo.png" style={S.appLogo} />
            <View>
              <Text
                style={{
                  color: "#fff",
                  fontSize: 11,
                  fontFamily: "Helvetica-Bold",
                }}
              >
                {invoice.company?.brandName ?? invoice.company?.name ?? ""}
              </Text>
              <Text style={{ color: "#aab4d4", fontSize: 7 }}>
                {[
                  invoice.company?.address,
                  invoice.company?.email,
                  invoice.company?.phone,
                ]
                  .filter(Boolean)
                  .join("  ·  ")}
              </Text>
            </View>
          </View>
          <View style={S.headerRight}>
            <Text style={S.docTypeLabel}>INVOICE</Text>
            <Text style={S.invoiceNoText}>No. Invoice</Text>
            <Text style={S.invoiceNoVal}>{invoice.invoiceNumber}</Text>
            {invoice.company?.imageUrl && (
              <Image
                src={invoice.company.imageUrl}
                style={{
                  width: 36,
                  height: 36,
                  objectFit: "contain",
                  marginTop: 6,
                }}
              />
            )}
          </View>
        </View>

        {/* ── Meta Strip ── */}
        <View style={S.metaStrip}>
          {[
            { label: "TANGGAL TERBIT", value: fmtDate(invoice.issuedAt) },
            { label: "JATUH TEMPO", value: fmtDate(invoice.dueDate) },
            { label: "STATUS", value: invoice.status },
          ].map((m) => (
            <View key={m.label} style={S.metaItem}>
              <Text style={S.metaLabel}>{m.label}</Text>
              <Text style={S.metaValue}>{m.value}</Text>
            </View>
          ))}
        </View>

        {/* ── Body ── */}
        <View style={S.body}>
          {/* Parties */}
          <View style={S.partiesRow}>
            <View style={S.partyBox}>
              <Text style={S.partyLabel}>Dari</Text>
              <Text style={S.partyName}>{invoice.company?.name ?? "-"}</Text>
              <Text style={S.partyInfo}>
                {[
                  invoice.company?.address,
                  invoice.company?.email,
                  invoice.company?.phone,
                ]
                  .filter(Boolean)
                  .join("\n")}
              </Text>
            </View>
            <View style={S.partyBox}>
              <Text style={S.partyLabel}>Tagihan Kepada</Text>
              <Text style={S.partyName}>{invoice.customer?.name ?? "-"}</Text>
              <Text style={S.partyInfo}>
                {[invoice.customer?.address, invoice.customer?.phone]
                  .filter(Boolean)
                  .join("\n")}
              </Text>
            </View>
          </View>

          {/* Table */}
          <View style={S.tableHead}>
            <Text style={[S.thText, S.c0]}>#</Text>
            <Text style={[S.thText, S.c1]}>Produk</Text>
            <Text style={[S.thText, S.c2]}>Deskripsi</Text>
            <Text style={[S.thText, S.c3]}>Harga</Text>
            <Text style={[S.thText, S.c4]}>Qty</Text>
            <Text style={[S.thText, S.c5]}>Total</Text>
          </View>
          {items.map((item, i) => (
            <View key={i} style={i % 2 === 0 ? S.tableRow : S.tableRowAlt}>
              <Text style={[S.td, S.c0]}>{i + 1}</Text>
              <Text style={[S.td, S.c1]}>
                {item.product?.name ??
                  item.productName ??
                  item.productId.slice(0, 8)}
              </Text>
              <Text style={[S.td, S.c2]}>{item.description ?? "-"}</Text>
              <Text style={[S.td, S.c3]}>{fmt(Number(item.price))}</Text>
              <Text style={[S.td, S.c4]}>{item.quantity}</Text>
              <Text style={[S.td, S.c5]}>{fmt(Number(item.total))}</Text>
            </View>
          ))}

          {/* Totals */}
          <View style={S.totalsWrap}>
            <View style={S.totalLine}>
              <Text style={S.totalLbl}>Subtotal</Text>
              <Text style={S.totalVal}>{fmt(invoice.subTotal)}</Text>
            </View>
            {invoice.discountRate > 0 && (
              <View style={S.totalLine}>
                <Text style={S.totalLbl}>Diskon ({invoice.discountRate}%)</Text>
                <Text style={S.totalVal}>-{fmt(invoice.discountValue)}</Text>
              </View>
            )}
            <View style={S.totalLine}>
              <Text style={S.totalLbl}>PPN ({taxRate}%)</Text>
              <Text style={S.totalVal}>{fmt(taxValue)}</Text>
            </View>
            <View style={S.totalDivider} />
            <View style={S.grandRow}>
              <Text style={S.grandLbl}>TOTAL</Text>
              <Text style={S.grandVal}>{fmt(grandTotal)}</Text>
            </View>
            <Text style={S.terbilang}>{invoice.totalInWords}</Text>
          </View>

          {/* Footer */}
          <View style={S.footerDivider} />
          <View style={S.footerRow}>
            <View style={S.bankBox}>
              <Text style={S.bankTitle}>Informasi Pembayaran</Text>
              <Text style={S.bankInfo}>
                {`Bank        : ${invoice.company?.bankName ?? "-"}\nNo. Rek  : ${invoice.company?.bankAccount ?? "-"}\nA/N          : ${invoice.company?.senderName ?? "-"}`}
              </Text>
            </View>
            <View style={S.sigBox}>
              <Text style={S.sigLabel}>Hormat kami,</Text>
              <View style={S.sigLine} />
              <Text style={S.sigName}>{invoice.company?.senderName ?? ""}</Text>
              <Text style={S.sigTitle}>
                {invoice.company?.senderTitle ?? ""}
              </Text>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
}

export async function createPDFInvoice(invoice: InvoicePDFData) {
  const blob = await pdf(<InvoiceDocument invoice={invoice} />).toBlob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `Invoice-${invoice.invoiceNumber}.pdf`;
  a.click();
  URL.revokeObjectURL(url);
}
