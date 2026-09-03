import xrpl from "xrpl";

const test_getpublickey = async (): Promise<{
  address: string;
  funded: {
    wallet: xrpl.Wallet;
    balance: number;
  };
}> => {
  const client = new xrpl.Client("wss://s.altnet.rippletest.net:51233");
  const wallet = xrpl.Wallet.generate();

  try {
    console.log("⏳ Conectando a Testnet...");
    await client.connect();
    console.log("✅ Conectado.");

    console.log("⏳ Generando wallet y fondeando...");
    const funded = await client.fundWallet(wallet);
    const address = funded.wallet.classicAddress;

    // 📦 Guardar en sessionStorage para persistencia (solo Testnet)
    sessionStorage.setItem("xrplPublicKey", address);
    sessionStorage.setItem("xrplBalance", String(funded.balance));
    if (wallet.seed !== undefined) {
      sessionStorage.setItem("xrplSeed", wallet.seed); // ⚠️ solo para pruebas
    }

    console.log("✅ Wallet generada. Dirección:", address);
    console.log("💰 Fondos:", funded.balance, "XRP");

    return { address, funded: { ...funded, balance: Number(funded.balance) } };
  } catch (error) {
    console.error("❌ Error crítico en test_getpublickey:", error);
    throw new Error("No se pudo generar la wallet en Testnet.", { cause: error });
  } finally {
    await client.disconnect();
  }
};

export default test_getpublickey;