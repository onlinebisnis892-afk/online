import {NextResponse} from 'next/server';
export async function GET(){return NextResponse.json({ok:true,service:'wz-manage-pro-online',time:new Date().toISOString()})}
