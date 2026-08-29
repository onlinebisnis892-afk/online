"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { modules } from "@/lib/feature-registry";

const money = (n: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(n || 0));

export default function ModulePage() {
  const { key } = useParams<{ key: string }>();
  const module = useMemo(() => modules.find((m) => m.key === key), [key]);
  const [busy, setBusy] = useState("");
  const [result, setResult] = useState<any>(null);
  const [rows, setRows] = useState<any[]>([]);
  const [loadingRows, setLoadingRows] = useState(false);

  const entityMap: Record<string, string> = {
    branches: "branches",
    employees: "employees",
    customers: "customers",
    services: "services",
    transactions: "transactions",
    finance: "expenses",
    operations: "attendance",
    notifications: "notifications",
    reports: "transactions",
    system: "audit",
    auth: "logins",
  };

  async function runFeature(feature: string) {
    setBusy(feature);
    setResult(null);

    try {
      const response = await fetch(
        `/api/features/${encodeURIComponent(feature)}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
        }
      );

      const data = await response.json();
      setResult({ feature, status: response.status, data });
    } catch (error: any) {
      setResult({ feature, status: 0, data: { ok: false, message: error.message } });
    } finally {
      setBusy("");
    }
  }

  async function loadData() {
    const entity = entityMap[key || ""];
    if (!entity) return;

    setLoadingRows(true);
    try {
      const response = await fetch(`/api/data/${entity}?limit=50`, {
        cache: "no-store",
      });
      const data = await response.json();
      setRows(response.ok ? data.data || [] : []);
    } finally {
      setLoadingRows(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [key]);

  if (!module) {
    return (
      <main className="wz-page">
        <section className="wz-panel">
          <h1>Modul tidak ditemukan</h1>
          <Link href="/">Kembali</Link>
        </section>
      </main>
    );
  }

  if (key === "dashboard") {
    return (
      <main className="wz-page">
        <section className="wz-heading">
          <div>
            <span className="gold-label">DASHBOARD</span>
            <h1>Semua detail Dashboard</h1>
            <p>Klik setiap kartu untuk membuka modul/detail terkait.</p>
          </div>
          <Link className="gold-btn" href="/">Kembali</Link>
        </section>

        <section className="wz-grid">
          <Link href="/modules/finance" className="wz-card">
            <div className="wz-card-icon">💰</div><div><h3>Pendapatan</h3><p>Transaksi selesai & pendapatan.</p></div><span className="wz-arrow">→</span>
          </Link>
          <Link href="/modules/customers" className="wz-card">
            <div className="wz-card-icon">👥</div><div><h3>Pelanggan</h3><p>Daftar dan aktivitas pelanggan.</p></div><span className="wz-arrow">→</span>
          </Link>
          <Link href="/modules/finance" className="wz-card">
            <div className="wz-card-icon">💸</div><div><h3>Pengeluaran</h3><p>Biaya, kas dan approval.</p></div><span className="wz-arrow">→</span>
          </Link>
          <Link href="/modules/finance" className="wz-card">
            <div className="wz-card-icon">📈</div><div><h3>Laba</h3><p>Pendapatan - pengeluaran.</p></div><span className="wz-arrow">→</span>
          </Link>
          <Link href="/modules/employees" className="wz-card">
            <div className="wz-card-icon">🎯</div><div><h3>KPI</h3><p>Target dan performa.</p></div><span className="wz-arrow">→</span>
          </Link>
          <Link href="/modules/analytics" className="wz-card">
            <div className="wz-card-icon">🧠</div><div><h3>Analisis</h3><p>Tren, anomali, forecast.</p></div><span className="wz-arrow">→</span>
          </Link>
        </section>

        <section className="wz-panel">
          <h2>Fitur Dashboard</h2>
          <div className="feature-list">
            {module.features.map((feature) => (
              <button key={feature} className="feature-btn" onClick={() => runFeature(feature)} disabled={!!busy}>
                <span>{busy === feature ? "…" : "▶"}</span>{feature}
              </button>
            ))}
          </div>
        </section>

        {result && <ResultPanel result={result} />}
      </main>
    );
  }

  return (
    <main className="wz-page">
      <section className="wz-heading">
        <div>
          <span className="gold-label">MODULE</span>
          <h1>{module.name}</h1>
          <p>Semua fitur di modul ini bisa diklik untuk menjalankan endpoint.</p>
        </div>
        <Link className="gold-btn" href="/">Dashboard</Link>
      </section>

      <section className="wz-panel">
        <h2>Fitur — {module.features.length}</h2>
        <div className="feature-list">
          {module.features.map((feature) => (
            <button key={feature} className="feature-btn" onClick={() => runFeature(feature)} disabled={!!busy}>
              <span>{busy === feature ? "…" : "▶"}</span>{feature}
            </button>
          ))}
        </div>
      </section>

      {result && <ResultPanel result={result} />}

      {entityMap[key || ""] && (
        <section className="wz-panel">
          <div className="wz-panel-head">
            <div><h2>Data Database</h2><p>Data terbaru dari endpoint data.</p></div>
            <button className="outline-btn" onClick={loadData}>{loadingRows ? "Memuat..." : "Refresh"}</button>
          </div>
          <div className="data-list">
            {rows.slice(0, 20).map((row, index) => (
              <div className="data-row" key={row.id || index}>
                <span>{row.name || row.number || row.employeeNo || row.category || row.title || row.id}</span>
                <b>{row.amount != null ? money(Number(row.amount)) : row.total != null ? money(Number(row.total)) : row.status || row.role || ""}</b>
              </div>
            ))}
            {!rows.length && <p className="muted">Belum ada data.</p>}
          </div>
        </section>
      )}
    </main>
  );
}

function ResultPanel({ result }: { result: any }) {
  return (
    <section className="wz-panel">
      <div className="wz-panel-head">
        <div>
          <span className="gold-label">DETAIL</span>
          <h2>{result.feature}</h2>
          <p>Hasil eksekusi fitur</p>
        </div>
        <span className="status-pill">HTTP {result.status}</span>
      </div>
      <pre className="result-box">{JSON.stringify(result.data, null, 2)}</pre>
    </section>
  );
}
