import { db } from "./db";

export async function businessOverview() {
  const [tx, exp, customers] = await Promise.all([
    db.transaction.findMany({
      where: { status: "SELESAI" },
    }),
    db.expense.findMany(),
    db.customer.count(),
  ]);

  const revenue = tx.reduce(
    (sum: number, transaction: { total: unknown }) => sum + Number(transaction.total),
    0
  );

  const expenses = exp.reduce(
    (sum: number, expense: { amount: unknown }) => sum + Number(expense.amount),
    0
  );

  return {
    revenue,
    expenses,
    profit: revenue - expenses,
    transactions: tx.length,
    customers,
    health: Math.max(
      0,
      Math.min(
        100,
        Math.round((revenue / (revenue + expenses || 1)) * 100)
      )
    ),
  };
}

export async function servicePerformance() {
  const items = await db.transactionItem.findMany({
    include: {
      service: true,
      transaction: true,
    },
  });

  const map = new Map<
    string,
    {
      name: string;
      count: number;
      revenue: number;
    }
  >();

  for (const item of items.filter(
    (item: { serviceId: string; qty: number; total: unknown; service: { name: string }; transaction: { status: string } }) => item.transaction.status === "SELESAI"
  )) {
    const value =
      map.get(item.serviceId) || {
        name: item.service.name,
        count: 0,
        revenue: 0,
      };

    value.count += item.qty;
    value.revenue += Number(item.total);

    map.set(item.serviceId, value);
  }

  return [...map.values()].sort(
    (a, b) => b.revenue - a.revenue
  );
}
