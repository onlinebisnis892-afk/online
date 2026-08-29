import Link from "next/link";
import { modules } from "@/lib/feature-registry";

export default function Modules() {
  return (
    <main className="wz-page">
      <section className="wz-heading">
        <div>
          <span className="gold-label">WZ BARBERSHOP PRO</span>
          <h1>Semua Modul</h1>
          <p>Pilih modul untuk melihat seluruh fitur dan membuka detailnya.</p>
        </div>
        <Link className="gold-btn" href="/">← Dashboard</Link>
      </section>

      <section className="wz-panel">
        <div className="wz-panel-head">
          <div>
            <span className="gold-label">MANAGEMENT SYSTEM</span>
            <h2>14 Modul Aktif</h2>
            <p>Setiap kartu dapat diklik untuk membuka fitur dan data.</p>
          </div>
          <Link className="outline-btn" href="/modules/transactions/new">
            ＋ Transaksi Baru
          </Link>
        </div>
      </section>

      <section className="wz-grid">
        {modules.map((module) => (
          <Link
            href={`/modules/${module.key}`}
            className="wz-card"
            key={module.key}
          >
            <div className="wz-card-icon">
              {module.name.slice(0, 2)}
            </div>
            <div>
              <h3>{module.name.slice(2).trim()}</h3>
              <p>{module.features.length} fitur tersedia</p>
              <span className="status-pill">BUKA DETAIL →</span>
            </div>
            <span className="wz-arrow">→</span>
          </Link>
        ))}
      </section>

      <section className="wz-actions">
        <Link href="/modules/dashboard" className="wz-action">
          <b>🏠 DASHBOARD</b>
          <span>Pendapatan · Pelanggan · Laba · KPI</span>
        </Link>

        <Link href="/modules/reports/employees" className="wz-action">
          <b>📑 LAPORAN KARYAWAN</b>
          <span>Absensi · Transaksi · Komisi · Payroll · Evaluasi</span>
        </Link>

        <Link href="/modules/transactions/new" className="wz-action">
          <b>🧾 TRANSAKSI</b>
          <span>Buat dan simpan transaksi ke database</span>
        </Link>
      </section>

      <footer>© 2026 WZ BARBERSHOP PRO · WZ MANAGE PRO</footer>
    </main>
  );
}
