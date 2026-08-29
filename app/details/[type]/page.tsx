"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

const money = (n: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(n || 0));

export default function DetailPage() {
  const { type } = useParams<{ type: string }>();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const apiType =
          type === "expenses" || type === "profit" ? "finance" :
          type === "kpi" ? "employees" : type;

        const r = await fetch(`/api/reports?type=${apiType}`, { cache: "no-store" });
        const x = await r.json();
        if (!r.ok) throw new Error(x.error || x.message || "Gagal mengambil data");
        setData(x.reports);
      } catch (e: any) {
        setError(e.message || "Gagal mengambil data");
      } finally {
        setLoading(false);
      }
    })();
  }, [type]);

  const title: Record<string, string> = {
    finance: "Pendapatan",
    expenses: "Pengeluaran",
    profit: "Laba",
    customers: "Pelanggan",
    kpi: "KPI & Performa",
    analytics: "Analisis Bisnis",
  };

  if (loading) return <main><section className="card">Memuat data...</section></main>;
  if (error) return <main><section className="card">{error}</section></main>;

  if (type === "customers") {
    const rows = Array.isArray(data) ? data : [];
    return (
      <main className="space-y-6">
        <div className="section-title"><div><span className="eyebrow">DETAIL</span><h1>Pelanggan</h1></div></div>
        <section className="card table-wrap">
          <table>
            <thead><tr><th>Nama</th><th>No. Pelanggan</th><th>Telepon</th></tr></thead>
            <tbody>{rows.map((x: any) => <tr key={x.id}><td>{x.name}</td><td>{x.customerNo}</td><td>{x.phone || "-"}</td></tr>)}</tbody>
          </table>
          {!rows.length && <p className="muted">Belum ada data pelanggan.</p>}
        </section>
      </main>
    );
  }

  if (type === "kpi") {
    const rows = Array.isArray(data) ? data : [];
    return (
      <main className="space-y-6">
        <div className="section-title"><div><span className="eyebrow">KPI</span><h1>Target & Performa</h1></div></div>
        <section className="card table-wrap">
          <table>
            <thead><tr><th>Karyawan</th><th>Role</th><th>Target</th><th>Transaksi</th><th>Pendapatan</th></tr></thead>
            <tbody>{rows.map((x: any) => {
              const tx = x.transactions || [];
              const revenue = tx.reduce((s: number, t: any) => s + Number(t.total || 0), 0);
              return <tr key={x.id}><td>{x.name}</td><td>{x.role}</td><td>{money(Number(x.target || 0))}</td><td>{tx.length}</td><td>{money(revenue)}</td></tr>;
            })}</tbody>
          </table>
        </section>
      </main>
    );
  }

  const finance = data || {};
  const value =
    type === "expenses" ? finance.expenses :
    type === "profit" ? finance.revenue - finance.expenses :
    finance.revenue;

  return (
    <main className="space-y-6">
      <div className="section-title">
        <div><span className="eyebrow">DETAIL</span><h1>{title[type] || "Detail"}</h1></div>
        <Link className="secondary-btn link-btn" href="/">Dashboard</Link>
      </div>
      <section className="grid">
        <div className="card"><p className="muted">Pendapatan</p><h2>{money(finance.revenue)}</h2></div>
        <div className="card"><p className="muted">Pengeluaran</p><h2>{money(finance.expenses)}</h2></div>
        <div className="card"><p className="muted">Laba</p><h2>{money(finance.revenue - finance.expenses)}</h2></div>
        <div className="card"><p className="muted">{title[type] || "Nilai"}</p><h2>{money(value)}</h2></div>
      </section>
    </main>
  );
}
