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

export type OfferingPDFData = {
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

const C = {
  dark: "#1a3a6b",
  accent: "#2563a8",
  light: "#eef2fb",
  muted: "#888",
  border: "#d4ddf5",
};

const S = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 9,
    color: "#222",
    backgroundColor: "#fff",
  },

  headerBand: {
    backgroundColor: C.dark,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 32,
    paddingVertical: 14,
  },
  appLogo: { width: 36, height: 36, objectFit: "contain" },
  docTypeLabel: {
    color: "#fff",
    fontSize: 18,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 2,
  },
  headerRight: { alignItems: "flex-end" },
  noText: { color: "#aac4e8", fontSize: 8 },
  noVal: { color: "#fff", fontSize: 11, fontFamily: "Helvetica-Bold" },

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

  body: { paddingHorizontal: 32, paddingTop: 16, paddingBottom: 24 },

  partiesRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  partyBox: { width: "47%" },
  partyLabel: {
    fontSize: 7,
    color: C.muted,
    fontFamily: "Helvetica-Bold",
    marginBottom: 3,
  },
  partyName: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: C.dark,
    marginBottom: 2,
  },
  partyInfo: { fontSize: 8, color: "#555", lineHeight: 1.5 },

  intro: {
    fontSize: 8,
    color: "#444",
    marginBottom: 10,
    fontFamily: "Helvetica-Oblique",
  },

  tableHead: {
    flexDirection: "row",
    backgroundColor: C.accent,
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
    backgroundColor: "#f4f7ff",
  },
  td: { fontSize: 8, color: "#333" },
  c0: { width: "4%" },
  c1: { width: "24%" },
  c2: { width: "28%" },
  c3: { width: "18%", textAlign: "right" },
  c4: { width: "8%", textAlign: "center" },
  c5: { width: "18%", textAlign: "right" },

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

  closing: {
    fontSize: 8,
    color: "#555",
    marginTop: 16,
    marginBottom: 20,
    fontFamily: "Helvetica-Oblique",
  },
  footerDivider: {
    borderTopWidth: 1,
    borderTopColor: C.border,
    marginTop: 8,
    marginBottom: 12,
  },
  sigBox: { alignItems: "center", width: 130, alignSelf: "flex-end" },
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

function OfferingDocument({ offering }: { offering: OfferingPDFData }) {
  const items = offering.items ?? [];
  const taxRate = offering.taxRate ?? 11;
  const taxValue = offering.taxValue ?? offering.totalAmount * (taxRate / 100);
  const grandTotal = Math.round(offering.totalAmount);

  return (
    <Document>
      <Page size="A4" style={S.page}>
        {/* Header Band */}
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
                {offering.company?.brandName ?? offering.company?.name ?? ""}
              </Text>
              <Text style={{ color: "#aac4e8", fontSize: 7 }}>
                {[
                  offering.company?.address,
                  offering.company?.email,
                  offering.company?.phone,
                ]
                  .filter(Boolean)
                  .join("  ·  ")}
              </Text>
            </View>
          </View>
          <View style={S.headerRight}>
            <Text style={S.docTypeLabel}>PENAWARAN</Text>
            <Text style={S.noText}>No. Penawaran</Text>
            <Text style={S.noVal}>{offering.invoiceNumber}</Text>
            {offering.company?.imageUrl && (
              <Image
                src={offering.company.imageUrl}
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

        {/* Meta Strip */}
        <View style={S.metaStrip}>
          {[
            { label: "TANGGAL", value: fmtDate(offering.issuedAt) },
            { label: "BERLAKU S/D", value: fmtDate(offering.dueDate) },
            { label: "STATUS", value: offering.status },
          ].map((m) => (
            <View key={m.label} style={S.metaItem}>
              <Text style={S.metaLabel}>{m.label}</Text>
              <Text style={S.metaValue}>{m.value}</Text>
            </View>
          ))}
        </View>

        {/* Body */}
        <View style={S.body}>
          {/* Parties */}
          <View style={S.partiesRow}>
            <View style={S.partyBox}>
              <Text style={S.partyLabel}>DARI</Text>
              <Text style={S.partyName}>{offering.company?.name ?? "-"}</Text>
              <Text style={S.partyInfo}>
                {[
                  offering.company?.address,
                  offering.company?.email,
                  offering.company?.phone,
                ]
                  .filter(Boolean)
                  .join("\n")}
              </Text>
            </View>
            <View style={S.partyBox}>
              <Text style={S.partyLabel}>DITUJUKAN KEPADA</Text>
              <Text style={S.partyName}>{offering.customer?.name ?? "-"}</Text>
              <Text style={S.partyInfo}>
                {[offering.customer?.address, offering.customer?.phone]
                  .filter(Boolean)
                  .join("\n")}
              </Text>
            </View>
          </View>

          <Text style={S.intro}>
            Dengan hormat, bersama ini kami sampaikan penawaran harga sebagai
            berikut:
          </Text>

          {/* Table */}
          <View style={S.tableHead}>
            <Text style={[S.thText, S.c0]}>#</Text>
            <Text style={[S.thText, S.c1]}>Produk / Jasa</Text>
            <Text style={[S.thText, S.c2]}>Keterangan</Text>
            <Text style={[S.thText, S.c3]}>Harga Satuan</Text>
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
              <Text style={S.totalVal}>{fmt(offering.subTotal)}</Text>
            </View>
            {offering.discountRate > 0 && (
              <View style={S.totalLine}>
                <Text style={S.totalLbl}>
                  Diskon ({offering.discountRate}%)
                </Text>
                <Text style={S.totalVal}>-{fmt(offering.discountValue)}</Text>
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
            <Text style={S.terbilang}>{offering.totalInWords}</Text>
          </View>

          <Text style={S.closing}>
            Demikian penawaran ini kami sampaikan. Atas perhatian dan
            kerjasamanya kami ucapkan terima kasih.
          </Text>

          <View style={S.footerDivider} />
          <View style={S.sigBox}>
            <Text style={S.sigLabel}>Hormat kami,</Text>
            <View style={S.sigLine} />
            <Text style={S.sigName}>{offering.company?.senderName ?? ""}</Text>
            <Text style={S.sigTitle}>
              {offering.company?.senderTitle ?? ""}
            </Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}

export async function createPDFOffering(offering: OfferingPDFData) {
  const blob = await pdf(<OfferingDocument offering={offering} />).toBlob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `Penawaran-${offering.invoiceNumber}.pdf`;
  a.click();
  URL.revokeObjectURL(url);
}
