import { NextRequest, NextResponse } from 'next/server';
import { executeFeature } from '@/lib/feature-engine';

export const runtime = 'nodejs';

export async function POST(req: NextRequest, { params }: { params: Promise<{ feature: string }> }) {
  try {
    const { feature } = await params;
    const body = await req.json().catch(() => ({}));
    const result = await executeFeature(decodeURIComponent(feature), body);
    return NextResponse.json(result, { status: result.ok ? 200 : 400 });
  } catch (error) {
    return NextResponse.json({ ok: false, message: error instanceof Error ? error.message : 'Feature execution failed' }, { status: 500 });
  }
}
