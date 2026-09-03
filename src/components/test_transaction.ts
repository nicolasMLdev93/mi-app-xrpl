import xrpl from "xrpl";

type TransactionInput = {
  address: string;
  amount: string; // en XRP (se convierte a drops)
  destination: string;
  wallet: xrpl.Wallet;
};

type TransactionResult = {
  success: boolean;
  hash?: string;
  error?: string;
  code?: string; // código de error de la red (ej: "tecNO_DST")
};

const test_transaction = async ({
  address,
  amount,
  destination,
  wallet,
}: TransactionInput): Promise<TransactionResult> => {
  // Validar dirección destino
  if (!xrpl.isValidAddress(destination)) {
    return { success: false, error: "Dirección destino inválida" };
  }

  // Convertir XRP a drops (1 XRP = 1_000_000 drops)
  const amountInDrops = String(Math.floor(Number(amount) * 1_000_000));
  if (isNaN(Number(amountInDrops)) || Number(amountInDrops) <= 0) {
    return { success: false, error: "Cantidad inválida" };
  }

  const client = new xrpl.Client("wss://s.altnet.rippletest.net:51233");

  try {
    await client.connect();

    // Preparar transacción
    const prepared = await client.autofill({
      TransactionType: "Payment",
      Account: address,
      Amount: amountInDrops,
      Destination: destination,
    });

    // Firmar
    const signed = wallet.sign(prepared);

    // Enviar y esperar validación
    const response = await client.submitAndWait(signed.tx_blob);

    // Extraer resultado de forma robusta
    const txResult = response.result?.engine_result || 
                     response.result?.meta?.TransactionResult;

    console.log("🔍 Respuesta completa:", JSON.stringify(response, null, 2));

    if (txResult === "tesSUCCESS") {
      console.log("✅ Transacción exitosa. Hash:", signed.hash);
      return { success: true, hash: signed.hash };
    } else {
      console.error("❌ Transacción fallida. Código:", txResult);
      return { 
        success: false, 
        error: `Falló con código: ${txResult || "desconocido"}`, 
        code: txResult 
      };
    }
  } catch (error: any) {
    console.error("❌ Error en la ejecución:", error);

    // Intentar extraer código de error del objeto de error (si existe)
    const errorCode = error?.data?.engine_result || 
                      error?.result?.engine_result ||
                      error?.message;

    return { 
      success: false, 
      error: error.message || "Error desconocido", 
      code: errorCode 
    };
  } finally {
    try {
      await client.disconnect();
      console.log("🔌 Conexión cerrada.");
    } catch {
      // ignorar
    }
  }
};

export default test_transaction;