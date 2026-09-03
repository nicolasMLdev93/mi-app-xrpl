import xrpl from "xrpl";

const test_getpublickey = async (): Promise<{
  address: string;
  funded: {
    wallet: xrpl.Wallet; // La misma wallet que pasaste, pero ahora con fondos
    balance: number; // El balance en formato texto (ej: "100")
  };
}> => {
  // Crear cliente de XRPL para Testnet
  const client = new xrpl.Client("wss://s.altnet.rippletest.net:51233");
  // Crear wallet con clave publica y privada
  const wallet = xrpl.Wallet.generate();

  try {
    console.log("⏳ Conectando a Testnet...");
    await client.connect();
    console.log("✅ Conectado.");
    console.log("⏳ Generando wallet y fondeando...");
    // wallet ya fondeada //
    const funded = await client.fundWallet(wallet);
    const address = funded.wallet.classicAddress;
    // fondos de la cuenta fondeada
    console.log("✅ Wallet generada. Dirección:", address);
    try {
      // Intentar guardar en sessionStorage
      sessionStorage.setItem("xrplPublicKey", address);
    } catch (sessionError) {
      console.error("❌ Error al guardar en sessionStorage:", sessionError);
      // Si sessionStorage falla, intentamos localStorage
      try {
        localStorage.setItem("xrplPublicKey", address);
        console.log("✅ Guardado en localStorage (fallback por error).");
      } catch (localError) {
        console.error(
          "❌ No se pudo guardar en ningún almacenamiento:",
          localError,
        );
      }
    }
    await client.disconnect();
    return { address, funded: { ...funded, balance: Number(funded.balance) } };
  } catch (error) {
    console.error("❌ Error crítico en test_getpublickey:", error);
    throw new Error("No se pudo generar la wallet en Testnet.", {
      cause: error,
    });
  }
};

export default test_getpublickey;
