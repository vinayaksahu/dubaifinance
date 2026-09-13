import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { getAllSystemConfigs } from "@/lib/configService";
import Decimal from "decimal.js";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await db.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      customId: true,
      fullName: true,
      email: true,
      phone: true,
      role: true,
      status: true,
      usdtAddress: true,
      fundBalance: true,
      incomeBalance: true,
      fdLockedBalance: true,
      totalWithdrawn: true,
      directBusiness: true,
      sponsorId: true,
      sponsor: {
        select: { customId: true, fullName: true },
      },
      directs: {
        select: {
          id: true,
          customId: true,
          fullName: true,
          status: true,
          createdAt: true,
          contracts: {
            where: { status: "ACTIVE" },
            select: { amountInUsdt: true, amountInInr: true },
          },
        },
        orderBy: { createdAt: "desc" },
      },
      contracts: {
        orderBy: { createdAt: "desc" },
      },
      deposits: {
        orderBy: { createdAt: "desc" },
        take: 50,
      },
      withdrawals: {
        orderBy: { createdAt: "desc" },
        take: 50,
      },
      ledgers: {
        orderBy: { createdAt: "desc" },
        take: 100,
      },
      createdAt: true,
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Calculate Basic & FD Package investments in pure USDT
  let basicPackageTotal = new Decimal(0);
  let fdPackageTotal = new Decimal(0);

  for (const contract of user.contracts) {
    if (contract.status === "ACTIVE") {
      const contractUsdt = contract.amountInUsdt
        ? new Decimal(contract.amountInUsdt.toString())
        : (contract.amountInInr ? new Decimal(contract.amountInInr.toString()) : new Decimal(0));
      if (contract.packageType === "BASIC_SAVING") {
        basicPackageTotal = basicPackageTotal.plus(contractUsdt);
      } else {
        fdPackageTotal = fdPackageTotal.plus(contractUsdt);
      }
    }
  }

  // Calculate Total Income = Current Income Balance + Total Withdrawn
  const totalIncome = new Decimal(user.incomeBalance.toString()).plus(user.totalWithdrawn.toString());

  // Format Directs for Direct Team View
  const formattedDirects = user.directs.map((d, index) => {
    const totalActiveUsdt = d.contracts.reduce(
      (acc, c) => acc + Number(c.amountInUsdt ?? c.amountInInr ?? 0),
      0
    );
    return {
      sr: index + 1,
      id: d.customId,
      name: d.fullName,
      referralId: user.customId,
      level: 1,
      date: new Date(d.createdAt).toISOString().split("T")[0],
      doa: totalActiveUsdt > 0 ? new Date(d.createdAt).toISOString().split("T")[0] : "-",
      activation: totalActiveUsdt > 0 ? "Active" : d.status === "ACTIVE" ? "Active" : "Inactive",
      amount: totalActiveUsdt,
    };
  });

  // Fetch Downline Team (Level 1 to 12)
  let currentLevelUserIds = user.directs.map((d) => d.id);
  const teamList: any[] = [...formattedDirects];

  for (let level = 2; level <= 12; level++) {
    if (currentLevelUserIds.length === 0) break;

    const nextLevelUsers = await db.user.findMany({
      where: { sponsorId: { in: currentLevelUserIds } },
      select: {
        id: true,
        customId: true,
        fullName: true,
        status: true,
        createdAt: true,
        sponsor: { select: { customId: true } },
        contracts: {
          where: { status: "ACTIVE" },
          select: { amountInUsdt: true, amountInInr: true },
        },
      },
    });

    if (nextLevelUsers.length === 0) break;

    for (const u of nextLevelUsers) {
      const totalActiveUsdt = u.contracts.reduce(
        (acc, c) => acc + Number(c.amountInUsdt ?? c.amountInInr ?? 0),
        0
      );
      teamList.push({
        sr: teamList.length + 1,
        id: u.customId,
        name: u.fullName,
        referralId: u.sponsor?.customId || "-",
        level: level,
        date: new Date(u.createdAt).toISOString().split("T")[0],
        doa: totalActiveUsdt > 0 ? new Date(u.createdAt).toISOString().split("T")[0] : "-",
        activation: totalActiveUsdt > 0 ? "Active" : u.status === "ACTIVE" ? "Active" : "Inactive",
        amount: totalActiveUsdt,
      });
    }

    currentLevelUserIds = nextLevelUsers.map((u) => u.id);
  }

  const systemConfig = await getAllSystemConfigs();

  return NextResponse.json({
    systemConfig,
    user: {
      id: user.id,
      customId: user.customId,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      status: user.status,
      usdtAddress: user.usdtAddress,
      fundBalance: user.fundBalance,
      incomeBalance: user.incomeBalance,
      fdLockedBalance: user.fdLockedBalance,
      totalWithdrawn: user.totalWithdrawn,
      directBusiness: user.directBusiness,
      sponsor: user.sponsor,
      createdAt: user.createdAt,
      basicPackageTotal: basicPackageTotal.toNumber(),
      fdPackageTotal: fdPackageTotal.toNumber(),
      totalIncome: totalIncome.toNumber(),
      directTeamCount: formattedDirects.length,
      totalTeamCount: teamList.length,
      directs: formattedDirects,
      teamList: teamList,
      contracts: user.contracts,
      deposits: user.deposits.map((d) => {
        const usdtVal = d.amountInUsdt != null ? Number(d.amountInUsdt.toString()) : (Number(d.amountInInr || 0) > 5000 ? Number(d.amountInInr) / 110 : Number(d.amountInInr || 0));
        return {
          ...d,
          amountUsdt: usdtVal,
          amountInUsdt: usdtVal,
        };
      }),
      withdrawals: user.withdrawals.map((w) => {
        const usdtVal = w.amountInUsdt != null ? Number(w.amountInUsdt.toString()) : (Number(w.amountInInr || 0) > 5000 ? Number(w.amountInInr) / 110 : Number(w.amountInInr || 0));
        return {
          ...w,
          amountUsdt: usdtVal,
          amountInUsdt: usdtVal,
        };
      }),
      ledgerEntries: user.ledgers,
      systemConfig,
    },
  });
}