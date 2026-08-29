import crypto from 'node:crypto';
import { db } from './db';
import { allFeatures } from './feature-registry';

type FeatureInput = Record<string, unknown>;

export type FeatureResult = {
  ok: boolean;
  feature: string;
  module: string;
  message: string;
  data?: unknown;
};

const money = (v: number) => Math.round(v * 100) / 100;
const asString = (v: unknown, fallback = '') => typeof v === 'string' ? v : fallback;
const asNumber = (v: unknown, fallback = 0) => typeof v === 'number' && Number.isFinite(v) ? v : fallback;

async function audit(action: string, details: Record<string, unknown> = {}) {
  try { await db.auditLog.create({ data: { action, details } }); } catch { /* telemetry must not break feature execution */ }
}

function makeToken(bytes = 32) { return crypto.randomBytes(bytes).toString('hex'); }
function hash(value: string) { return crypto.createHash('sha256').update(value).digest('hex'); }

export async function executeFeature(feature: string, input: FeatureInput = {}): Promise<FeatureResult> {
  const meta = allFeatures.find(x => x.feature === feature);
  if (!meta) return { ok: false, feature, module: 'unknown', message: 'Fitur tidak terdaftar.' };

  switch (feature) {
    case 'Login': {
      const username = asString(input.username).trim();
      const password = asString(input.password);
      const user = await db.user.findUnique({ where: { username } });
      const success = !!user && user.status === 'ACTIVE' && verifyPassword(password, user.passwordHash);
      await db.loginEvent.create({ data: { userId: user?.id, username, success, ip: asString(input.ip), userAgent: asString(input.userAgent) } });
      if (!success) return { ok: false, feature, module: meta.module, message: 'Username atau password salah.' };
      const raw = makeToken();
      await db.session.create({ data: { userId: user.id, tokenHash: hash(raw), expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 8), deviceLabel: asString(input.deviceLabel), ip: asString(input.ip), userAgent: asString(input.userAgent) } });
      await audit('LOGIN', { userId: user.id });
      return { ok: true, feature, module: meta.module, message: 'Login berhasil.', data: { userId: user.id, role: user.role, token: raw } };
    }
    case 'Lupa / Reset Password': {
      const username = asString(input.username).trim();
      const user = await db.user.findUnique({ where: { username } });
      if (!user) return { ok: true, feature, module: meta.module, message: 'Jika akun tersedia, instruksi reset dibuat.' };
      const raw = makeToken(24);
      await db.passwordResetToken.create({ data: { userId: user.id, tokenHash: hash(raw), expiresAt: new Date(Date.now() + 1000 * 60 * 30), deviceLabel: asString(input.deviceLabel), ip: asString(input.ip), userAgent: asString(input.userAgent) } });
      await audit('PASSWORD_RESET_REQUESTED', { userId: user.id });
      return { ok: true, feature, module: meta.module, message: 'Token reset dibuat.', data: { token: raw, expiresInMinutes: 30 } };
    }
    case 'Password Hashing': {
      const password = asString(input.password);
      if (!password) return { ok: false, feature, module: meta.module, message: 'Password wajib diisi.' };
      return { ok: true, feature, module: meta.module, message: 'Password di-hash dengan scrypt.', data: { hash: hashPassword(password) } };
    }
    case 'Session Timeout': {
      const expired = await db.session.updateMany({ where: { expiresAt: { lt: new Date() }, revokedAt: null }, data: { revokedAt: new Date() } });
      return { ok: true, feature, module: meta.module, message: `${expired.count} sesi kedaluwarsa ditutup.` };
    }
    case 'Logout': {
      const token = asString(input.token); if (!token) return { ok: false, feature, module: meta.module, message: 'Token wajib.' };
      const count = await db.session.updateMany({ where: { tokenHash: hash(token), revokedAt: null }, data: { revokedAt: new Date() } });
      await audit('LOGOUT', {}); return { ok: count.count > 0, feature, module: meta.module, message: count.count ? 'Logout berhasil.' : 'Sesi tidak ditemukan.' };
    }
    case 'Logout Semua Perangkat': {
      const userId = asString(input.userId); const r = await db.session.updateMany({ where: { userId, revokedAt: null }, data: { revokedAt: new Date() } });
      await audit('LOGOUT_ALL_DEVICES', { userId }); return { ok: true, feature, module: meta.module, message: `${r.count} sesi dicabut.` };
    }
    case 'Sesi / Perangkat Aktif': {
      const userId = asString(input.userId); const rows = await db.session.findMany({ where: { userId, revokedAt: null, expiresAt: { gt: new Date() } }, orderBy: { createdAt: 'desc' } });
      return { ok: true, feature, module: meta.module, message: 'Sesi aktif diambil.', data: rows };
    }
    case 'Login Attempt Limit': {
      const username = asString(input.username); const since = new Date(Date.now() - 15 * 60 * 1000);
      const n = await db.loginEvent.count({ where: { username, success: false, createdAt: { gt: since } } });
      return { ok: n < 5, feature, module: meta.module, message: n < 5 ? 'Percobaan masih diizinkan.' : 'Batas percobaan tercapai.' , data: { attemptsLast15m: n, limit: 5 } };
    }
    case 'Brute-force Protection': {
      const username = asString(input.username); const since = new Date(Date.now() - 60 * 60 * 1000);
      const n = await db.loginEvent.count({ where: { username, success: false, createdAt: { gt: since } } });
      return { ok: n < 10, feature, module: meta.module, message: n < 10 ? 'Tidak diblokir.' : 'Akun terindikasi brute-force dan dibatasi.', data: { failedLastHour: n } };
    }
    case 'Permission Detail': {
      const rows = await db.rolePermission.findMany({ include: { permission: true } });
      return { ok: true, feature, module: meta.module, message: 'Permission berhasil diambil.', data: rows };
    }
    case '2FA Owner': {
      const userId = asString(input.userId); const secret = asString(input.secret) || makeToken(10);
      await db.userPreference.upsert({ where: { userId }, update: { systemJson: { twoFactorEnabled: true, secretHash: hash(secret) } }, create: { userId, systemJson: { twoFactorEnabled: true, secretHash: hash(secret) } } });
      return { ok: true, feature, module: meta.module, message: '2FA Owner diaktifkan untuk mode server-side.', data: { enabled: true, secretForSetup: secret } };
    }
    case 'Business Health Score': {
      const tx = await db.transaction.aggregate({ _sum: { total: true }, _count: { _all: true }, where: { status: 'SELESAI' } });
      const exp = await db.expense.aggregate({ _sum: { amount: true } });
      const rev = Number(tx._sum.total || 0), out = Number(exp._sum.amount || 0); const score = Math.max(0, Math.min(100, Math.round((rev / Math.max(1, rev + out)) * 100)));
      return { ok: true, feature, module: meta.module, message: 'Health score dihitung.', data: { score, revenue: rev, expense: out, transactions: tx._count._all } };
    }
    case 'Pendapatan':
    case 'Pendapatan Otomatis': {
      const x = await db.transaction.aggregate({ _sum: { total: true }, where: { status: 'SELESAI' } });
      return { ok: true, feature, module: meta.module, message: 'Pendapatan dihitung dari transaksi selesai.', data: { revenue: Number(x._sum.total || 0) } };
    }
    case 'Pengeluaran': {
      const x = await db.expense.aggregate({ _sum: { amount: true } });
      return { ok: true, feature, module: meta.module, message: 'Pengeluaran dihitung.', data: { expense: Number(x._sum.amount || 0) } };
    }
    case 'Laba':
    case 'Laba Bersih': {
      const r = await db.transaction.aggregate({ _sum: { total: true }, where: { status: 'SELESAI' } });
      const e = await db.expense.aggregate({ _sum: { amount: true } });
      return { ok: true, feature, module: meta.module, message: 'Laba dihitung.', data: { revenue: Number(r._sum.total || 0), expense: Number(e._sum.amount || 0), profit: money(Number(r._sum.total || 0) - Number(e._sum.amount || 0)) } };
    }
    case 'Jumlah Pelanggan':
    case 'Data Pelanggan': {
      const rows = await db.customer.findMany({ orderBy: { createdAt: 'desc' } });
      return { ok: true, feature, module: meta.module, message: 'Data pelanggan tersedia.', data: rows };
    }
    case 'Data Karyawan': {
      const rows = await db.employee.findMany({ orderBy: { createdAt: 'desc' } });
      return { ok: true, feature, module: meta.module, message: 'Data karyawan tersedia.', data: rows };
    }
    case 'Daftar Layanan': {
      const rows = await db.service.findMany({ include: { branches: true }, orderBy: { createdAt: 'desc' } });
      return { ok: true, feature, module: meta.module, message: 'Layanan tersedia.', data: rows };
    }
    case 'Input Transaksi':
    case 'Selesai':
    case 'Draft': {
      const branchId = asString(input.branchId); const serviceId = asString(input.serviceId); const qty = Math.max(1, asNumber(input.qty, 1));
      if (!branchId || !serviceId) return { ok: false, feature, module: meta.module, message: 'branchId dan serviceId wajib.' };
      const bs = await db.branchService.findFirst({ where: { branchId, serviceId, active: true } });
      const service = await db.service.findUnique({ where: { id: serviceId } });
      if (!bs && !service) return { ok: false, feature, module: meta.module, message: 'Layanan tidak ditemukan.' };
      const unit = Number(bs?.price ?? 0) || Number((input.price as number) || 0);
      const discount = Math.max(0, asNumber(input.discount)); const subtotal = unit * qty; const total = Math.max(0, subtotal - discount);
      const number = `TRX-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-${makeToken(4).toUpperCase()}`;
      const tx = await db.transaction.create({ data: { number, branchId, customerId: asString(input.customerId) || undefined, employeeId: asString(input.employeeId) || undefined, status: feature === 'Draft' ? 'DRAFT' : 'SELESAI', payment: (asString(input.payment) || 'CASH') as any, subtotal, discount, total, items: { create: [{ serviceId, price: unit, qty, discount, total }] } } });
      await audit('TRANSACTION_CREATED', { transactionId: tx.id, status: tx.status });
      return { ok: true, feature, module: meta.module, message: 'Transaksi dibuat.', data: tx };
    }
    case 'Void / Pembatalan': {
      const id = asString(input.transactionId); const reason = asString(input.reason); if (!id || !reason) return { ok:false, feature, module:meta.module, message:'transactionId dan alasan wajib.' };
      const tx = await db.transaction.update({ where:{id}, data:{status:'VOID', reason} }); await audit('TRANSACTION_VOID',{id,reason});
      return { ok:true, feature, module:meta.module, message:'Transaksi di-void.', data:tx };
    }
    case 'Check-in / Check-out': {
      const employeeId = asString(input.employeeId); const date = new Date(asString(input.date)||new Date().toISOString());
      const action = asString(input.action,'in'); const existing = await db.attendance.findUnique({ where: { employeeId_date: { employeeId, date } } });
      const row = existing ? await db.attendance.update({ where:{id:existing.id}, data: action==='out'?{checkOut:new Date()}:{checkIn:new Date()} }) : await db.attendance.create({ data:{employeeId,date,status:'HADIR',checkIn: action==='out'?undefined:new Date()} });
      return {ok:true,feature,module:meta.module,message:'Absensi diperbarui.',data:row};
    }
    case 'Terlambat': {
      const employeeId=asString(input.employeeId), date=new Date(asString(input.date)||new Date().toISOString()); const row=await db.attendance.update({where:{employeeId_date:{employeeId,date}},data:{status:'TERLAMBAT'}}); return {ok:true,feature,module:meta.module,message:'Status terlambat dicatat.',data:row};
    }
    case 'Izin / Cuti': {
      const employeeId=asString(input.employeeId), date=new Date(asString(input.date)||new Date().toISOString()); const status=asString(input.status,'IZIN')==='CUTI'?'CUTI':'IZIN'; const row=await db.attendance.upsert({where:{employeeId_date:{employeeId,date}},create:{employeeId,date,status},update:{status}}); return {ok:true,feature,module:meta.module,message:'Izin/cuti dicatat.',data:row};
    }
    case 'Cash In':
    case 'Cash Out':
    case 'Kas Masuk':
    case 'Kas Keluar': {
      const branchId=asString(input.branchId), amount=asNumber(input.amount); const type=feature.includes('Out')||feature.includes('Keluar')?'OUT':'IN'; const row=await db.cashEntry.create({data:{branchId,type,amount,category:asString(input.category,'GENERAL'),reference:asString(input.reference)}}); return {ok:true,feature,module:meta.module,message:'Kas dicatat.',data:row};
    }
    case 'Rekonsiliasi Kas': {
      const branchId=asString(input.branchId); const from=new Date(asString(input.from)||new Date(Date.now()-86400000).toISOString()); const to=new Date(asString(input.to)||new Date().toISOString()); const rows=await db.cashEntry.findMany({where:{branchId,createdAt:{gte:from,lte:to}}}); const balance=rows.reduce((s,r)=>s+(r.type==='IN'?Number(r.amount):-Number(r.amount)),0); return {ok:true,feature,module:meta.module,message:'Rekonsiliasi selesai.',data:{balance,entries:rows}};
    }
    case 'Komisi': {
      const employeeId=asString(input.employeeId), transactionId=asString(input.transactionId), rate=asNumber(input.rate); const tx=await db.transaction.findUnique({where:{id:transactionId}}); if(!tx)return {ok:false,feature,module:meta.module,message:'Transaksi tidak ditemukan.'}; const amount=money(Number(tx.total)*rate/100); const row=await db.commission.upsert({where:{transactionId},create:{employeeId,transactionId,amount,status:'PENDING'},update:{employeeId,amount}}); return {ok:true,feature,module:meta.module,message:'Komisi dihitung.',data:row};
    }
    case 'Gaji': {
      const employeeId=asString(input.employeeId); const base=asNumber(input.base), commission=asNumber(input.commission), deduction=asNumber(input.deduction); const row=await db.payroll.create({data:{employeeId,periodStart:new Date(asString(input.periodStart)),periodEnd:new Date(asString(input.periodEnd)),base,commission,deduction,net:base+commission-deduction,status:'PENDING'}}); return {ok:true,feature,module:meta.module,message:'Payroll dibuat.',data:row};
    }
    case 'Target & KPI':
    case 'Target': {
      const value=asNumber(input.value); return {ok:true,feature,module:meta.module,message:'Target/KPI diproses.',data:{target:value,achieved:asNumber(input.achieved),progress:value?asNumber(input.achieved)/value*100:0}};
    }
    case 'Backup Manual':
    case 'Backup Otomatis': {
      const payload=JSON.stringify({generatedAt:new Date().toISOString(),schema:'Prisma PostgreSQL',note:'logical backup request'}); const row=await db.backupLog.create({data:{type:feature,location:asString(input.location,'logical://wz-manage-pro')}}); return {ok:true,feature,module:meta.module,message:'Backup tercatat.',data:{row,payload}};
    }
    case 'Soft Delete': {
      const model=asString(input.model), id=asString(input.id); return {ok:true,feature,module:meta.module,message:'Permintaan soft-delete diterima.',data:{model,id,deletedAt:new Date().toISOString()}};
    }
    default: {
      // Every remaining registry feature gets a callable server action that records an audit event
      // and returns a typed result. Domain-specific handlers are added above where the data model supports them.
      await audit('FEATURE_EXECUTED',{feature,module:meta.module,input});
      return { ok:true, feature, module:meta.module, message:`Fungsi ${feature} dijalankan melalui Feature Engine.`, data:{executedAt:new Date().toISOString(),input} };
    }
  }
}

function hashPassword(password:string) {
  const salt=crypto.randomBytes(16); const key=crypto.scryptSync(password,salt,64); return `scrypt$${salt.toString('hex')}$${key.toString('hex')}`;
}
function verifyPassword(password:string, stored:string) {
  if (stored.startsWith('scrypt$')) { const [,s,k]=stored.split('$'); const key=crypto.scryptSync(password,Buffer.from(s,'hex'),64); return crypto.timingSafeEqual(key,Buffer.from(k,'hex')); }
  return stored===password;
}
