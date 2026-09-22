import { getBscRpcEndpoints } from "./config";

export interface RpcLog {
  address: string;
  topics: string[];
  data: string;
  blockNumber: string; // hex
  transactionHash: string;
  transactionIndex: string; // hex
  blockHash: string;
  logIndex: string; // hex
  removed?: boolean;
}

export interface RpcReceipt {
  transactionHash: string;
  transactionIndex: string;
  blockHash: string;
  blockNumber: string; // hex
  from: string;
  to: string | null;
  status: string; // "0x1" for success, "0x0" for failure
  logs: RpcLog[];
}

export interface RpcTransaction {
  hash: string;
  blockHash: string | null;
  blockNumber: string | null;
  from: string;
  to: string | null;
  value: string;
  gas: string;
  gasPrice: string;
}

export interface RpcBlock {
  number: string;
  hash: string;
  timestamp: string;
}

export class BlockchainProvider {
  private rpcUrls: string[] = [];
  private currentUrlIndex = 0;

  constructor(rpcUrls?: string[]) {
    if (rpcUrls && rpcUrls.length > 0) {
      this.rpcUrls = rpcUrls;
    }
  }

  private async ensureUrls(): Promise<string[]> {
    if (this.rpcUrls.length === 0) {
      this.rpcUrls = await getBscRpcEndpoints();
    }
    return this.rpcUrls;
  }

  public async call<T = any>(method: string, params: any[] = []): Promise<T> {
    const urls = await this.ensureUrls();
    let lastError: any = null;

    // Attempt through available RPCs with failover
    for (let attempt = 0; attempt < urls.length; attempt++) {
      const url = urls[(this.currentUrlIndex + attempt) % urls.length];
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 9000);

        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            jsonrpc: "2.0",
            id: Date.now() + Math.floor(Math.random() * 1000),
            method,
            params,
          }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        }

        const json = await res.json();
        if (json.error) {
          throw new Error(`RPC Error [${json.error.code}]: ${json.error.message}`);
        }

        // Cache working RPC index on success
        this.currentUrlIndex = (this.currentUrlIndex + attempt) % urls.length;
        return json.result as T;
      } catch (err: any) {
        lastError = err;
        // Proceed to next fallback URL
      }
    }

    throw new Error(`All BSC RPC endpoints failed. Last error: ${lastError?.message || String(lastError)}`);
  }

  public async getLatestBlockNumber(): Promise<bigint> {
    const hex = await this.call<string>("eth_blockNumber", []);
    return BigInt(hex);
  }

  public async getLogs(filter: {
    fromBlock: string | bigint | number;
    toBlock: string | bigint | number;
    address?: string;
    topics?: (string | string[] | null)[];
  }): Promise<RpcLog[]> {
    const from = typeof filter.fromBlock === "bigint" ? `0x${filter.fromBlock.toString(16)}` : filter.fromBlock;
    const to = typeof filter.toBlock === "bigint" ? `0x${filter.toBlock.toString(16)}` : filter.toBlock;

    const payload: Record<string, any> = {
      fromBlock: from,
      toBlock: to,
    };
    if (filter.address) {
      payload.address = filter.address.toLowerCase();
    }
    if (filter.topics) {
      payload.topics = filter.topics;
    }

    return await this.call<RpcLog[]>("eth_getLogs", [payload]);
  }

  public async getTransactionReceipt(txHash: string): Promise<RpcReceipt | null> {
    const cleanHash = txHash.trim();
    return await this.call<RpcReceipt | null>("eth_getTransactionReceipt", [cleanHash]);
  }

  public async getTransaction(txHash: string): Promise<RpcTransaction | null> {
    const cleanHash = txHash.trim();
    return await this.call<RpcTransaction | null>("eth_getTransactionByHash", [cleanHash]);
  }

  public async getBlock(blockNumber: bigint): Promise<RpcBlock | null> {
    const hex = `0x${blockNumber.toString(16)}`;
    return await this.call<RpcBlock | null>("eth_getBlockByNumber", [hex, false]);
  }

  public async checkHealth(): Promise<{ connected: boolean; currentBlock: bigint; rpcUrl: string; error?: string }> {
    try {
      const urls = await this.ensureUrls();
      const currentRpc = urls[this.currentUrlIndex] || urls[0];
      const block = await this.getLatestBlockNumber();
      return { connected: true, currentBlock: block, rpcUrl: currentRpc };
    } catch (err: any) {
      return { connected: false, currentBlock: BigInt(0), rpcUrl: "FAILED", error: err.message };
    }
  }
}

export const defaultBlockchainProvider = new BlockchainProvider();
