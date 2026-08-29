"use client";

import { useEffect, useMemo, useState } from "react";

const money = (n: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(Number(n || 0));

export default function EmployeeReports() {
  const [reports, setReports] = useState<any[]>([]);
  const [selected, setSelected] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true); setError("");
    try {
      const q = new URLSearchParams({ type: "employees" });
      if (from) q.set("from", from);
      if (to) q.set("to", to);
      const r = await fetch(`/api/reports?${q.toString()}`, { cache: "no-store" });
      const x = await r.json();
      if (!r.ok) throw new Error(x.error || x.message || "Gagal mengambil laporan");
      setReports(x.reports || []);
    } catch (e: any) {
      setError(e.message || "Gagal mengambil laporan");
    } finally { setLoading(false); }
  }

  useEffect(() => { load(); }, [from, to]);

  const employee = useMemo(
    () => reports.find((x) => x.employee.id === selected) || reports[0],
    [reports, selected]
  );

  useEffect(() => {
    if (reports.length && !selected) setSelected(reports[0].employee.id);
  }, [reports, selected]);

  if (loading) return <main><section className="card">Memuat laporan karyawan...</section></main>;

  return (
    <main className="space-y-6">
      <div className="section-title"><div><span className="eyebrow">REPORT</span><h1>Laporan Karyawan</h1><p className="muted">Data langsung dari database.</p></div></div>
      {error && <section className="card">{error}</section>}

      <section className="card">
        <div className="toolbar">
          <select value={employee?.employee.id || ""} onChange={(e) => setSelected(e.target.value)}>
            {reports.map((x) => <option key={x.employee.id} value={x.employee.id}>{x.employee.name} — {x.employee.employeeNo}</option>)}
          </select>
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          <button className="secondary-btn" onClick={load}>Refresh</button>
        </div>
      </section>

      {!employee ? <section className="card">Belum ada data karyawan.</section> : <>
        <section className="card"><h2>{employee.employee.name}</h2><p className="muted">{employee.employee.employeeNo} · {employee.employee.role}</p></section>
        <section className="grid">
          <Stat label="Hadir" value={employee.attendance.present} />
          <Stat label="Terlambat" value={employee.attendance.late} />
          <Stat label="Absen" value={employee.attendance.absent} />
          <Stat label="Izin/Cuti" value={employee.attendance.leave} />
          <Stat label="Transaksi" value={employee.transactions.count} />
          <Stat label="Pendapatan" value={money(employee.transactions.revenue)} />
          <Stat label="Komisi" value={money(employee.commission)} />
          <Stat label="Payroll" value={money(employee.payroll)} />
          <Stat label="Evaluasi" value={employee.evaluation == null ? "-" : `${Number(employee.evaluation).toFixed(1)}/100`} />
        </section>
      </>}
    </main>
  );
}

function Stat({ label, value }: { label: string; value: any }) {
  return <div className="card"><p className="muted">{label}</p><h2>{value}</h2></div>;
}
