import xrpl from "xrpl";
import simulatedWallet from "../utils/simulated_wallet";
import { XRPL_TESTNET } from "./config";

type WalletInfo = {
  address: string;
  balance: number;
};

const test_getpublickey = async (): Promise<WalletInfo> => {
  const client = new xrpl.Client(XRPL_TESTNET);

  try {
    console.log("⏳ Conectando a Testnet...");

    await client.connect();

    console.log("✅ Conectado.");

    // -----------------------------------------
    // 1. Conectar wallet simulada
    // -----------------------------------------

    const address = await simulatedWallet.connect();

    console.log("👛 Address:", address);

    // -----------------------------------------
    // 2. Fondear XRP
    // -----------------------------------------

    const balance = await simulatedWallet.fund(client);

    console.log("💰 XRP:", balance);

    // -----------------------------------------
    // 3. Guardar dirección pública
    // -----------------------------------------

    sessionStorage.setItem("xrplPublicKey", address);

    return {
      address,
      balance,
    };
  } catch (error) {
    console.error("❌ Error en test_getpublickey:", error);

    throw new Error("No se pudo conectar o configurar la wallet.", {
      cause: error,
    });
  } finally {
    if (client.isConnected()) {
      await client.disconnect();

      console.log("🔌 Desconectado de Testnet.");
    }
  }
};

export default test_getpublickey;
