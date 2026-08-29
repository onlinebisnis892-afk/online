import { db } from './db';
import { audit } from './security';

export async function cashIn(
  branchId: string,
  amount: number,
  category: string,
  reference?: string
) {
  const e = await db.cashEntry.create({
    data: {
      branchId,
      type: 'IN',
      amount,
      category,
      reference
    }
  });

  await audit(
    undefined,
    'CASH_IN',
    'CashEntry',
    e.id
  );

  return e;
}

export async function cashOut(
  branchId: string,
  amount: number,
  category: string,
  reference?: string
) {
  const e = await db.cashEntry.create({
    data: {
      branchId,
      type: 'OUT',
      amount,
      category,
      reference
    }
  });

  await audit(
    undefined,
    'CASH_OUT',
    'CashEntry',
    e.id
  );

  return e;
}

export async function reconcileCash(
  branchId: string,
  from: Date,
  to: Date
) {
  const rows = await db.cashEntry.findMany({
    where: {
      branchId,
      createdAt: {
        gte: from,
        lte: to
      }
    }
  });

  const ins = rows
    .filter((x) => x.type === 'IN')
    .reduce(
      (sum, x) => sum + Number(x.amount),
      0
    );

  const outs = rows
    .filter((x) => x.type === 'OUT')
    .reduce(
      (sum, x) => sum + Number(x.amount),
      0
    );

  return {
    cashIn: ins,
    cashOut: outs,
    balance: ins - outs,
    entries: rows
  };
}

export async function calculatePayroll(
  employeeId: string,
  start: Date,
  end: Date
) {
  const employee =
    await db.employee.findUnique({
      where: {
        id: employeeId
      }
    });

  if (!employee) {
    throw new Error(
      'Karyawan tidak ditemukan'
    );
  }

  /*
   * Commission tidak mempunyai createdAt.
   * Karena Transaction mempunyai createdAt,
   * komisi periode dihitung dari transaksi
   * selesai milik karyawan.
   */
  const transactions =
    await db.transaction.findMany({
      where: {
        employeeId,
        status: 'SELESAI',
        createdAt: {
          gte: start,
          lte: end
        }
      }
    });

  const commissionRate =
    Number(employee.commissionRate || 0);

  const commission =
    transactions.reduce(
      (sum, transaction) =>
        sum +
        (Number(transaction.total) *
          commissionRate) /
          100,
      0
    );

  const base = Number(
    employee.salary || 0
  );

  const net =
    base + commission;

  return db.payroll.create({
    data: {
      employeeId,
      periodStart: start,
      periodEnd: end,
      base,
      commission,
      net,
      status: 'PENDING'
    }
  });
}

export async function approvePayroll(
  id: string,
  approve: boolean
) {
  return db.payroll.update({
    where: {
      id
    },
    data: {
      status: approve
        ? 'APPROVED'
        : 'REJECTED'
    }
  });
}

export async function inventoryMove(
  itemId: string,
  type: 'IN' | 'OUT',
  qty: number,
  reason?: string
) {
  if (qty <= 0) {
    throw new Error(
      'Qty harus > 0'
    );
  }

  const item =
    await db.inventoryItem.findUnique({
      where: {
        id: itemId
      }
    });

  if (!item) {
    throw new Error(
      'Inventory tidak ditemukan'
    );
  }

  if (
    type === 'OUT' &&
    item.stock < qty
  ) {
    throw new Error(
      'Stok tidak cukup'
    );
  }

  const item2 =
    await db.inventoryItem.update({
      where: {
        id: itemId
      },
      data: {
        stock:
          type === 'IN'
            ? {
                increment: qty
              }
            : {
                decrement: qty
              }
      }
    });

  await db.stockMovement.create({
    data: {
      inventoryItemId: itemId,
      type,
      qty,
      reason
    }
  });

  if (
    item2.stock <= item2.minStock
  ) {
    await db.notification.create({
      data: {
        title: 'Stok minimum',
        message:
          `${item2.name} mencapai stok minimum`,
        priority: 'HIGH'
      }
    });
  }

  return item2;
}
