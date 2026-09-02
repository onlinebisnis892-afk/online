"use client";

import Link from "next/link";

const cards = [
  ["💰", "Pendapatan", "Lihat pendapatan & transaksi", "/details/finance"],
  ["👥", "Pelanggan", "Data & riwayat pelanggan", "/details/customers"],
  ["💸", "Pengeluaran", "Pantau biaya operasional", "/details/expenses"],
  ["📈", "Laba", "Pendapatan dikurangi biaya", "/details/profit"],
  ["🎯", "KPI", "Target & performa", "/details/kpi"],
];

export default function Home() {
  return (
    <main className="wz-dashboard">
      <section className="wz-profile">
        <div className="wz-photo-wrap">
          <img src="/wilzam.svg" alt="Wilzam Hidayat" className="wz-photo" />
        </div>
        <div className="wz-profile-info">
          <span className="gold-eyebrow">PROFIL DIREKTUR UTAMA</span>
          <h1>WILZAM HIDAYAT</h1>
          <p className="quote">“Kualitas adalah prioritas. Kepuasan pelanggan adalah tujuan.”</p>
          <div className="profile-lines">
            <div><b>Jabatan</b><span>Direktur Utama</span></div>
            <div><b>Brand</b><span>WZ Barbershop Pro</span></div>
            <div><b>Fokus</b><span>Business Development & Management</span></div>
            <div><b>Visi</b><span>Menjadi barbershop premium dengan standar pelayanan terbaik.</span></div>
          </div>
        </div>
        <div className="wz-emblem">WZ<span>BARBERSHOP</span><small>PRO</small></div>
      </section>

      <section className="wz-metrics">
        <Metric icon="💰" title="TOTAL PENDAPATAN" value="Database" />
        <Metric icon="📅" title="TRANSAKSI" value="Realtime" />
        <Metric icon="👥" title="PELANGGAN" value="Database" />
        <Metric icon="⭐" title="PERFORMA" value="KPI" />
        <Metric icon="🕒" title="STATUS SISTEM" value="Online" />
      </section>

      <section className="wz-section-head">
        <div>
          <span className="gold-eyebrow">WZ MANAGE PRO</span>
          <h2>Dashboard Bisnis</h2>
          <p>Pilih menu untuk membuka data yang terhubung ke database.</p>
        </div>
        <Link href="/modules/transactions/new" className="gold-btn">＋ TRANSAKSI BARU</Link>
      </section>

      <section className="wz-cards">
        {cards.map(([icon, title, text, href]) => (
          <Link href={href} key={title} className="wz-card">
            <div className="wz-icon">{icon}</div>
            <div><h3>{title}</h3><p>{text}</p></div>
            <span>→</span>
          </Link>
        ))}
      </section>

      <section className="wz-wide-grid">
        <Link href="/modules/reports/employees" className="wz-panel-link">
          <div className="panel-icon">👨‍💼</div>
          <div><span className="gold-eyebrow">REPORT</span><h3>Laporan Karyawan</h3><p>Absensi · transaksi · komisi · payroll · evaluasi · filter tanggal</p></div>
          <b>BUKA →</b>
        </Link>
        <Link href="/details/analytics" className="wz-panel-link">
          <div className="panel-icon">📊</div>
          <div><span className="gold-eyebrow">ANALYTICS</span><h3>Analisis Bisnis</h3><p>Pantau performa bisnis berdasarkan data database.</p></div>
          <b>BUKA →</b>
        </Link>
      </section>

      <footer>© 2026 WZ BARBERSHOP PRO · WZ MANAGE PRO</footer>
    </main>
  );
}

function Metric({ icon, title, value }: { icon: string; title: string; value: string }) {
  return <div className="wz-metric"><span className="metric-icon">{icon}</span><div><small>{title}</small><strong>{value}</strong></div></div>;
}
