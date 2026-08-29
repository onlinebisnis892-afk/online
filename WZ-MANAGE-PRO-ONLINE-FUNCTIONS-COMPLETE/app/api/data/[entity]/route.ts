import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

const map: Record<string, string> = {
  branches: 'branch',
  employees: 'employee',
  customers: 'customer',
  services: 'service',
  promotions: 'promotion',
  bookings: 'booking',
  queue: 'queueItem',
  transactions: 'transaction',
  expenses: 'expense',
  attendance: 'attendance',
  shifts: 'shift',
  commissions: 'commission',
  payroll: 'payroll',
  evaluations: 'evaluation',
  notifications: 'notification',
  audit: 'auditLog',
  logins: 'loginEvent',
  exports: 'exportLog',
  backups: 'backupLog',
  systemEvents: 'systemEvent',
  permissions: 'permission',
  rolePermissions: 'rolePermission',
  preferences: 'userPreference',
  cash: 'cashEntry',
  periodLocks: 'periodLock',
  inventory: 'inventoryItem',
  stockMovements: 'stockMovement',
  reportSchedules: 'reportSchedule',
  notificationPreferences: 'notificationPreference',
  branchServices: 'branchService',
  servicePrices: 'servicePrice'
};

function client(entity: string) {
  return (db as any)[map[entity]];
}

function clean(body: any) {
  const out = { ...body };
  delete out.id;
  delete out.createdAt;
  delete out.updatedAt;
  return out;
}

type Params = Promise<{ entity: string }>;

export async function GET(
  req: NextRequest,
  { params }: { params: Params }
) {
  const { entity } = await params;

  const model = map[entity];

  if (!model) {
    return NextResponse.json(
      { error: 'Unknown entity' },
      { status: 404 }
    );
  }

  const url = new URL(req.url);
  const q = url.searchParams.get('q') || '';
  const limit = Math.min(
    Number(url.searchParams.get('limit') || 100),
    500
  );

  const where: any = {};

  if (
    q &&
    [
      'branch',
      'employee',
      'customer',
      'service',
      'promotion',
      'expense',
      'inventoryItem'
    ].includes(model)
  ) {
    const field = [
      'branch',
      'employee',
      'customer',
      'service',
      'promotion'
    ].includes(model)
      ? 'name'
      : 'category';

    where[field] = {
      contains: q,
      mode: 'insensitive'
    };
  }

  const rows = await client(entity)
    .findMany({
      where,
      take: limit,
      orderBy: { createdAt: 'desc' }
    })
    .catch(() =>
      client(entity).findMany({
        where,
        take: limit
      })
    );

  return NextResponse.json({ data: rows });
}

export async function POST(
  req: Next
