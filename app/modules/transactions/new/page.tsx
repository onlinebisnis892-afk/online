"use client";

import { useEffect, useState } from "react";

const money = (n: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(Number(n || 0));

export default function NewTransaction() {
  const [branches, setBranches] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [branchId, setBranchId] = useState("");
  const [serviceId, setServiceId] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [qty, setQty] = useState(1);
  const [payment, setPayment] = useState("CASH");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function getData(entity: string) {
    const r = await fetch(`/api/data/${entity}?limit=100`, { cache: "no-store" });
    const x = await r.json();
    if (!r.ok) throw new Error(x.error || x.message || `Gagal mengambil ${entity}`);
    return x.data || [];
  }

  useEffect(() => {
    (async () => {
      try {
        const [b, s, e, c] = await Promise.all([
          getData("branches"), getData("services"), getData("employees"), getData("customers")
        ]);
        setBranches(b); setServices(s); setEmployees(e); setCustomers(c);
        if (b[0]) setBranchId(b[0].id);
        if (s[0]) setServiceId(s[0].id);
      } catch (e: any) { setMessage(`❌ ${e.message}`); }
    })();
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setMessage("");
    try {
      const r = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          branchId, customerId: customerId || undefined, employeeId: employeeId || undefined,
          items: [{ serviceId, qty }], payment, status: "SELESAI"
        })
      });
      const x = await r.json();
      if (!r.ok) throw new Error(x.error || x.message || "Transaksi gagal");
      setMessage(`✅ Transaksi ${x.number || "berhasil"} tersimpan. Komisi akan otomatis dibuat jika karyawan punya commission rate.`);
    } catch (e: any) {
      setMessage(`❌ ${e.message || "Transaksi gagal"}`);
    } finally { setBusy(false); }
  }

  const service = services.find((x) => x.id === serviceId);
  const total = Number(service?.price || 0) * qty;

  return (
    <main className="space-y-6">
      <div className="section-title"><div><span className="eyebrow">TRANSACTION</span><h1>Transaksi Baru</h1><p className="muted">Simpan transaksi ke database.</p></div></div>
      <form className="card space-y-4" onSubmit={submit}>
        <Field label="Cabang"><select value={branchId} onChange={(e) => setBranchId(e.target.value)}>{branches.map((x) => <option key={x.id} value={x.id}>{x.name || x.id}</option>)}</select></Field>
        <Field label="Layanan"><select value={serviceId} onChange={(e) => setServiceId(e.target.value)}>{services.map((x) => <option key={x.id} value={x.id}>{x.name || x.id} — {money(Number(x.price || 0))}</option>)}</select></Field>
        <Field label="Karyawan / Barber"><select value={employeeId} onChange={(e) => setEmployeeId(e.target.value)}><option value="">Tidak dipilih</option>{employees.map((x) => <option key={x.id} value={x.id}>{x.name || x.employeeNo}</option>)}</select></Field>
        <Field label="Pelanggan"><select value={customerId} onChange={(e) => setCustomerId(e.target.value)}><option value="">Pelanggan umum</option>{customers.map((x) => <option key={x.id} value={x.id}>{x.name || x.customerNo}</option>)}</select></Field>
        <Field label="Jumlah"><input type="number" min="1" value={qty} onChange={(e) => setQty(Math.max(1, Number(e.target.value)))} /></Field>
        <Field label="Pembayaran"><select value={payment} onChange={(e) => setPayment(e.target.value)}><option value="CASH">Cash</option><option value="QRIS">QRIS</option><option value="TRANSFER">Transfer</option></select></Field>
        <div className="card"><p className="muted">Perkiraan Total</p><h2>{money(total)}</h2></div>
        <button className="primary-btn" disabled={busy || !branchId || !serviceId}>{busy ? "Menyimpan..." : "Simpan Transaksi"}</button>
        {message && <div className="card">{message}</div>}
      </form>
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block">{label}{children}</label>;
}
