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

type Params = Promise<{ entity: string }>;

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

export async function GET(
  req: NextRequest,
  { params }: { params: Params }
) {
  const { entity } = await params;

  if (!map[entity]) {
    return NextResponse.json({ error: 'Unknown entity' }, { status: 404 });
  }

  const url = new URL(req.url);
  const q = url.searchParams.get('q') || '';
  const limit = Math.min(
    Number(url.searchParams.get('limit') || 100),
    500
  );

  const where: any = {};

  if (q) {
    const model = map[entity];

    if (
      ['branch', 'employee', 'customer', 'service', 'promotion'].includes(model)
    ) {
      where.name = { contains: q, mode: 'insensitive' };
    } else if (['expense', 'inventoryItem'].includes(model)) {
      where.category = { contains: q, mode: 'insensitive' };
    }
  }

  const c = client(entity);

  const data = await c
    .findMany({
      where,
      take: limit,
      orderBy: { createdAt: 'desc' }
    })
    .catch(() => c.findMany({ where, take: limit }));

  return NextResponse.json({ data });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Params }
) {
  const { entity } = await params;

  if (!map[entity]) {
    return NextResponse.json({ error: 'Unknown entity' }, { status: 404 });
  }

  const body = clean(await req.json());
  const data = await client(entity).create({ data: body });

  return NextResponse.json({ data }, { status: 201 });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Params }
) {
  const { entity } = await params;

  if (!map[entity]) {
    return NextResponse.json({ error: 'Unknown entity' }, { status: 404 });
  }

  const body = await req.json();
  const id = body.id;

  if (!id) {
    return NextResponse.json({ error: 'id required' }, { status: 400 });
  }

  const data = await client(entity).update({
    where: { id },
    data: clean(body)
  });

  return NextResponse.json({ data });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Params }
) {
  const { entity } = await params;

  if (!map[entity]) {
    return NextResponse.json({ error: 'Unknown entity' }, { status: 404 });
  }

  const id = new URL(req.url).searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'id required' }, { status: 400 });
  }

  const data = await client(entity).delete({ where: { id } });

  return NextResponse.json({ data });
}
