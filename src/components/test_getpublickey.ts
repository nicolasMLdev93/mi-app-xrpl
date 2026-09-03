import xrpl from "xrpl";

const test_getpublickey = async (): Promise<string> => {
  // Crear cliente de XRPL para Testnet
  const client = new xrpl.Client("wss://s.altnet.rippletest.net:51233");
  // Crear wallet con clave publica y privada
  const wallet = xrpl.Wallet.generate();

  try {
    console.log("⏳ Conectando a Testnet...");
    await client.connect();
    console.log("✅ Conectado.");

    console.log("⏳ Generando wallet y fondeando...");
    const funded = await client.fundWallet(wallet);
    const address = funded.wallet.classicAddress;
    console.log("✅ Wallet generada. Dirección:", address);
    try {
      // Intentar guardar en sessionStorage
      sessionStorage.setItem("xrplPublicKey", address);
      // Verificar inmediatamente que se guardó correctamente
      const stored = sessionStorage.getItem("xrplPublicKey");
      if (stored === address) {
        console.log("✅ Guardado exitoso en sessionStorage.");
      } else {
        console.warn("⚠️ sessionStorage guardó pero al recuperar no coincide.");
        // Fallback a localStorage
        localStorage.setItem("xrplPublicKey", address);
        console.log("✅ Guardado en localStorage (fallback).");
      }
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
    const finalStored =
      sessionStorage.getItem("xrplPublicKey") ||
      localStorage.getItem("xrplPublicKey");
    console.log("📦 Valor final almacenado:", finalStored);

    if (!finalStored) {
      console.warn(
        "⚠️ No se pudo almacenar la dirección. La navegación podría fallar.",
      );
    }

    return address;
  } catch (error) {
    console.error("❌ Error crítico en test_getpublickey:", error);
    throw new Error("No se pudo generar la wallet en Testnet.", {
      cause: error,
    });
  } finally {
    client.disconnect().catch((disconnectError) => {
      console.warn("⚠️ Error al desconectar (ignorado):", disconnectError);
    });
    console.log("🔌 Desconexión iniciada.");
  }
};

export default test_getpublickey;
