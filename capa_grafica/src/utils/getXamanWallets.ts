// src/utils/getXamanWallets.ts
import xrpl from "xrpl";
import simulatedWallet from "./simulated_wallet";
import { XRPL_DEVNET } from "../utils/config";

type XamanWallet = {
  address: string;
  name?: string;
};

export const getXamanWallets = async (): Promise<XamanWallet[]> => {
  const client = new xrpl.Client(XRPL_DEVNET);

  try {
    console.log("⏳ Conectando a XRPL DEXRPL_DEVNET...");
    await client.connect();
    console.log("✅ Conectado.");

    const address = await simulatedWallet.connect();
    console.log("👛 Address obtenido:", address);

    const balance = await simulatedWallet.fund(client);
    console.log("💰 Balance fondeado:", balance, "XRP");

    const wallets: XamanWallet[] = [
      { address, name: "Wallet Principal (Xaman)" },
    ];

    console.log("✅ Wallet obtenida de Xaman:", wallets);
    return wallets;
  } catch (error) {
    console.error("❌ Error al conectar con Xaman:", error);
    return [];
  } finally {
    if (client.isConnected()) {
      await client.disconnect();
      console.log("🔌 Desconectado de DEXRPL_DEVNET.");
    }
  }
};
