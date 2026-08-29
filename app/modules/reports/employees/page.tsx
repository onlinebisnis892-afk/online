"use client";

import { useEffect, useMemo, useState } from "react";

type Employee = {
  id: string;
  employeeNo: string;
  name: string;
  role: string;
  active: boolean;
  branchId: string;
  salary: number;
  commissionRate: number;
  target: number;
};

type Report = {
  employee: Employee;
  attendance: {
    total: number;
    present: number;
    late: number;
    absent: number;
    leave: number;
  };
  transactions: {
    count: number;
    revenue: number;
  };
  commission: number;
  payroll: number;
  evaluation: number | null;
};

type ApiResponse = {
  reports?: Report[];
  employees?: Employee[];
  error?: string;
};

export default function EmployeeReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("ALL");
  const [activeOnly, setActiveOnly] = useState(false);

  async function loadReports() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/reports?type=employees", {
        cache: "no-store",
      });

      const data: ApiResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Gagal mengambil laporan karyawan");
      }

      setReports(data.reports || []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Gagal mengambil laporan karyawan"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadReports();
  }, []);

  const filtered = useMemo(() => {
    return reports.filter((item) => {
      const employee = item.employee;

      const matchSearch =
        !search ||
        employee.name.toLowerCase().includes(search.toLowerCase()) ||
        employee.employeeNo.toLowerCase().includes(search.toLowerCase());

      const matchRole = role === "ALL" || employee.role === role;
      const matchActive = !activeOnly || employee.active;

      return matchSearch && matchRole && matchActive;
    });
  }, [reports, search, role, activeOnly]);

  const summary = useMemo(() => {
    return filtered.reduce(
      (result, item) => {
        result.employees += 1;
        result.revenue += Number(item.transactions.revenue || 0);
        result.transactions += Number(item.transactions.count || 0);
        result.commission += Number(item.commission || 0);
        result.payroll += Number(item.payroll || 0);
        result.present += Number(item.attendance.present || 0);
        result.late += Number(item.attendance.late || 0);
        return result;
      },
      {
        employees: 0,
        revenue: 0,
        transactions: 0,
        commission: 0,
        payroll: 0,
        present: 0,
        late: 0,
      }
    );
  }, [filtered]);

  const roles = Array.from(
    new Set(reports.map((item) => item.employee.role))
  ).sort();

  const money = (value: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(Number(value || 0));

  return (
    <main className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="rounded-2xl bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold text-blue-600">
                WZ MANAGE PRO
              </p>
              <h1 className="text-2xl font-bold text-slate-900">
                Laporan Karyawan
              </h1>
              <p className="text-sm text-slate-500">
                Performa, kehadiran, transaksi, komisi, gaji, dan evaluasi.
              </p>
            </div>

            <button
              onClick={loadReports}
              className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
            >
              ↻ Refresh
            </button>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-4">
          <Card title="Karyawan" value={summary.employees.toString()} />
          <Card title="Transaksi" value={summary.transactions.toString()} />
          <Card title="Pendapatan" value={money(summary.revenue)} />
          <Card title="Komisi" value={money(summary.commission)} />
        </section>

        <section className="rounded-2xl bg-white p-5 shadow-sm">
          <div className="grid gap-3 md:grid-cols-4">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Cari nama / ID karyawan..."
              className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
            />

            <select
              value={role}
              onChange={(event) => setRole(event.target.value)}
              className="rounded-xl border border-slate-200 px-4 py-3 text-sm"
           
            >
              <option value="ALL">Semua Role</option>
              {roles.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>

            <label className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 text-sm">
              <input
                type="checkbox"
                checked={activeOnly}
                onChange={(event) => setActiveOnly(event.target.checked)}
              />
              Karyawan aktif saja
            </label>

            <div className="rounded-xl bg-slate-50 px-4 py-3 text-sm">
              Hadir: <b>{summary.present}</b> · Terlambat:{" "}
              <b>{summary.late}</b>
            </div>
          </div>
        </section>

        {loading && (
          <section className="rounded-2xl bg-white p-8 text-center shadow-sm">
            Memuat laporan karyawan...
          </section>
        )}

        {error && (
          <section className="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700">
            <b>Gagal memuat laporan</b>
            <p className="mt-1 text-sm">{error}</p>
            <button
              onClick={loadReports}
              className="mt-3 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white"
            >
              Coba lagi
            </button>
          </section>
        )}

        {!loading && !error && (
          <section className="overflow-hidden rounded-2xl bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1100px] text-left text-sm">
                <thead className="bg-slate-900 text-white">
                  <tr>
                    <th className="px-4 py-4">Karyawan</th>
                    <th className="px-4 py-4">Role</th>
                    <th className="px-4 py-4">Status</th>
                    <th className="px-4 py-4">Kehadiran</th>
                    <th className="px-4 py-4">Transaksi</th>
                    <th className="px-4 py-4">Pendapatan</th>
                    <th className="px-4 py-4">Komisi</th>
                    <th className="px-4 py-4">Gaji</th>
                    <th className="px-4 py-4">Evaluasi</th>
                  </tr>
                </thead>

                <tbody>
                  {filtered.map((item) => (
                    <tr
                      key={item.employee.id}
                      className="border-b border-slate-100 hover:bg-slate-50"
                    >
                      <td className="px-4 py-4">
                        <div className="font-semibold text-slate-900">
                          {item.employee.name}
                        </div>
                        <div className="text-xs text-slate-500">
                          {item.employee.employeeNo}
                        </div>
                      </td>

                      <td className="px-4 py-4">{item.employee.role}</td>

                      <td className="px-4 py-4">
                        <span
                          className={
                            item.employee.active
                              ? "rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700"
                              : "rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600"
                          }
                        >
                          {item.employee.active ? "Aktif" : "Nonaktif"}
                        </span>
                      </td>

                      <td className="px-4 py-4">
                        <div>Hadir: {item.attendance.present}</div>
                        <div className="text-xs text-orange-600">
                          Terlambat: {item.attendance.late}
                        </div>
                        <div className="text-xs text-slate-500">
                          Izin: {item.attendance.leave} · Absen:{" "}
                          {item.attendance.absent}
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        {item.transactions.count}
                      </td>

                      <td className="px-4 py-4 font-semibold">
                        {money(item.transactions.revenue)}
                      </td>

                      <td className="px-4 py-4">
                        {money(item.commission)}
                      </td>

                      <td className="px-4 py-4">
                        {money(item.payroll)}
                      </td>

                      <td className="px-4 py-4">
                        {item.evaluation === null
                          ? "-"
                          : `${Number(item.evaluation).toFixed(1)}/100`}
                      </td>
                    </tr>
                  ))}

                  {filtered.length === 0 && (
                    <tr>
                      <td
                        colSpan={9}
                        className="px-4 py-12 text-center text-slate-500"
                      >
                        Belum ada data karyawan yang sesuai filter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

        <section className="rounded-2xl bg-white p-5 shadow-sm">
          <h2 className="font-bold text-slate-900">Ringkasan Keuangan</h2>

          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <Stat
              label="Total Pendapatan"
              value={money(summary.revenue)}
            />

            <Stat
              label="Total Komisi"
              value={money(summary.commission)}
            />

            <Stat
              label="Total Payroll"
              value={money(summary.payroll)}
            />
          </div>
        </section>
      </div>
    </main>
  );
}

function Card({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm">
      <p className="text-sm text-slate-500">{title}</p>
      <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
    </div>
  );
}

function Stat({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl bg-slate-50 p-4">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 font-bold text-slate-900">{value}</p>
    </div>
  );
}
