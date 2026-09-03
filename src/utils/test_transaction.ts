import xrpl from "xrpl";

type TransactionInput = {
  address: string;
  amount: string; // en XRP
  destination: string;

  // Función que será proporcionada por la wallet externa
  signTransaction: (
    transaction: xrpl.Payment
  ) => Promise<{
    tx_blob: string;
    hash: string;
  }>;
};

type TransactionResult = {
  success: boolean;
  hash?: string;
  error?: string;
  code?: string;
};

const test_transaction = async ({
  address,
  amount,
  destination,
  signTransaction,
}: TransactionInput): Promise<TransactionResult> => {

  // Validar dirección destino
  if (!xrpl.isValidAddress(destination)) {
    return {
      success: false,
      error: "Dirección destino inválida",
    };
  }

  // Convertir XRP a drops
  const amountInDrops = String(
    Math.floor(Number(amount) * 1_000_000)
  );

  if (
    isNaN(Number(amountInDrops)) ||
    Number(amountInDrops) <= 0
  ) {
    return {
      success: false,
      error: "Cantidad inválida",
    };
  }

  const client = new xrpl.Client(
    "wss://s.altnet.rippletest.net:51233"
  );

  try {
    await client.connect();

    // Preparar la transacción
    const prepared = await client.autofill({
      TransactionType: "Payment",
      Account: address,
      Amount: amountInDrops,
      Destination: destination,
    });

    console.log("📦 Transacción preparada:", prepared);

    /*
     * IMPORTANTE:
     *
     * Acá NO usamos wallet.sign().
     *
     * La transacción se envía a la wallet externa
     * para que el usuario la firme.
     */
    const signed = await signTransaction(prepared);

    console.log("✍️ Transacción firmada");

    // Enviar la transacción firmada a XRPL
    const response = await client.submitAndWait(
      signed.tx_blob
    );

    const meta = response.result?.meta;

    const txResult =
      response.result?.engine_result ||
      (
        typeof meta === "object" &&
        meta !== null &&
        "TransactionResult" in meta
          ? (
              meta as {
                TransactionResult?: string;
              }
            ).TransactionResult
          : undefined
      );

    console.log(
      "🔍 Respuesta completa:",
      JSON.stringify(response, null, 2)
    );

    if (txResult === "tesSUCCESS") {
      console.log(
        "✅ Transacción exitosa. Hash:",
        signed.hash
      );

      return {
        success: true,
        hash: signed.hash,
      };
    }

    console.error(
      "❌ Transacción fallida. Código:",
      txResult
    );

    return {
      success: false,
      error: `Falló con código: ${
        txResult || "desconocido"
      }`,
      code: txResult,
    };

  } catch (error: any) {
    console.error(
      "❌ Error en la ejecución:",
      error
    );

    const errorCode =
      error?.data?.engine_result ||
      error?.result?.engine_result ||
      error?.message;

    return {
      success: false,
      error:
        error?.message ||
        "Error desconocido",
      code: errorCode,
    };

  } finally {
    try {
      await client.disconnect();
      console.log("🔌 Conexión cerrada.");
    } catch {
      // Ignorar error al cerrar conexión
    }
  }
};

export default test_transaction;