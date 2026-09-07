import xrpl from "xrpl";

/*
Funcionalidad de  la simulated_wallet.ts:
- generar wallet
- conectar
- obtener address
- obtener xrpl.Wallet
- firmar transacciones
- desconectar
- pedir XRP al faucet
*/

class SimulatedWallet {
  // La wallet existe solamente en memoria
  private wallet: xrpl.Wallet | null = null;

  /**
   * Conecta la wallet simulada.
   *
   * Si todavía no existe, genera una nueva wallet XRPL.
   */
  async connect(): Promise<string> {
    if (!this.wallet) {
      this.wallet = xrpl.Wallet.generate();
    }

    console.log("🔐 Wallet simulada conectada");
    console.log("👛 Address:", this.wallet.classicAddress);

    return this.wallet.classicAddress;
  }

  /**
   * Devuelve la dirección pública de la wallet.
   */
  getAddress(): string | null {
    return this.wallet?.classicAddress ?? null;
  }

  /**
   * Devuelve la instancia real de xrpl.Wallet.
   *
   * Se utiliza para acceder a la wallet cuando necesitamos
   * construir o consultar transacciones XRPL.
   */
  getWallet(): xrpl.Wallet | null {
    return this.wallet;
  }

  /**
   * Fondea la wallet utilizando el faucet de XRPL Testnet.
   *
   * Esto entrega XRP de Testnet.
   */
  async fund(client: xrpl.Client): Promise<number> {
    if (!this.wallet) {
      throw new Error("La wallet no está conectada.");
    }

    console.log("💰 Solicitando fondos de XRP Testnet...");

    const funded = await client.fundWallet(this.wallet);

    console.log("💰 Wallet fondeada:", funded.balance, "XRP");

    return Number(funded.balance);
  }

  /**
   * Firma cualquier transacción XRPL.
   *
   * Puede utilizarse para:
   *
   * - Payment
   * - TrustSet
   * - AccountSet
   * - etc.
   *
   * La seed nunca se guarda en localStorage ni sessionStorage.
   */
  async signTransaction(transaction: xrpl.Transaction): Promise<{
    tx_blob: string;
    hash: string;
  }> {
    if (!this.wallet) {
      throw new Error("La wallet no está conectada.");
    }

    console.log("✍️ Firmando transacción...");

    const signed = this.wallet.sign(transaction);

    return {
      tx_blob: signed.tx_blob,
      hash: signed.hash,
    };
  }

  /**
   * Desconecta la wallet.
   *
   * Al eliminar la referencia, la wallet desaparece
   * de la memoria de la aplicación.
   */
  async disconnect(): Promise<void> {
    this.wallet = null;

    console.log("🔌 Wallet simulada desconectada");
  }
}

// Una única instancia para toda la aplicación
const simulatedWallet = new SimulatedWallet();

export default simulatedWallet;
