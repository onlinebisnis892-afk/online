# WZ MANAGE PRO — ONLINE
## MASTER BLUEPRINT: STRUKTUR & FITUR

Arsitektur utama:

INPUT DATA
    ↓
DATABASE TERPUSAT
    ↓
┌─────────────────────────────┐
│ TRANSAKSI                   │
│ OPERASIONAL                 │
│ KARYAWAN                    │
│ PELANGGAN                   │
│ LAYANAN & PROMO             │
│ KEUANGAN                    │
│ INVENTORY                   │
│ CABANG                      │
└──────────────┬──────────────┘
               ↓
       BUSINESS ENGINE
               ↓
       ANALYTICS ENGINE
               ↓
┌──────────────┼──────────────┐
↓              ↓              ↓
DASHBOARD   NOTIFIKASI      LAPORAN
└──────────────┼──────────────┘
               ↓
             OWNER

---

# 1. 🔐 AUTENTIKASI & KEAMANAN

- Login
- Lupa / Reset Password
- Manajemen Sesi
  - Session Timeout
  - Logout
  - Logout Semua Perangkat
  - Sesi / Perangkat Aktif
- Role & Hak Akses
  - Owner
  - Manager
  - Barber
  - Kasir
- Permission Detail
- Riwayat Login
- Proteksi Login
  - Login Attempt Limit
  - Brute-force Protection
- Password Security
  - Password Hashing
- 2FA Owner
- Audit Log

# 2. 🏠 DASHBOARD

- Kondisi Bisnis Hari Ini
- Pendapatan
- Jumlah Pelanggan
- Pengeluaran
- Laba
- Target & KPI
- Business Health Score
- Perbandingan Periode
- Grafik Bisnis
- Alert Penting
- Ringkasan Insight
- Filter Periode
- Filter Cabang
- Shortcut ke Detail

# 3. 🧠 ANALISIS BISNIS ⭐

- Business Overview
- Business Health Score
- Analisis Pendapatan
- Analisis Pelanggan
- Analisis Karyawan
- Analisis Layanan
- Analisis Jam & Hari Ramai
- Analisis Pengeluaran
- Perbandingan Periode
- Analisis Tren
- Deteksi Kejanggalan / Anomali
- Prediksi Bisnis
  - Tingkat Kepercayaan Prediksi
- Insight Otomatis
- Rekomendasi
- Drill-down Grafik → Data Detail
- Filter Periode
- Filter Cabang
- Filter Karyawan
- Export Analisis

# 4. ✂️ OPERASIONAL

- Check-in / Check-out
- Waktu Otomatis
- Status Karyawan
  - Hadir
  - Terlambat
  - Tidak Hadir
  - Izin / Cuti
- Jadwal Kerja
- Shift
- Penugasan Karyawan
- Riwayat Perubahan Jadwal
- Aktivitas Harian
- Ringkasan Aktivitas Shift
- Penutupan Shift
  - Rekap Otomatis
  - Pemeriksaan Data
  - Data Lock

# 5. 🧾 TRANSAKSI ⭐

- Input Transaksi
- Nomor Transaksi Otomatis
- Tanggal & Waktu Otomatis
- Cabang Otomatis
- Pilih Pelanggan
- Pilih Layanan
- Barber Otomatis / Pilih
- Harga Otomatis
- Diskon / Promo
- Metode Pembayaran
- Status Transaksi
- Draft
- Selesai
- Void / Pembatalan
- Koreksi Transaksi
- Approval Perubahan
- Alasan Perubahan
- Pencegahan Duplikat
- Riwayat Transaksi

# 6. 👥 MANAJEMEN KARYAWAN

- Data Karyawan
- ID Karyawan Otomatis
- Akun Karyawan
- Role
- Status Aktif / Nonaktif
- Riwayat Karyawan
- Jadwal
- Kehadiran
- Target
- KPI
- Performa
- Produktivitas
- Gaji
- Komisi
- Evaluasi
- Riwayat Kinerja

# 7. 👤 PELANGGAN

- Data Pelanggan
- ID Pelanggan Otomatis
- Riwayat Kunjungan
- Pelanggan Baru
- Pelanggan Kembali
- Pelanggan Aktif
- Pelanggan Tidak Aktif
- Frekuensi Kunjungan
- Total Nilai Transaksi
- Layanan Favorit
- Segmentasi Pelanggan
- Tag Pelanggan
- Catatan Pelanggan
- Analisis Loyalitas

# 8. 💈 LAYANAN & PROMO

- Daftar Layanan
- Kategori
- Harga
- Durasi
- Status Aktif / Nonaktif
- Riwayat Harga
- Promo
- Diskon
- Periode Promo
- Syarat Promo
- Batas Penggunaan
- Validasi Promo Otomatis
- Riwayat Penggunaan Promo
- Analisis Performa Layanan

# 9. 💰 KEUANGAN

- Pendapatan Otomatis
- Pengeluaran
- Kategori Pengeluaran
- Bukti / Referensi Pengeluaran
- Approval Pengeluaran
- Kas
- Kas Masuk
- Kas Keluar
- Rekonsiliasi Kas
- Gaji
- Komisi
- Laba Kotor
- Laba Bersih
- Cash Flow
- Penutupan Periode
  - Review
  - Approval
  - Data Lock
  - Reopen dengan Otorisasi

# 10. 🔔 NOTIFIKASI

- Pendapatan Turun
- Target Tidak Tercapai
- Target Tercapai
- Data Janggal
- Pengeluaran Tidak Normal
- Karyawan Terlambat
- Tidak Hadir
- Shift Belum Selesai
- Insight Baru
- Masalah Sistem
- Prioritas Notifikasi
- Belum Dibaca / Sudah Dibaca
- Riwayat Notifikasi
- Preferensi Notifikasi

# 11. 📑 LAPORAN

- Laporan Harian
- Laporan Mingguan
- Laporan Bulanan
- Laporan Tahunan
- Laporan Transaksi
- Laporan Keuangan
- Laporan Karyawan
- Laporan Operasional
- Laporan Pelanggan
- Filter Periode
- Filter Cabang
- Filter Karyawan
- Filter Layanan
- Drill-down
- Export PDF
- Export Excel
- Riwayat Export
- Laporan Terjadwal

# 12. 🏢 CABANG

- Data Cabang
- ID Cabang
- Lokasi / Alamat
- Status Aktif / Nonaktif
- Jam Operasional
- Karyawan per Cabang
- Layanan per Cabang
- Harga per Cabang
- Target per Cabang
- Performa per Cabang
- Perbandingan Cabang
- Analisis Gabungan

# 13. ⚙️ PENGATURAN

- Profil Bisnis
- Logo
- Kontak
- Jam Operasional
- Zona Waktu
- Mata Uang
- Format Tanggal
- Target Bisnis
- Target Cabang
- Target Karyawan
- Role & Hak Akses
- Pengaturan Komisi
- Pengaturan Analisis
- Ambang Peringatan
- Pengaturan Prediksi
- Password & Keamanan
- Preferensi Sistem
- Preferensi Pengguna
- Nomor Urut Dokumen / Transaksi

# 14. 🛡️ SISTEM & DATA

- Backup Otomatis
- Backup Manual
- Restore Data
- Riwayat Backup
- Riwayat Restore
- Retensi Backup
- Data Lock
- Soft Delete
- Trash / Pemulihan Data
- Audit Log
- Monitoring Sistem
- Status Database
- System Health
- Error Monitoring
- Security Monitoring
- Security Events
- Riwayat Aktivitas Sistem

---

# ARSITEKTUR DATA

Semua modul utama menjadi satu ekosistem data:

INPUT
→ DATABASE TERPUSAT
→ BUSINESS ENGINE
→ ANALYTICS ENGINE
→ DASHBOARD / NOTIFIKASI / LAPORAN
→ OWNER

## Hubungan bisnis utama

Customer
→ Booking / Walk-in
→ Queue
→ Barber
→ Transaction
→ Payment
→ Finance
→ Commission
→ Payroll
→ Analytics
→ Dashboard / Notification / Report

Employee
→ Schedule
→ Attendance
→ Shift
→ Target
→ KPI
→ Performance
→ Payroll / Commission

Service
→ Price
→ Promotion
→ Transaction
→ Service Performance

Branch
→ Employee
→ Service
→ Price
→ Target
→ Transaction
→ Finance
→ Analytics

---

# MASTER RULE

Blueprint ini adalah acuan pembangunan WZ MANAGE PRO ONLINE.

Aturan:
1. Tidak boleh menghapus modul.
2. Tidak boleh menghapus fitur.
3. Penambahan fitur boleh dilakukan tanpa menghilangkan fitur yang sudah ada.
4. Fungsi tiap fitur akan dibangun setelah struktur ini dikunci.
5. Database terpusat menjadi sumber data utama.
6. Dashboard, Analytics, Notification, dan Report harus mengambil data dari sumber yang sama.
