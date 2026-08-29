import { db } from './db';
import { audit } from './security';

export const moneyNumber = (x: any) => Number(x || 0);

export function rangeDates(from?: string, to?: string) {
  const start = from
    ? new Date(from)
    : new Date(new Date().setHours(0, 0, 0, 0));

  const end = to ? new Date(to) : new Date();

  if (to) {
    end.setHours(23, 59, 59, 999);
  }

  return { start, end };
}

export async function createTransaction(input: {
  branchId: string;
  customerId?: string;
  employeeId?: string;
  bookingId?: string;
  items: {
    serviceId: string;
    qty?: number;
    discount?: number;
  }[];
  payment?: 'CASH' | 'QRIS' | 'TRANSFER';
  status?: 'DRAFT' | 'SELESAI';
  reason?: string;
}) {
  if (!input.items?.length) {
    throw new Error('Transaction harus memiliki item');
  }

  /*
   * Harga layanan berada di BranchService.price,
   * bukan di Service.price.
   */
  const services = await db.branchService.findMany({
    where: {
      branchId: input.branchId,
      serviceId: {
        in: input.items.map((i) => i.serviceId),
      },
      active: true,
      service: {
        active: true,
      },
    },
    include: {
      service: true,
    },
  });

  const requestedServiceIds = new Set(
    input.items.map((i) => i.serviceId)
  );

  if (services.length !== requestedServiceIds.size) {
    throw new Error('Layanan tidak valid');
  }

  const branch = await db.branch.findUnique({
    where: {
      id: input.branchId,
    },
  });

  if (!branch) {
    throw new Error('Cabang tidak ditemukan');
  }

  const number =
    `TRX-${new Date()
      .toISOString()
      .slice(0, 10)
      .replace(/-/g, '')}-` +
    `${Date.now().toString(36).toUpperCase()}`;

  const items = input.items.map((i) => {
    const branchService = services.find(
      (x: { serviceId: string }) => x.serviceId === i.serviceId
    );

    if (!branchService) {
      throw new Error('Layanan tidak ditemukan di cabang');
    }

    const qty = Math.max(1, i.qty || 1);
    const discount = Math.max(0, i.discount || 0);

    const total = Math.max(
      0,
      moneyNumber(branchService.price) * qty - discount
    );

    return {
      serviceId: branchService.serviceId,
      price: branchService.price,
      qty,
      discount,
      total,
    };
  });

  const subtotal = items.reduce(
    (sum, item) =>
      sum +
      moneyNumber(item.total) +
      moneyNumber(item.discount),
    0
  );

  const discount = items.reduce(
    (sum, item) => sum + moneyNumber(item.discount),
    0
  );

  const total = Math.max(
    0,
    subtotal - discount
  );

  const tx = await db.transaction.create({
    data: {
      number,
      branchId: input.branchId,
      customerId: input.customerId,
      employeeId: input.employeeId,
      bookingId: input.bookingId,
      status: input.status || 'SELESAI',
      payment: input.payment,
      subtotal,
      discount,
      total,
      reason: input.reason,
      items: {
        create: items,
      },
    },
  });

  if (input.status === 'SELESAI' || !input.status) {
    if (input.employeeId && tx.status === 'SELESAI') {
      const commission =
        total *
        (await commissionRate(input.employeeId)) /
        100;

      if (commission > 0) {
        await db.commission.create({
          data: {
            employeeId: input.employeeId,
            transactionId: tx.id,
            amount: commission,
            status: 'PENDING',
          },
        });
      }
    }

    await db.notification.create({
      data: {
        title: 'Transaksi baru',
        message:
          `${number} selesai dengan total ${total}`,
        priority: 'NORMAL',
      },
    });
  }

  await audit(
    undefined,
    'CREATE',
    'Transaction',
    tx.id,
    {
      number,
      total,
    }
  );

  return tx;
}

export async function commissionRate(
  employeeId: string
) {
  const employee = await db.employee.findUnique({
    where: {
      id: employeeId,
    },
  });

  return moneyNumber(
    employee?.commissionRate
  );
}

export async function businessAnalytics(params: {
  from?: string;
  to?: string;
  branchId?: string;
  employeeId?: string;
}) {
  const { start, end } = rangeDates(
    params.from,
    params.to
  );

  const tx = await db.transaction.findMany({
    where: {
      status: 'SELESAI',
      createdAt: {
        gte: start,
        lte: end,
      },
      ...(params.branchId
        ? {
            branchId: params.branchId,
          }
        : {}),
      ...(params.employeeId
        ? {
            employeeId: params.employeeId,
          }
        : {}),
    },
    include: {
      items: {
        include: {
          service: true,
        },
      },
      employee: true,
      customer: true,
    },
  });

  const exp = await db.expense.findMany({
    where: {
      createdAt: {
        gte: start,
        lte: end,
      },
      ...(params.branchId
        ? {
            branchId: params.branchId,
          }
        : {}),
    },
  });

  const revenue = tx.reduce(
    (sum: number, transaction: { total: unknown }) =>
      sum + moneyNumber(transaction.total),
    0
  );

  const expenses = exp.reduce(
    (sum: number, expense: { amount: unknown }) =>
      sum + moneyNumber(expense.amount),
    0
  );

  const services = new Map<
    string,
    {
      name: string;
      count: number;
      revenue: number;
    }
  >();

  for (const transaction of tx) {
    for (const item of transaction.items) {
      const current =
        services.get(item.serviceId) || {
          name: item.service.name,
          count: 0,
          revenue: 0,
        };

      current.count += item.qty;
      current.revenue += moneyNumber(item.total);

      services.set(
        item.serviceId,
        current
      );
    }
  }

  const hours = Array.from(
    { length: 24 },
    (_, hour) => ({
      hour,
      count: 0,
      revenue: 0,
    })
  );

  for (const transaction of tx) {
    const hour = new Date(
      transaction.createdAt
    ).getHours();

    hours[hour].count++;
    hours[hour].revenue +=
      moneyNumber(transaction.total);
  }

  const averageTransaction = tx.length
    ? revenue / tx.length
    : 0;

  const health = Math.max(
    0,
    Math.min(
      100,
      Math.round(
        (revenue /
          (revenue + expenses || 1)) *
          100
      )
    )
  );

  const anomalies =
    expenses > revenue * 0.5
      ? [
          {
            type: 'expense_ratio',
            message:
              'Pengeluaran lebih dari 50% pendapatan',
          },
        ]
      : [];

  const days = Math.max(
    1,
    Math.ceil(
      (end.getTime() -
        start.getTime()) /
        86400000
    )
  );

  const forecast = tx.length
    ? (revenue / days) * 30
    : 0;

  return {
    from: start,
    to: end,
    revenue,
    expenses,
    profit: revenue - expenses,
    transactions: tx.length,
    averageTransaction,
    health,
    services: [
      ...services.values(),
    ].sort(
      (a, b) =>
        b.revenue - a.revenue
    ),
    hours,
    anomalies,
    forecast,
    confidence:
      tx.length >= 30
        ? 'HIGH'
        : tx.length >= 10
        ? 'MEDIUM'
        : 'LOW',
  };
}

export async function customerInsights(
  customerId: string
) {
  const tx =
    await db.transaction.findMany({
      where: {
        customerId,
        status: 'SELESAI',
      },
      include: {
        items: {
          include: {
            service: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

  const total = tx.reduce(
    (sum: number, transaction: { total: unknown }) =>
      sum + moneyNumber(transaction.total),
    0
  );

  const services = new Map<
    string,
    number
  >();

  tx.flatMap(
    (transaction: { items: Array<{ serviceId: string; total: unknown; qty: number; service: { name: string } }> }) =>
      transaction.items
  ).forEach((item: { serviceId: string; total: unknown; qty: number; service: { name: string } }) => {
    services.set(
      item.service.name,
      (services.get(
        item.service.name
      ) || 0) + item.qty
    );
  });

  const favorite =
    [...services.entries()].sort(
      (a, b) => b[1] - a[1]
    )[0]?.[0] || null;

  return {
    visits: tx.length,
    totalSpend: total,
    averageSpend: tx.length
      ? total / tx.length
      : 0,
    favorite,
    lastVisit:
      tx[0]?.createdAt || null,
  };
}

export async function approveExpense(
  id: string,
  userId: string,
  approve: boolean
) {
  const expense =
    await db.expense.update({
      where: {
        id,
      },
      data: {
        approval: approve
          ? 'APPROVED'
          : 'REJECTED',
      },
    });

  await audit(
    userId,
    approve
      ? 'APPROVE_EXPENSE'
      : 'REJECT_EXPENSE',
    'Expense',
    id
  );

  return expense;
        }
