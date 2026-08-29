import {db} from './db';
export async function createBackup(){
  const [branches,employees,customers,services,promos,bookings,transactions,expenses,attendance,shifts,commissions,payroll,notifications,audits,settings]=await Promise.all([
    db.branch.findMany(),db.employee.findMany(),db.customer.findMany(),db.service.findMany({include:{priceHistory:true,branches:true}}),db.promotion.findMany(),db.booking.findMany(),db.transaction.findMany({include:{items:true}}),db.expense.findMany(),db.attendance.findMany(),db.shift.findMany(),db.commission.findMany(),db.payroll.findMany(),db.notification.findMany(),db.auditLog.findMany(),Promise.resolve(null)
  ]);return {createdAt:new Date().toISOString(),branches,employees,customers,services,promos,bookings,transactions,expenses,attendance,shifts,commissions,payroll,notifications,audits,settings};
}
