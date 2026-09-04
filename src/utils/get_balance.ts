import xrpl from "xrpl";
import { XRPL_TESTNET } from "./config";

// funcionalidad de get_balance.ts → consultar XRP

export const getBalance = async (address: string): Promise<number> => {
  const client = new xrpl.Client(XRPL_TESTNET);
  try {
    await client.connect();
    const response = await client.request({
      command: "account_info",
      account: address,
      ledger_index: "validated",
    });
    const balanceDrops = response.result.account_data.Balance;
    return Number(balanceDrops) / 1_000_000;
  } catch (error) {
    console.error("❌ Error obteniendo balance:", error);
    throw error; // Re-lanzamos para que el llamador maneje
  } finally {
    try {
      await client.disconnect();
    } catch (e) {
      // ignorar
    }
  }
};
