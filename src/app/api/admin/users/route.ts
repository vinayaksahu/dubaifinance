import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const admin = await db.user.findUnique({ where: { id: session.userId }, select: { role: true } });
    if (!admin || admin.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const users = await db.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        customId: true,
        fullName: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        fundBalance: true,
        incomeBalance: true,
        fdLockedBalance: true,
        totalWithdrawn: true,
        directBusiness: true,
        sponsorId: true,
        createdAt: true,
        _count: { select: { directs: true, contracts: true } },
      },
    });

    return NextResponse.json({ users });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const admin = await db.user.findUnique({ where: { id: session.userId }, select: { role: true } });
    if (!admin || admin.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { userId, action } = await req.json();
    if (!userId || !action) {
      return NextResponse.json({ error: 'userId and action required' }, { status: 400 });
    }

    if (action === 'BLOCK') {
      await db.user.update({ where: { id: userId }, data: { status: 'BLOCKED' } });
      return NextResponse.json({ success: true, message: 'User blocked.' });
    } else if (action === 'UNBLOCK') {
      await db.user.update({ where: { id: userId }, data: { status: 'ACTIVE' } });
      return NextResponse.json({ success: true, message: 'User unblocked.' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
