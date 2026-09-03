import xrpl from "xrpl";

const test_transaction = async (): Promise<void> => {
  const client = new xrpl.Client("wss://s.altnet.rippletest.net:51233");
  const wallet = xrpl.Wallet.generate();

  try {
    await client.connect();
    const fundedWallet = await client.fundWallet(wallet);

    console.log("=== DATOS DE LA WALLET ===");
    console.log("Dirección:", fundedWallet.wallet.classicAddress);
    console.log("Saldo inicial:", fundedWallet.balance, "XRP");

    const prepared = await client.autofill({
      TransactionType: "Payment",
      Account: fundedWallet.wallet.classicAddress,
      Amount: "1000000", // 1 XRP
      Destination: "rPT1Sjq2YGrBMTttX4GZHjKu9dyfzbpAYe",
    });

    const signed = fundedWallet.wallet.sign(prepared);
    const response = await client.submitAndWait(signed.tx_blob);

    // Verificar resultado de forma más sencilla
    const metadata = response.result.meta;
    const txResult =
      typeof metadata === "object" &&
      metadata !== null &&
      "TransactionResult" in metadata
        ? metadata.TransactionResult
        : undefined;

    console.log("\n=== RESULTADO DE LA TRANSACCIÓN ===");
    if (txResult === "tesSUCCESS") {
      console.log("✅ Transacción exitosa");
      console.log("Hash:", signed.hash);
    } else {
      console.error("❌ Transacción fallida");
      console.error("Código de error:", txResult);
      console.error("Mensaje:", txResult || "Desconocido");
    }

    // Consultar el saldo final siempre
    const balanceAfter = await client.getXrpBalance(
      fundedWallet.wallet.classicAddress,
    );
    console.log("\n=== SALDO FINAL ===");
    console.log("Saldo después de la transacción:", balanceAfter, "XRP");

    if (txResult === "tesSUCCESS") {
      const diferencia = Number(fundedWallet.balance) - Number(balanceAfter);
      console.log(`💸 XRP gastados (aprox): ${diferencia.toFixed(6)} XRP`);
    }
  } catch (error) {
    console.error("❌ Error en la ejecución:", error);
  } finally {
    try {
      await client.disconnect();
      console.log("🔌 Conexión cerrada.");
    } catch {
      //
    }
  }
};

export default test_transaction;
