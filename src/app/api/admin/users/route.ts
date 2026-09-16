import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const admin = await db.user.findUnique({ where: { id: session.userId }, select: { role: true } });
    if (!admin || (admin.role !== 'ADMIN' && admin.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const users = await db.user.findMany({
      where: {
        adminId: session.userId,
        role: 'USER',
      },
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
        usdtAddress: true,
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
    if (!admin || (admin.role !== 'ADMIN' && admin.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const body = await req.json();
    const { userId, action } = body;
    if (!userId || !action) {
      return NextResponse.json({ error: 'userId and action required' }, { status: 400 });
    }

    // Verify target user belongs to this admin's team
    const targetUser = await db.user.findFirst({
      where: { id: userId, adminId: session.userId },
    });
    if (!targetUser) {
      return NextResponse.json({ error: 'Target user not found or access denied.' }, { status: 404 });
    }

    if (action === 'BLOCK') {
      await db.user.update({ where: { id: userId }, data: { status: 'BLOCKED' } });
      return NextResponse.json({ success: true, message: 'User blocked.' });
    } else if (action === 'UNBLOCK') {
      await db.user.update({ where: { id: userId }, data: { status: 'ACTIVE' } });
      return NextResponse.json({ success: true, message: 'User unblocked.' });
    } else if (action === 'UPDATE' || action === 'EDIT') {
      const { fullName, email, phone, usdtAddress } = body;

      if (!email || !email.trim()) {
        return NextResponse.json({ error: 'Email address is required' }, { status: 400 });
      }

      const cleanEmail = email.trim().toLowerCase();

      // Check if email already exists for another user
      const existingEmail = await db.user.findFirst({
        where: {
          email: cleanEmail,
          NOT: { id: userId },
        },
      });

      if (existingEmail) {
        return NextResponse.json(
          { error: `Email "${cleanEmail}" is already registered to user ${existingEmail.customId}` },
          { status: 400 }
        );
      }

      const updatedUser = await db.user.update({
        where: { id: userId },
        data: {
          ...(fullName && fullName.trim() ? { fullName: fullName.trim() } : {}),
          email: cleanEmail,
          phone: phone !== undefined ? (phone ? phone.trim() : null) : undefined,
          usdtAddress: usdtAddress !== undefined ? (usdtAddress ? usdtAddress.trim() : null) : undefined,
        },
        select: {
          id: true,
          customId: true,
          fullName: true,
          email: true,
          phone: true,
          usdtAddress: true,
          status: true,
        },
      });

      return NextResponse.json({
        success: true,
        message: `User ${updatedUser.customId} profile updated successfully.`,
        user: updatedUser,
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
