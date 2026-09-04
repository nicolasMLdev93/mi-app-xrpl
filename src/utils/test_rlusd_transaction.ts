import xrpl from "xrpl";
import { RLUSD_ISSUER, RLUSD_CURRENCY, XRPL_TESTNET } from "./config";

type TransactionInput = {
  address: string;
  amount: string; // cantidad de RLUSD
  destination: string;

  signTransaction: (transaction: xrpl.Transaction) => Promise<{
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

const test_rlusd_transaction = async ({
  address,
  amount,
  destination,
  signTransaction,
}: TransactionInput): Promise<TransactionResult> => {
  // -----------------------------------------
  // 1. Validar dirección destino
  // -----------------------------------------

  if (!xrpl.isValidAddress(destination)) {
    return {
      success: false,
      error: "Dirección destino inválida",
    };
  }

  // -----------------------------------------
  // 2. Validar cantidad
  // -----------------------------------------

  const amountNumber = Number(amount);

  if (!Number.isFinite(amountNumber) || amountNumber <= 0) {
    return {
      success: false,
      error: "Cantidad de RLUSD inválida",
    };
  }

  // -----------------------------------------
  // 3. Crear conexión con XRPL Testnet
  // -----------------------------------------

  const client = new xrpl.Client(XRPL_TESTNET);

  try {
    console.log("⏳ Conectando a XRPL Testnet...");

    await client.connect();

    console.log("✅ Conectado a XRPL Testnet");

    // -----------------------------------------
    // 4. Crear Payment de RLUSD
    // -----------------------------------------

    const payment: xrpl.Payment = {
      TransactionType: "Payment",

      Account: address,

      Destination: destination,

      Amount: {
        currency: RLUSD_CURRENCY,
        issuer: RLUSD_ISSUER,
        value: amount,
      },
    };

    console.log("💵 Payment RLUSD:", JSON.stringify(payment, null, 2));

    // -----------------------------------------
    // 5. Autofill
    // -----------------------------------------

    const prepared = await client.autofill(payment);

    console.log("📦 Transacción preparada:", JSON.stringify(prepared, null, 2));

    // -----------------------------------------
    // 6. Firmar
    // -----------------------------------------

    const signed = await signTransaction(prepared);

    console.log("✍️ Transacción RLUSD firmada");

    console.log("🔐 Hash:", signed.hash);

    // -----------------------------------------
    // 7. Enviar a XRPL
    // -----------------------------------------

    const response = await client.submitAndWait(signed.tx_blob);

    console.log("🔍 Respuesta completa:", JSON.stringify(response, null, 2));

    // -----------------------------------------
    // 8. Obtener resultado de XRPL
    // -----------------------------------------

    const meta = response.result?.meta;

    const txResult =
      typeof meta === "object" && meta !== null && "TransactionResult" in meta
        ? (
            meta as {
              TransactionResult?: string;
            }
          ).TransactionResult
        : undefined;

    // -----------------------------------------
    // 9. Transacción exitosa
    // -----------------------------------------

    if (txResult === "tesSUCCESS") {
      console.log("✅ RLUSD enviado correctamente");

      console.log("🔐 Hash:", signed.hash);

      return {
        success: true,
        hash: signed.hash,
      };
    }

    // -----------------------------------------
    // 10. Transacción rechazada
    // -----------------------------------------

    console.error("❌ Transacción RLUSD fallida:", txResult);

    // Error amigable para fondos insuficientes
    if (txResult === "tecUNFUNDED_PAYMENT") {
      return {
        success: false,
        error: "Fondos insuficientes de RLUSD",
        code: txResult,
      };
    }

    // El destino no tiene Trust Line
    if (txResult === "tecPATH_DRY") {
      return {
        success: false,
        error:
          "El destinatario no puede recibir RLUSD. Verificá su Trust Line.",
        code: txResult,
      };
    }

    return {
      success: false,
      error: `Falló con código: ${txResult || "desconocido"}`,
      code: txResult,
    };
  } catch (error: any) {
    console.error("❌ Error enviando RLUSD:", error);

    const errorCode =
      error?.data?.engine_result ||
      error?.result?.engine_result ||
      error?.message;

    return {
      success: false,
      error: error?.message || "Error desconocido al enviar RLUSD",
      code: errorCode,
    };
  } finally {
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

export default test_rlusd_transaction;
