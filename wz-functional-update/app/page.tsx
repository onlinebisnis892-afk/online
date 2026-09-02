import Link from "next/link";

export default function Home() {
  return (
    <main className="space-y-6">
      <section className="hero">
        <div>
          <span className="eyebrow">ONLINE BUSINESS MANAGEMENT</span>
          <h1>WZ MANAGE PRO</h1>
          <p className="muted">
            Dashboard bisnis terhubung ke database.
          </p>
        </div>
        <div className="hero-actions">
          <Link className="primary-btn link-btn" href="/modules/transactions/new">
            + Transaksi
          </Link>
          <Link className="secondary-btn link-btn" href="/modules/reports/employees">
            Laporan Karyawan
          </Link>
        </div>
      </section>

      <section className="grid">
        <DashboardCard title="💰 Pendapatan" text="Lihat pendapatan dan transaksi selesai." href="/details/finance" />
        <DashboardCard title="👤 Pelanggan" text="Lihat data dan riwayat pelanggan." href="/details/customers" />
        <DashboardCard title="💸 Pengeluaran" text="Lihat total dan data pengeluaran." href="/details/expenses" />
        <DashboardCard title="📈 Laba" text="Pendapatan dikurangi pengeluaran." href="/details/profit" />
        <DashboardCard title="🎯 KPI" text="Target dan performa karyawan." href="/details/kpi" />
      </section>

      <section className="grid">
        <DashboardCard title="👥 Laporan Karyawan" text="Absensi, transaksi, komisi, payroll, evaluasi." href="/modules/reports/employees" />
        <DashboardCard title="🧾 Transaksi" text="Buat transaksi dan simpan ke database." href="/modules/transactions/new" />
        <DashboardCard title="🧠 Analisis" text="Analisis bisnis berdasarkan database." href="/details/analytics" />
      </section>
    </main>
  );
}

function DashboardCard({ title, text, href }: { title: string; text: string; href: string }) {
  return (
    <Link className="card module" href={href}>
      <div className="module-title">{title}</div>
      <p>{text}</p>
      <span className="pill">Buka detail →</span>
    </Link>
  );
}
