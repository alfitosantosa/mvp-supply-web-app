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

export type TravelDocsPDFData = {
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
  dark: "#1a1a2e",
  muted: "#888",
  border: "#dde1f0",
  light: "#f5f5f8",
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
  noText: { color: "#aab4d4", fontSize: 8 },
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
    marginBottom: 14,
  },
  partyBox: {
    width: "47%",
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 3,
    padding: 8,
  },
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

  tableHead: {
    flexDirection: "row",
    backgroundColor: C.dark,
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
    backgroundColor: C.light,
  },
  td: { fontSize: 8, color: "#333" },
  c0: { width: "5%" },
  c1: { width: "35%" },
  c2: { width: "35%" },
  c3: { width: "12%", textAlign: "center" },
  c4: { width: "13%", textAlign: "center" },

  totalsWrap: { alignItems: "flex-end", marginTop: 10, marginBottom: 10 },
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

  notesBox: {
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 3,
    padding: 8,
    marginBottom: 16,
  },
  notesLabel: {
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    color: C.muted,
    marginBottom: 4,
  },
  noteText: { fontSize: 8, color: "#555", lineHeight: 1.6 },

  sigsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  sigBlock: { alignItems: "center", width: "30%" },
  sigLabel: { fontSize: 8, color: "#555", marginBottom: 32 },
  sigLine: {
    borderBottomWidth: 1,
    borderBottomColor: "#999",
    width: "100%",
    marginBottom: 4,
  },
  sigName: { fontSize: 8, fontFamily: "Helvetica-Bold", textAlign: "center" },
  sigTitle: { fontSize: 7, color: C.muted, textAlign: "center" },
});

function TravelDocsDocument({ data }: { data: TravelDocsPDFData }) {
  const items = data.items ?? [];
  const taxRate = data.taxRate ?? 11;
  const taxValue = data.taxValue ?? data.totalAmount * (taxRate / 100);
  const grandTotal = Math.round(data.totalAmount);

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
                {data.company?.brandName ?? data.company?.name ?? ""}
              </Text>
              <Text style={{ color: "#aab4d4", fontSize: 7 }}>
                {[
                  data.company?.address,
                  data.company?.email,
                  data.company?.phone,
                ]
                  .filter(Boolean)
                  .join("  ·  ")}
              </Text>
            </View>
          </View>
          <View style={S.headerRight}>
            <Text style={S.docTypeLabel}>SURAT JALAN</Text>
            <Text style={S.noText}>No. Surat Jalan</Text>
            <Text style={S.noVal}>{data.invoiceNumber}</Text>
            {data.company?.imageUrl && (
              <Image
                src={data.company.imageUrl}
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
            { label: "TANGGAL", value: fmtDate(data.issuedAt) },
            { label: "REF. INVOICE", value: data.invoiceNumber },
            { label: "STATUS", value: data.status },
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
              <Text style={S.partyLabel}>PENGIRIM</Text>
              <Text style={S.partyName}>{data.company?.name ?? "-"}</Text>
              <Text style={S.partyInfo}>
                {[data.company?.address, data.company?.phone]
                  .filter(Boolean)
                  .join("\n")}
              </Text>
            </View>
            <View style={S.partyBox}>
              <Text style={S.partyLabel}>PENERIMA</Text>
              <Text style={S.partyName}>{data.customer?.name ?? "-"}</Text>
              <Text style={S.partyInfo}>
                {[data.customer?.address, data.customer?.phone]
                  .filter(Boolean)
                  .join("\n")}
              </Text>
            </View>
          </View>

          {/* Table */}
          <View style={S.tableHead}>
            <Text style={[S.thText, S.c0]}>#</Text>
            <Text style={[S.thText, S.c1]}>Nama Barang</Text>
            <Text style={[S.thText, S.c2]}>Keterangan</Text>
            <Text style={[S.thText, S.c3]}>Qty</Text>
            <Text style={[S.thText, S.c4]}>Kondisi</Text>
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
              <Text style={[S.td, S.c3]}>{item.quantity}</Text>
              <Text style={[S.td, S.c4]}>Baik</Text>
            </View>
          ))}

          {/* Totals */}
          <View style={S.totalsWrap}>
            <View style={S.totalLine}>
              <Text style={S.totalLbl}>Subtotal</Text>
              <Text style={S.totalVal}>{fmt(data.subTotal)}</Text>
            </View>
            {data.discountRate > 0 && (
              <View style={S.totalLine}>
                <Text style={S.totalLbl}>Diskon ({data.discountRate}%)</Text>
                <Text style={S.totalVal}>-{fmt(data.discountValue)}</Text>
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
          </View>

          {/* Notes */}
          <View style={S.notesBox}>
            <Text style={S.notesLabel}>CATATAN</Text>
            <Text style={S.noteText}>
              1. Barang yang sudah diterima tidak dapat dikembalikan.
            </Text>
            <Text style={S.noteText}>
              2. Harap periksa barang sebelum menandatangani surat jalan ini.
            </Text>
          </View>

          {/* Signatures */}
          <View style={S.sigsRow}>
            <View style={S.sigBlock}>
              <Text style={S.sigLabel}>Pengirim,</Text>
              <View style={S.sigLine} />
              <Text style={S.sigName}>
                {data.company?.senderName ?? "( ________________ )"}
              </Text>
              <Text style={S.sigTitle}>{data.company?.senderTitle ?? ""}</Text>
            </View>
            <View style={S.sigBlock}>
              <Text style={S.sigLabel}>Pengemudi,</Text>
              <View style={S.sigLine} />
              <Text style={S.sigName}>( ________________ )</Text>
            </View>
            <View style={S.sigBlock}>
              <Text style={S.sigLabel}>Penerima,</Text>
              <View style={S.sigLine} />
              <Text style={S.sigName}>
                {data.customer?.name ?? "( ________________ )"}
              </Text>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
}

export async function createPDFTravelDocs(data: TravelDocsPDFData) {
  const blob = await pdf(<TravelDocsDocument data={data} />).toBlob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `SuratJalan-${data.invoiceNumber}.pdf`;
  a.click();
  URL.revokeObjectURL(url);
}
