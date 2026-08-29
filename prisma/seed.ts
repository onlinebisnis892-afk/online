import {PrismaClient} from '@prisma/client';import {scryptSync,randomBytes} from 'node:crypto';
const db=new PrismaClient();
const ph=(p:string)=>{const salt=randomBytes(16).toString('hex');return `${salt}:${scryptSync(p,salt,64).toString('hex')}`};
async function main(){
 const branch=await db.branch.upsert({where:{id:'demo-branch'},update:{},create:{id:'demo-branch',name:'WZ Barbershop Pusat',target:10000000}});
 const owner=await db.user.upsert({where:{username:'owner'},update:{},create:{username:'owner',passwordHash:ph('owner123'),role:'OWNER'}});
 const service=await db.service.upsert({where:{id:'demo-service'},update:{},create:{id:'demo-service',name:'Potong Rambut',category:'Haircut',duration:45,priceHistory:{create:{price:50000,effectiveAt:new Date()}}}});
 await db.branchService.upsert({where:{branchId_serviceId:{branchId:branch.id,serviceId:service.id}},update:{price:50000,active:true},create:{branchId:branch.id,serviceId:service.id,price:50000,active:true}});
 await db.employee.upsert({where:{employeeNo:'EMP-001'},update:{branchId:branch.id,userId:owner.id},create:{employeeNo:'EMP-001',name:'Owner',role:'OWNER',branchId:branch.id,userId:owner.id,commissionRate:10}});
 console.log({branch:branch.id,user:owner.username,service:service.id});
}main().finally(()=>db.$disconnect());
