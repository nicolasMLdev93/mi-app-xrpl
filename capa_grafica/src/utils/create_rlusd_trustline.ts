import xrpl from "xrpl";
import { RLUSD_ISSUER, RLUSD_CURRENCY, XRPL_DEVNET } from "./config";

type TrustLineResult = {
  success: boolean;
  hash?: string;
  error?: string;
  code?: string;
};

const createRLUSDTrustline = async (
  address: string,
  signTransaction: (transaction: xrpl.Transaction) => Promise<{
    tx_blob: string;
    hash: string;
  }>,
): Promise<TrustLineResult> => {
  // -----------------------------------------
  // 1. Validar dirección
  // -----------------------------------------

  if (!xrpl.isValidAddress(address)) {
    return {
      success: false,
      error: "Dirección de wallet inválida",
    };
  }

  const client = new xrpl.Client(XRPL_DEVNET);

  try {
    console.log("⏳ Conectando a XRPL DEXRPL_DEVNET...");

    await client.connect();

    console.log("✅ Conectado a XRPL DEXRPL_DEVNET");

    // -----------------------------------------
    // 2. Crear TrustSet
    // -----------------------------------------

    const trustSet: xrpl.TrustSet = {
      TransactionType: "TrustSet",

      Account: address,

      LimitAmount: {
        currency: RLUSD_CURRENCY,
        issuer: RLUSD_ISSUER,
        value: "1000000",
      },
    };

    console.log("🔗 Creando Trust Line RLUSD...");

    console.log("📦 TrustSet:", JSON.stringify(trustSet, null, 2));

    // -----------------------------------------
    // 3. Autofill
    // -----------------------------------------

    const prepared = await client.autofill(trustSet);

    console.log("📦 TrustSet preparada:", JSON.stringify(prepared, null, 2));

    // -----------------------------------------
    // 4. Firmar
    // -----------------------------------------

    const signed = await signTransaction(prepared);

    console.log("✍️ TrustSet firmada");

    console.log("🔐 Hash:", signed.hash);

    // -----------------------------------------
    // 5. Enviar a XRPL
    // -----------------------------------------

    const response = await client.submitAndWait(signed.tx_blob);

    console.log("🔍 Respuesta:", JSON.stringify(response, null, 2));

    // -----------------------------------------
    // 6. Obtener resultado
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
    // 7. Trust Line creada
    // -----------------------------------------

    if (txResult === "tesSUCCESS") {
      console.log("✅ Trust Line RLUSD creada correctamente");

      console.log("🔐 Hash:", signed.hash);

      return {
        success: true,
        hash: signed.hash,
      };
    }

    // -----------------------------------------
    // 8. Error
    // -----------------------------------------

    console.error("❌ Error creando Trust Line:", txResult);

    return {
      success: false,
      error: `Falló con código: ${txResult || "desconocido"}`,
      code: txResult,
    };
  } catch (error: any) {
    console.error("❌ Error creando Trust Line:", error);

    const errorCode =
      error?.data?.engine_result ||
      error?.result?.engine_result ||
      error?.message;

    return {
      success: false,
      error: error?.message || "Error desconocido al crear Trust Line",
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

export default createRLUSDTrustline;
