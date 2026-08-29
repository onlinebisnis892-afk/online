import {db} from './db';
import {audit} from './security';
import {rangeDates} from './business';

export async function checkIn(employeeId:string,status:'HADIR'|'TERLAMBAT'='HADIR'){
 const d=new Date(); const date=new Date(d); date.setHours(0,0,0,0);
 return db.attendance.upsert({where:{employeeId_date:{employeeId,date}},update:{status,checkIn:d},create:{employeeId,status,checkIn:d,date}})
}
export async function checkOut(employeeId:string){const d=new Date();const date=new Date(d);date.setHours(0,0,0,0);return db.attendance.update({where:{employeeId_date:{employeeId,date}},data:{checkOut:d}})}
export async function createShift(employeeId:string,branchId:string){return db.shift.create({data:{employeeId,branchId,startAt:new Date(),status:'OPEN'}})}
export async function closeShift(id:string){return db.shift.update({where:{id},data:{endAt:new Date(),status:'CLOSED'}})}
export async function addQueue(branchId:string,customerId?:string,serviceId?:string,employeeId?:string){const today=new Date();today.setHours(0,0,0,0);const count=await db.queueItem.count({where:{branchId,joinedAt:{gte:today}}});return db.queueItem.create({data:{number:count+1,branchId,customerId,serviceId,employeeId,status:'WAITING'}})}
export async function updateQueue(id:string,status:string){const at=new Date();const data:any={status};if(status==='CALLED')data.calledAt=at;if(status==='IN_SERVICE')data.startedAt=at;if(status==='COMPLETED')data.completedAt=at;return db.queueItem.update({where:{id},data})}
export async function createBooking(input:{customerId:string;employeeId?:string;serviceId:string;branchId:string;scheduledAt:string}){return db.booking.create({data:{...input,scheduledAt:new Date(input.scheduledAt),status:'BOOKED'}})}
export async function closePeriod(start:string,end:string,userId:string,branchId?:string){return db.periodLock.create({data:{startAt:new Date(start),endAt:new Date(end),branchId,status:'LOCKED',lockedBy:userId}})}
export async function reopenPeriod(id:string,userId:string){return db.periodLock.update({where:{id},data:{status:'OPEN',reopenedBy:userId}})}
export async function operationalSummary(branchId?:string,from?:string,to?:string){const {start,end}=rangeDates(from,to);const [att,shifts,queue]=await Promise.all([db.attendance.findMany({where:{date:{gte:start,lte:end},...(branchId?{employee:{branchId}}:{})},include:{employee:true}}),db.shift.findMany({where:{startAt:{gte:start,lte:end},...(branchId?{branchId}:{})}}),db.queueItem.findMany({where:{joinedAt:{gte:start,lte:end},...(branchId?{branchId}:{})}})]);return {attendance:att,shifts,queue}}
export async function setEmployeeTarget(employeeId:string,target:number){return db.employee.update({where:{id:employeeId},data:{target}})}
export async function evaluateEmployee(employeeId:string,score:number,notes?:string){return db.evaluation.create({data:{employeeId,score,notes}})}
