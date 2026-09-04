import xrpl from "xrpl";
import {
  RLUSD_ISSUER,
  RLUSD_CURRENCY,
  XRPL_TESTNET
} from "./config";

export const getRLUSDBalance = async (address: string): Promise<number> => {
  const client = new xrpl.Client(XRPL_TESTNET);

  try {
    console.log("⏳ Consultando balance RLUSD...");
    console.log("👛 Wallet:", address);

    await client.connect();

    const response = await client.request({
      command: "account_lines",
      account: address,
      peer: RLUSD_ISSUER,
      ledger_index: "validated",
    });

    console.log("📊 Líneas de confianza:", response.result.lines);

    const rlusdLine = response.result.lines.find(
      (line) => line.currency === RLUSD_CURRENCY || line.currency === "RLUSD",
    );

    if (!rlusdLine) {
      console.log("ℹ️ La wallet no tiene una Trust Line de RLUSD.");

      return 0;
    }

    console.log("💵 Línea RLUSD encontrada:", rlusdLine);

    const balance = Number(rlusdLine.balance);

    if (!Number.isFinite(balance)) {
      return 0;
    }

    return balance;
  } catch (error) {
    console.error("❌ Error consultando RLUSD:", error);

    return 0;
  } finally {
    if (client.isConnected()) {
      await client.disconnect();
    }
  }
};
