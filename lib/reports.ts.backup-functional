import {db} from './db';
import {businessAnalytics, rangeDates} from './business';
export async function reportData(type:string,params:any){
  if(type==='analytics') return businessAnalytics(params);
  if(type==='transactions') {const {start,end}=rangeDates(params.from,params.to);return db.transaction.findMany({where:{createdAt:{gte:start,lte:end}},include:{items:true},orderBy:{createdAt:'desc'}})}
  if(type==='finance'){const {start,end}=rangeDates(params.from,params.to);const [t,e]=await Promise.all([db.transaction.findMany({where:{status:'SELESAI',createdAt:{gte:start,lte:end}}}),db.expense.findMany({where:{createdAt:{gte:start,lte:end}}})]);return {revenue:t.reduce((s: number,x: { total: unknown })=>s+Number(x.total),0),expenses:e.reduce((s: number,x: { amount: unknown })=>s+Number(x.amount),0)}}
  if(type==='employees') return db.employee.findMany({include:{transactions:{where:{status:'SELESAI'}}}});
  if(type==='customers') return db.customer.findMany({include:{transactions:true,bookings:true}});
  if(type==='operations') return db.attendance.findMany({include:{employee:true}});
  throw new Error('Report type tidak dikenal');
}
export function csv(rows:any[]){if(!rows.length)return '';const cols=[...new Set(rows.flatMap(r=>Object.keys(r)))];return [cols.join(','),...rows.map(r=>cols.map(c=>JSON.stringify(r[c]??'')).join(','))].join('\n')}
