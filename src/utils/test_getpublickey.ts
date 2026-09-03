import xrpl from "xrpl";
import simulatedWallet from "../utils/simulated_wallet";

type WalletInfo = {
  address: string;
  balance: number;
};

const test_getpublickey = async (): Promise<WalletInfo> => {
  const client = new xrpl.Client(
    "wss://s.altnet.rippletest.net:51233"
  );

  try {
    console.log("⏳ Conectando a Testnet...");

    await client.connect();

    console.log("✅ Conectado.");

    // Generamos/conectamos la wallet simulada
    const address = await simulatedWallet.connect();

    console.log("👛 Address:", address);

    // Fondeamos la wallet con el faucet
    const balance = await simulatedWallet.fund(client);

    console.log("💰 Balance:", balance, "XRP");

    // Guardamos SOLO la dirección pública
    sessionStorage.setItem("xrplPublicKey", address);

    return {
      address,
      balance,
    };
  } catch (error) {
    console.error("❌ Error en test_getpublickey:", error);

    throw new Error(
      "No se pudo conectar la wallet simulada.",
      { cause: error }
    );
  } finally {
    if (client.isConnected()) {
      await client.disconnect();
      console.log("🔌 Desconectado de Testnet.");
    }
  }
};

export default test_getpublickey;