// src/utils/getXamanWallets.ts
import xrpl from "xrpl";
import simulatedWallet from "./simulated_wallet";
import { XRPL_TESTNET } from "../utils/config";

type XamanWallet = {
  address: string;
  name?: string;
};

export const getXamanWallets = async (): Promise<XamanWallet[]> => {
  const client = new xrpl.Client(XRPL_TESTNET);

  try {
    console.log("⏳ Conectando a XRPL Testnet...");
    await client.connect();
    console.log("✅ Conectado.");

    const address = await simulatedWallet.connect();
    console.log("👛 Address obtenido:", address);

    const balance = await simulatedWallet.fund(client);
    console.log("💰 Balance fondeado:", balance, "XRP");

    const secondWallet = xrpl.Wallet.generate();
    try {
      await client.fundWallet(secondWallet);
      console.log("💰 Segunda wallet fondeada.");
    } catch (e) {
      console.warn("No se pudo fondear la segunda wallet.");
    }

    const wallets: XamanWallet[] = [
      { address, name: "Wallet Principal (Xaman)" },
      { address: secondWallet.classicAddress, name: "Wallet Secundaria (Xaman)" },
    ];

    console.log("✅ Wallets obtenidas de Xaman:", wallets);
    return wallets;
  } catch (error) {
    console.error("❌ Error al conectar con Xaman:", error);
    throw error;
  } finally {
    if (client.isConnected()) {
      await client.disconnect();
      console.log("🔌 Desconectado de Testnet.");
    }
  }
};