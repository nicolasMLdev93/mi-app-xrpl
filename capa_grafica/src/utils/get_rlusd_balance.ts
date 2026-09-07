import xrpl from "xrpl";

import { RLUSD_ISSUER, RLUSD_CURRENCY, XRPL_TESTNET } from "./config";

export const getRLUSDBalance = async (address: string): Promise<number> => {
  // =========================================
  // 1. VALIDAR ADDRESS
  // =========================================

  if (!xrpl.isValidAddress(address)) {
    console.error("❌ Dirección XRPL inválida:", address);

    return 0;
  }

  const client = new xrpl.Client(XRPL_TESTNET);

  try {
    console.log("⏳ Consultando balance RLUSD...");

    console.log("👛 Wallet:", address);

    // =========================================
    // 2. CONECTAR A TESTNET
    // =========================================

    await client.connect();

    console.log("✅ Conectado a XRPL Testnet");

    // =========================================
    // 3. CONSULTAR TRUST LINES
    // =========================================

    const response = await client.request({
      command: "account_lines",
      account: address,
      peer: RLUSD_ISSUER,
      ledger_index: "validated",
    });

    console.log("📊 Líneas de confianza:", response.result.lines);

    // =========================================
    // 4. BUSCAR RLUSD
    // =========================================

    const rlusdLine = response.result.lines.find(
      (line) => line.currency === RLUSD_CURRENCY || line.currency === "RLUSD",
    );

    // =========================================
    // 5. NO EXISTE TRUST LINE
    // =========================================

    if (!rlusdLine) {
      console.log("ℹ️ La wallet no tiene una Trust Line de RLUSD.");

      return 0;
    }

    console.log("💵 Línea RLUSD encontrada:", rlusdLine);

    // =========================================
    // 6. OBTENER BALANCE
    // =========================================

    const balance = Number(rlusdLine.balance);

    if (!Number.isFinite(balance)) {
      console.error("❌ Balance RLUSD inválido:", rlusdLine.balance);

      return 0;
    }

    console.log("💰 Balance RLUSD:", balance);

    return balance;
  } catch (error) {
    console.error("❌ Error consultando RLUSD:", error);

    return 0;
  } finally {
    // =========================================
    // 7. DESCONECTAR
    // =========================================

    try {
      if (client.isConnected()) {
        await client.disconnect();

        console.log("🔌 Conexión cerrada.");
      }
    } catch {
      console.log("⚠️ No se pudo cerrar la conexión.");
    }
  }
};
