import {createHash, randomBytes, scryptSync, timingSafeEqual} from 'node:crypto';
import {db} from './db';

export function hashPassword(password:string){
  const salt=randomBytes(16).toString('hex');
  return `${salt}:${scryptSync(password,salt,64).toString('hex')}`;
}
export function verifyPassword(password:string,stored:string){
  const [salt,hex]=stored.split(':');
  if(!salt||!hex) return false;
  const expected=Buffer.from(hex,'hex');
  const actual=scryptSync(password,salt,64);
  return expected.length===actual.length&&timingSafeEqual(expected,actual);
}
export function hashToken(raw:string){return createHash('sha256').update(raw).digest('hex')}
export function createToken(){return randomBytes(32).toString('hex')}

const LOGIN_LIMIT=5;
const LOGIN_WINDOW_MS=15*60*1000;
const attempts=new Map<string,{count:number,first:number}>();
export function checkLoginAttempt(key:string){
  const a=attempts.get(key); if(!a) return {allowed:true,remaining:LOGIN_LIMIT};
  if(Date.now()-a.first>LOGIN_WINDOW_MS){attempts.delete(key);return {allowed:true,remaining:LOGIN_LIMIT};}
  return {allowed:a.count<LOGIN_LIMIT,remaining:Math.max(0,LOGIN_LIMIT-a.count)};
}
export function registerLoginFailure(key:string){
  const a=attempts.get(key);
  if(!a||Date.now()-a.first>LOGIN_WINDOW_MS) attempts.set(key,{count:1,first:Date.now()});
  else a.count+=1;
}
export function clearLoginFailures(key:string){attempts.delete(key)}

export async function audit(userId:string|undefined,action:string,entity?:string,entityId?:string,details?:unknown){
  await db.auditLog.create({data:{userId,action,entity,entityId,details:details as any}});
}
