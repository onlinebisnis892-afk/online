import { db } from "@/lib/db";

type ReportOptions = { from?: string; to?: string };

function dateRange(options: ReportOptions) {
  const from = options.from ? new Date(options.from) : new Date(0);
  const to = options.to ? new Date(options.to) : new Date();
  if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) throw new Error("Format tanggal tidak valid");
  to.setHours(23, 59, 59, 999);
  return { from, to };
}

const n = (v: unknown) => Number(v || 0);

export async function employeeReport(options: ReportOptions = {}) {
  const { from, to } = dateRange(options);
  const employees = await db.employee.findMany({ orderBy: { name: "asc" } });

  return Promise.all(employees.map(async (employee) => {
    const [attendance, transactions, commissions, payroll, evaluations] = await Promise.all([
      db.attendance.findMany({ where: { employeeId: employee.id, date: { gte: from, lte: to } } }),
      db.transaction.findMany({ where: { employeeId: employee.id, createdAt: { gte: from, lte: to }, status: { not: "VOID" } }, select: { total: true } }),
      db.commission.findMany({ where: { employeeId: employee.id, transaction: { createdAt: { gte: from, lte: to } } }, select: { amount: true } }),
      db.payroll.findMany({ where: { employeeId: employee.id, periodStart: { lte: to }, periodEnd: { gte: from } }, select: { net: true } }),
      db.evaluation.findMany({ where: { employeeId: employee.id, date: { gte: from, lte: to } }, orderBy: { date: "desc" }, select: { score: true } }),
    ]);

    const present = attendance.filter((x) => String(x.status) === "PRESENT").length;
    const late = attendance.filter((x) => String(x.status) === "LATE").length;
    const absent = attendance.filter((x) => String(x.status) === "ABSENT").length;
    const leave = attendance.filter((x) => ["LEAVE","PERMITTED","CUTI","IZIN"].includes(String(x.status))).length;

    return {
      employee: {
        id: employee.id, employeeNo: employee.employeeNo, name: employee.name,
        role: employee.role, active: employee.active, branchId: employee.branchId,
        salary: n(employee.salary), commissionRate: n(employee.commissionRate), target: n(employee.target),
      },
      attendance: { total: attendance.length, present, late, absent, leave },
      transactions: {
        count: transactions.length,
        revenue: transactions.reduce((s: number, x: { total: unknown }) => s + n(x.total), 0),
      },
      commission: commissions.reduce((s: number, x: { amount: unknown }) => s + n(x.amount), 0),
      payroll: payroll.reduce((s: number, x: { net: unknown }) => s + n(x.net), 0),
      evaluation: evaluations.length ? n(evaluations[0].score) : null,
    };
  }));
}

export async function reportData(type: string, options: ReportOptions = {}) {
  if (type === "employees" || type === "employee" || type === "karyawan") return employeeReport(options);

  const { from, to } = dateRange(options);

  if (type === "finance") {
    const [t, e] = await Promise.all([
      db.transaction.findMany({ where: { status: "SELESAI", createdAt: { gte: from, lte: to } }, select: { total: true } }),
      db.expense.findMany({ where: { createdAt: { gte: from, lte: to } }, select: { amount: true } }),
    ]);
    return {
      revenue: t.reduce((s: number, x: { total: unknown }) => s + n(x.total), 0),
      expenses: e.reduce((s: number, x: { amount: unknown }) => s + n(x.amount), 0),
    };
  }

  if (type === "customers") {
    return db.customer.findMany({ orderBy: { name: "asc" } });
  }

  if (type === "analytics") {
    const { businessAnalytics } = await import("@/lib/business");
    return businessAnalytics({});
  }

  return [];
}

export function csv(rows: unknown[]) {
  if (!Array.isArray(rows) || !rows.length) return "";
  const flat = rows.map((row: any) => row?.employee ? {
    employeeNo: row.employee.employeeNo, name: row.employee.name, role: row.employee.role,
    active: row.employee.active, present: row.attendance.present, late: row.attendance.late,
    absent: row.attendance.absent, leave: row.attendance.leave,
    transactions: row.transactions.count, revenue: row.transactions.revenue,
    commission: row.commission, payroll: row.payroll, evaluation: row.evaluation
  } : row);
  const headers = Array.from(new Set(flat.flatMap((r: any) => Object.keys(r))));
  const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  return [headers.map(esc).join(","), ...flat.map((r: any) => headers.map((h) => esc(r[h])).join(","))].join("\n");
}
