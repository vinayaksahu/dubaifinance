import "dotenv/config";
import { runBlockchainScan } from "../src/lib/blockchain/monitor";
import { defaultBlockchainProvider } from "../src/lib/blockchain/provider";

const POLL_INTERVAL_MS = 15000; // 15 seconds

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function startWorker() {
  console.log("==========================================================");
  console.log("  DUBAI FINANCE — SELF-HOSTED BSC BLOCKCHAIN MONITOR");
  console.log("  Asset: USDT (BEP-20) on BNB Smart Chain");
  console.log("==========================================================");

  let isRunning = true;

  process.on("SIGINT", () => {
    console.log("\n[Monitor Worker] Received SIGINT. Gracefully shutting down...");
    isRunning = false;
  });

  process.on("SIGTERM", () => {
    console.log("\n[Monitor Worker] Received SIGTERM. Gracefully shutting down...");
    isRunning = false;
  });

  // Initial health check
  const health = await defaultBlockchainProvider.checkHealth();
  console.log(`[Health] Connected: ${health.connected} | Current BSC Block: ${health.currentBlock} | RPC: ${health.rpcUrl}`);

  while (isRunning) {
    try {
      const start = Date.now();
      const result = await runBlockchainScan();
      const elapsed = Date.now() - start;

      if (result.success) {
        if (result.detectedCount > 0 || result.creditedCount > 0 || result.pendingReviewCount > 0) {
          console.log(
            `[${new Date().toISOString()}] Scan (${result.fromBlock} -> ${result.toBlock}): ` +
            `Detected: ${result.detectedCount} | Credited: ${result.creditedCount} | PendingReview: ${result.pendingReviewCount} (${elapsed}ms)`
          );
        }
      } else {
        console.warn(`[${new Date().toISOString()}] Scan warning: ${result.error}`);
      }
    } catch (err: any) {
      console.error(`[${new Date().toISOString()}] Scan loop error:`, err.message || err);
    }

    await sleep(POLL_INTERVAL_MS);
  }

  console.log("[Monitor Worker] Worker terminated cleanly.");
  process.exit(0);
}

startWorker().catch((err) => {
  console.error("Fatal worker error:", err);
  process.exit(1);
});
