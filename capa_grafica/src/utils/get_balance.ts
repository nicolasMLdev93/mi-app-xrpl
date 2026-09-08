import xrpl from "xrpl";
import { XRPL_TESTNET } from "./config";

// =========================================
// Funcionalidad:
// Consultar balance de XRP de una wallet
// =========================================

export const getBalance = async (address: string): Promise<number> => {
  // =========================================
  // 1. VALIDAR DIRECCIÓN
  // =========================================

  if (!xrpl.isValidAddress(address)) {
    throw new Error("Dirección XRPL inválida.");
  }

  const client = new xrpl.Client(XRPL_TESTNET);

  try {
    // =========================================
    // 2. CONECTAR A XRPL TESTNET
    // =========================================

    console.log("⏳ Consultando balance XRP...");

    await client.connect();

    console.log("✅ Conectado a XRPL Testnet");

    // =========================================
    // 3. CONSULTAR ACCOUNT_INFO
    // =========================================

    const response = await client.request({
      command: "account_info",
      account: address,
      ledger_index: "validated",
    });

    // =========================================
    // 4. OBTENER BALANCE EN DROPS
    // =========================================

    const balanceDrops = response.result.account_data.Balance;

    console.log("💧 Balance en drops:", balanceDrops);

    // =========================================
    // 5. CONVERTIR DROPS → XRP
    // =========================================

    const balanceXRP = Number(balanceDrops) / 1_000_000;

    console.log("💰 Balance XRP:", balanceXRP);

    return balanceXRP;
  } catch (error) {
    console.error("❌ Error obteniendo balance XRP:", error);

    throw error;
  } finally {
    // =========================================
    // 6. DESCONECTAR
    // =========================================

    try {
      if (client.isConnected()) {
        await client.disconnect();

        console.log("🔌 Conexión cerrada.");
      }
    } catch {
      // Ignorar error al cerrar conexión
    }
  }
};
