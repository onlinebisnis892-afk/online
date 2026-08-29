import {cookies} from 'next/headers';
import {db} from './db';
import {hashToken,createToken,hashPassword,verifyPassword} from './security';
export {hashToken,createToken,hashPassword,verifyPassword};
export async function getSessionUser(){
  const c=await cookies(); const raw=c.get('wz_session')?.value; if(!raw)return null;
  const s=await db.session.findUnique({where:{tokenHash:hashToken(raw)},include:{user:true}});
  if(!s||s.revokedAt||s.expiresAt<new Date()||s.user.status!=='ACTIVE')return null;
  return s.user;
}
