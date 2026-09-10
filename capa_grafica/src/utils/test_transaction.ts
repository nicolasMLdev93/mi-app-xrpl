import xrpl from "xrpl";
import { XRPL_DEVNET } from "./config";

type TransactionInput = {
  address: string;
  amount: string;
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

const test_transaction = async ({
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
  // 2. VALIDAR DIRECCIÓN DESTINO
  // =========================================

  if (!xrpl.isValidAddress(destination)) {
    return {
      success: false,
      error: "Dirección destino inválida",
    };
  }

  // =========================================
  // 3. EVITAR ENVIAR A LA MISMA CUENTA
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
      error: "Cantidad de XRP inválida",
    };
  }

  // =========================================
  // 5. CONVERTIR XRP A DROPS
  // =========================================

  const amountInDrops = String(Math.floor(amountNumber * 1_000_000));

  if (Number(amountInDrops) <= 0) {
    return {
      success: false,
      error: "Cantidad de XRP inválida",
    };
  }

  console.log("💰 XRP:", amount);

  console.log("💧 Drops:", amountInDrops);

  // =========================================
  // 6. CREAR CLIENTE XRPL
  // =========================================

  const client = new xrpl.Client(XRPL_DEVNET);

  try {
    console.log("⏳ Conectando a XRPL Testnet...");

    await client.connect();

    console.log("✅ Conectado a XRPL Testnet");

    // =========================================
    // 7. CREAR PAYMENT
    // =========================================

    const payment: xrpl.Payment = {
      TransactionType: "Payment",

      Account: address,

      Amount: amountInDrops,

      Destination: destination,
    };

    console.log("📦 Payment XRP:", JSON.stringify(payment, null, 2));

    // =========================================
    // 8. AUTOFILL
    // =========================================

    const prepared = await client.autofill(payment);
    console.log("📦 Transacción preparada:", JSON.stringify(prepared, null, 2));

    // =========================================
    // 9. FIRMAR
    // =========================================

    console.log("✍️ Firmando transacción...");

    const signed = await signTransaction(prepared);

    console.log("✅ Transacción firmada");

    console.log("🔐 Hash:", signed.hash);

    // =========================================
    // 10. ENVIAR A XRPL
    // =========================================

    console.log("📡 Enviando Payment a XRPL...");

    const response = await client.submitAndWait(signed.tx_blob);

    console.log("🔍 Respuesta completa:", JSON.stringify(response, null, 2));

    // =========================================
    // 11. OBTENER RESULTADO
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
    // 12. TRANSACCIÓN EXITOSA
    // =========================================

    if (txResult === "tesSUCCESS") {
      console.log("=================================");

      console.log("✅ XRP ENVIADO CORRECTAMENTE");

      console.log("=================================");

      console.log("💰 Cantidad:", amount, "XRP");

      console.log("👛 Desde:", address);

      console.log("👛 Hacia:", destination);

      console.log("🔐 Hash:", signed.hash);

      return {
        success: true,
        hash: signed.hash,
      };
    }

    // =========================================
    // 13. ERROR
    // =========================================

    console.error("❌ Transacción fallida:", txResult);

    // Fondos insuficientes
    if (txResult === "tecUNFUNDED_PAYMENT") {
      return {
        success: false,
        error: "Fondos insuficientes de XRP",
        code: txResult,
      };
    }

    return {
      success: false,

      error: `Falló con código: ${txResult || "desconocido"}`,

      code: txResult,
    };
  } catch (error: any) {
    // =========================================
    // 14. ERROR GENERAL
    // =========================================

    console.error("❌ Error en la ejecución:", error);

    const errorCode =
      error?.data?.engine_result || error?.result?.engine_result || error?.code;

    return {
      success: false,

      error: error?.message || "Error desconocido",

      code: errorCode,
    };
  } finally {
    // =========================================
    // 15. CERRAR CONEXIÓN
    // =========================================

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

export default test_transaction;
