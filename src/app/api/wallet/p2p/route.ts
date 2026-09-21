import { NextRequest, NextResponse } from "next/server";
import { getSession, comparePin } from "@/lib/auth";
import { db } from "@/lib/db";
import { executeLedgerTransaction } from "@/lib/ledger";
import { verifyOtp } from "@/lib/mail";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { recordActivity } from "@/lib/auditLogger";
import { sanitizeIdentifier } from "@/lib/sanitize";
import Decimal from "decimal.js";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Rate limit: 8 P2P transfers per 5 minutes
    const rateLimitRes = await checkRateLimit({
      key: `p2p_usr:${session.userId}`,
      limit: 8,
      windowSeconds: 300,
    });
    if (!rateLimitRes.success) {
      return NextResponse.json(
        { error: "Too many transfer attempts. Please wait a few minutes before trying again." },
        { status: 429 }
      );
    }

    const { recipientCustomId, amountInInr, amountInUsdt, amount, transactionPin, otp } = await req.json();
    const cleanRecipientId = sanitizeIdentifier(recipientCustomId || "", "").toUpperCase();
    const rawAmount = amountInUsdt ?? amount ?? amountInInr;
    const verificationCode = (otp || transactionPin || "").trim();

    if (!cleanRecipientId || !rawAmount || !verificationCode) {
      return NextResponse.json({ error: "Recipient ID, Amount, and Security OTP / PIN are required." }, { status: 400 });
    }

    let parsedUsdt = Number(rawAmount);
    if (!amountInUsdt && !amount && Number(amountInInr) > 5000) {
      parsedUsdt = Number(amountInInr) / 110;
    }

    // Strict boundary & negative balance exploit prevention
    if (!Number.isFinite(parsedUsdt) || isNaN(parsedUsdt) || parsedUsdt <= 0) {
      return NextResponse.json({ error: "Please enter a valid positive transfer amount." }, { status: 400 });
    }

    const sender = await db.user.findUnique({
      where: { id: session.userId },
      select: { id: true, customId: true, email: true, transactionPin: true, fundBalance: true, adminId: true, role: true },
    });

    if (!sender) {
      return NextResponse.json({ error: "Sender account not found." }, { status: 404 });
    }

    let isAuthorized = false;
    if (verificationCode) {
      isAuthorized = await verifyOtp(sender.email, verificationCode, "TRANSACTION");
      if (!isAuthorized && sender.transactionPin) {
        isAuthorized = await comparePin(verificationCode, sender.transactionPin);
      }
    }

    if (!isAuthorized) {
      return NextResponse.json({ error: "Invalid or expired Security OTP code." }, { status: 401 });
    }

    if (sender.customId.toUpperCase() === cleanRecipientId) {
      return NextResponse.json({ error: "Cannot transfer funds to yourself." }, { status: 400 });
    }

    const recipient = await db.user.findUnique({
      where: { customId: cleanRecipientId },
      select: { id: true, customId: true, fullName: true, adminId: true },
    });

    if (!recipient) {
      return NextResponse.json({ error: `Recipient with ID ${cleanRecipientId} not found.` }, { status: 404 });
    }

    if (sender.role !== "SUPER_ROOT_ADMIN" && sender.adminId && recipient.adminId && sender.adminId !== recipient.adminId) {
      return NextResponse.json({ error: `Recipient with ID ${cleanRecipientId} not found.` }, { status: 404 });
    }

    const amountUsdtDec = new Decimal(parsedUsdt.toString());

    const senderFund = new Decimal(sender.fundBalance.toString());
    if (senderFund.lessThan(amountUsdtDec)) {
      return NextResponse.json({ error: "Insufficient Fund Wallet balance." }, { status: 400 });
    }

    const refBase = `P2P_${sender.id}_TO_${recipient.id}_${Date.now()}`;

    // Debit Sender Fund
    await executeLedgerTransaction({
      userId: sender.id,
      type: "P2P_SENT",
      wallet: "FUND",
      amount: amountUsdtDec.negated(),
      referenceKey: `${refBase}_DEBIT`,
      description: `P2P Transfer of $${amountUsdtDec.toFixed(2)} USDT to ${recipient.customId} (${recipient.fullName})`,
      sourceUserId: recipient.id,
    });

    // Credit Recipient Fund
    await executeLedgerTransaction({
      userId: recipient.id,
      type: "P2P_RECEIVED",
      wallet: "FUND",
      amount: amountUsdtDec,
      referenceKey: `${refBase}_CREDIT`,
      description: `P2P Received $${amountUsdtDec.toFixed(2)} USDT from ${sender.customId}`,
      sourceUserId: sender.id,
    });

    await recordActivity({
      userId: sender.id,
      action: "P2P_TRANSFER_SENT",
      category: "FINANCIAL",
      description: `Sent $${amountUsdtDec.toFixed(2)} USDT via P2P to ${recipient.customId} (${recipient.fullName})`,
      req,
      metadata: { recipientCustomId: recipient.customId, amount: amountUsdtDec.toNumber() },
    });

    return NextResponse.json({
      success: true,
      message: `P2P Transfer of $${amountUsdtDec.toFixed(2)} USDT to ${recipient.fullName} (${recipient.customId}) completed!`,
    });
  } catch (error: any) {
    console.error("P2P error:", error);
    return NextResponse.json({ error: error.message || "Failed to complete P2P transfer." }, { status: 500 });
  }
}