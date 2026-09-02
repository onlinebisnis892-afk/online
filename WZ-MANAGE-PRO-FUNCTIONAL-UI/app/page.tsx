import Link from "next/link";

const cards = [
  ["💰", "Pendapatan", "Klik untuk melihat pendapatan & transaksi", "/modules/finance"],
  ["👥", "Pelanggan", "Data pelanggan dan riwayat", "/modules/customers"],
  ["💸", "Pengeluaran", "Pantau biaya dan approval", "/modules/finance"],
  ["📈", "Laba", "Pendapatan dikurangi pengeluaran", "/modules/finance"],
  ["🎯", "KPI", "Target, performa, komisi", "/modules/employees"],
  ["🧾", "Transaksi", "Buat transaksi baru", "/modules/transactions/new"],
  ["📑", "Laporan Karyawan", "Absensi, transaksi, payroll, evaluasi", "/modules/reports/employees"],
  ["🧠", "Analisis Bisnis", "Tren, layanan, anomali, prediksi", "/modules/analytics"],
];

export default function Home() {
  return (
    <main className="wz-page">
      <header className="wz-topbar">
        <div className="wz-brand">
          <div className="wz-logo">WZ</div>
          <div>
            <strong>WZ BARBERSHOP PRO</strong>
            <span>MANAGEMENT SYSTEM</span>
          </div>
        </div>
        <nav>
          <Link href="/modules">Semua Modul</Link>
          <Link href="/modules/reports/employees">Laporan</Link>
          <Link href="/modules/transactions/new">Transaksi</Link>
        </nav>
      </header>

      <section className="wz-profile">
        <div className="wz-photo-box">
          <img src="/wilzam.png" alt="Wilzam Hidayat" />
        </div>
        <div className="wz-profile-copy">
          <span className="gold-label">PROFIL DIREKTUR UTAMA</span>
          <h1>WILZAM HIDAYAT</h1>
          <h3>DIREKTUR UTAMA</h3>
          <p className="wz-quote">“Kualitas adalah prioritas. Kepuasan pelanggan adalah tujuan.”</p>
          <div className="wz-info">
            <div><b>Jabatan</b><span>Direktur Utama</span></div>
            <div><b>Brand</b><span>WZ Barbershop Pro</span></div>
            <div><b>Fokus</b><span>Business Development & Management</span></div>
            <div><b>Visi</b><span>Menjadi barbershop premium dengan standar pelayanan terbaik.</span></div>
          </div>
        </div>
        <div className="wz-emblem">
          <div>WZ</div>
          <span>BARBERSHOP</span>
          <small>PRO</small>
        </div>
      </section>

      <section className="wz-heading">
        <div>
          <span className="gold-label">DASHBOARD UTAMA</span>
          <h2>WZ MANAGE PRO</h2>
          <p>Klik menu untuk membuka detail dan menjalankan fungsi.</p>
        </div>
        <Link className="gold-btn" href="/modules/transactions/new">＋ TRANSAKSI BARU</Link>
      </section>

      <section className="wz-grid">
        {cards.map(([icon, title, text, href]) => (
          <Link href={href} className="wz-card" key={title}>
            <div className="wz-card-icon">{icon}</div>
            <div>
              <h3>{title}</h3>
              <p>{text}</p>
            </div>
            <span className="wz-arrow">→</span>
          </Link>
        ))}
      </section>

      <section className="wz-actions">
        <Link href="/modules/dashboard" className="wz-action">
          <b>🏠 DASHBOARD</b><span>Buka dashboard detail</span>
        </Link>
        <Link href="/modules" className="wz-action">
          <b>⚙️ 14 MODUL</b><span>Setiap fitur dapat diklik</span>
        </Link>
        <Link href="/modules/system" className="wz-action">
          <b>🛡️ SISTEM & DATA</b><span>Backup, audit, kesehatan sistem</span>
        </Link>
      </section>

      <footer>© 2026 WZ BARBERSHOP PRO · WZ MANAGE PRO</footer>
    </main>
  );
}
