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

    const tickets = await db.supportTicket.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { customId: true, fullName: true, email: true } },
      },
    });

    return NextResponse.json({ tickets });
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

    const { ticketId, action, reply } = await req.json();
    if (!ticketId || !action) {
      return NextResponse.json({ error: 'ticketId and action required' }, { status: 400 });
    }

    if (action === 'REPLY') {
      if (!reply) return NextResponse.json({ error: 'Reply text required' }, { status: 400 });
      await db.supportTicket.update({
        where: { id: ticketId },
        data: { adminReply: reply, status: 'ANSWERED' },
      });
      return NextResponse.json({ success: true, message: 'Reply sent.' });
    } else if (action === 'CLOSE') {
      await db.supportTicket.update({
        where: { id: ticketId },
        data: { status: 'CLOSED' },
      });
      return NextResponse.json({ success: true, message: 'Ticket closed.' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
