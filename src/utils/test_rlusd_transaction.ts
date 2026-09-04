import xrpl from "xrpl";
import { RLUSD_ISSUER, RLUSD_CURRENCY, XRPL_TESTNET } from "./config";

type TransactionInput = {
  address: string;
  amount: string; // cantidad de RLUSD
  destination: string;

  // Función proporcionada por la wallet para firmar
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
  // =========================================
  // 1. VALIDAR DIRECCIÓN DEL EMISOR
  // =========================================

  if (!xrpl.isValidAddress(address)) {
    return {
      success: false,
      error: "Dirección del emisor inválida",
    };
  }

  // =========================================
  // 2. VALIDAR DIRECCIÓN DEL DESTINO
  // =========================================

  if (!xrpl.isValidAddress(destination)) {
    return {
      success: false,
      error: "Dirección destino inválida",
    };
  }

  // =========================================
  // 3. EVITAR ENVIAR RLUSD AL MISMO ADDRESS
  // =========================================

  if (address === destination) {
    return {
      success: false,
      error: "La dirección destino no puede ser la misma que la del emisor",
    };
  }

  // =========================================
  // 4. VALIDAR CANTIDAD
  // =========================================

  const amountNumber = Number(amount);

  if (!Number.isFinite(amountNumber) || amountNumber <= 0) {
    return {
      success: false,
      error: "Cantidad de RLUSD inválida",
    };
  }

  // Evitar problemas con cantidades excesivamente pequeñas
  // o con demasiados decimales.
  if (!/^\d+(\.\d+)?$/.test(amount)) {
    return {
      success: false,
      error: "La cantidad de RLUSD tiene un formato inválido",
    };
  }

  // =========================================
  // 5. CREAR CLIENTE XRPL
  // =========================================

  const client = new xrpl.Client(XRPL_TESTNET);

  try {
    console.log("⏳ Conectando a XRPL Testnet...");

    await client.connect();

    console.log("✅ Conectado a XRPL Testnet");

    // =========================================
    // 6. CREAR PAYMENT RLUSD
    // =========================================

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

    console.log("💵 Payment RLUSD:");

    console.log(JSON.stringify(payment, null, 2));

    // =========================================
    // 7. AUTOFILL
    // =========================================

    const prepared = await client.autofill(payment);

    console.log("📦 Transacción preparada:");

    console.log(JSON.stringify(prepared, null, 2));

    // =========================================
    // 8. FIRMAR
    // =========================================

    console.log("✍️ Firmando Payment RLUSD...");

    const signed = await signTransaction(prepared);

    console.log("✅ Payment RLUSD firmado");

    console.log("🔐 Hash:", signed.hash);

    // =========================================
    // 9. ENVIAR A XRPL
    // =========================================

    console.log("📡 Enviando Payment a XRPL...");

    const response = await client.submitAndWait(signed.tx_blob);

    console.log("🔍 Respuesta completa:");

    console.log(JSON.stringify(response, null, 2));

    // =========================================
    // 10. OBTENER RESULTADO
    // =========================================

    const meta = response.result?.meta;

    const txResult =
      typeof meta === "object" && meta !== null && "TransactionResult" in meta
        ? (
            meta as {
              TransactionResult?: string;
            }
          ).TransactionResult
        : undefined;

    console.log("📊 Resultado XRPL:", txResult);

    // =========================================
    // 11. TRANSACCIÓN EXITOSA
    // =========================================

    if (txResult === "tesSUCCESS") {
      console.log("====================================");

      console.log("✅ RLUSD ENVIADO CORRECTAMENTE");

      console.log("====================================");

      console.log("💵 Cantidad:", amount, "RLUSD");

      console.log("👛 Desde:", address);

      console.log("👛 Hacia:", destination);

      console.log("🔐 Hash:", signed.hash);

      return {
        success: true,
        hash: signed.hash,
      };
    }

    // =========================================
    // 12. FONDOS INSUFICIENTES
    // =========================================

    if (txResult === "tecUNFUNDED_PAYMENT") {
      console.error("⚠️ Fondos insuficientes para realizar el Payment");

      return {
        success: false,
        error:
          "Fondos insuficientes de RLUSD o la cuenta no puede realizar este Payment.",
        code: txResult,
      };
    }

    // =========================================
    // 13. DESTINO SIN TRUST LINE / RUTA SECA
    // =========================================

    if (txResult === "tecPATH_DRY") {
      console.error("⚠️ No existe una ruta válida para el Payment");

      return {
        success: false,
        error:
          "El destinatario no puede recibir RLUSD. Verificá que tenga una Trust Line para este RLUSD.",
        code: txResult,
      };
    }

    // =========================================
    // 14. DESTINO NO PUEDE RECIBIR EL TOKEN
    // =========================================

    if (txResult === "tecNO_DST") {
      return {
        success: false,
        error: "La cuenta destino no existe en el ledger.",
        code: txResult,
      };
    }

    // =========================================
    // 15. ERROR GENÉRICO DE XRPL
    // =========================================

    console.error("❌ Payment RLUSD rechazado:", txResult);

    return {
      success: false,

      error: `Falló con código: ${txResult || "desconocido"}`,

      code: txResult,
    };
  } catch (error: any) {
    // =========================================
    // 16. ERROR DE EJECUCIÓN
    // =========================================

    console.error("❌ Error enviando RLUSD:", error);

    const errorCode =
      error?.data?.engine_result || error?.result?.engine_result || error?.code;

    return {
      success: false,

      error: error?.message || "Error desconocido al enviar RLUSD",

      code: errorCode,
    };
  } finally {
    // =========================================
    // 17. CERRAR CONEXIÓN
    // =========================================

    try {
      if (client.isConnected()) {
        await client.disconnect();

        console.log("🔌 Conexión XRPL cerrada.");
      }
    } catch {
      // Ignorar error al cerrar conexión
    }
  }
};

export default test_rlusd_transaction;
