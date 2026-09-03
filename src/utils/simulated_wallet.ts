import xrpl from "xrpl";

class SimulatedWallet {
  // La wallet vive solamente en memoria
  private wallet: xrpl.Wallet | null = null;

  /**
   * Conecta la wallet simulada.
   * Si todavía no existe, genera una nueva.
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
   * Devuelve la dirección de la wallet conectada.
   */
  getAddress(): string | null {
    return this.wallet?.classicAddress ?? null;
  }

  /**
   * Fondea la wallet usando el faucet de XRPL Testnet.
   */
  async fund(client: xrpl.Client): Promise<number> {
    if (!this.wallet) {
      throw new Error("La wallet no está conectada.");
    }

    console.log("💰 Solicitando fondos de Testnet...");

    const funded = await client.fundWallet(this.wallet);

    console.log(
      "💰 Wallet fondeada:",
      funded.balance,
      "XRP"
    );

    return Number(funded.balance);
  }

  /**
   * Firma una transacción.
   *
   * La seed nunca se guarda en sessionStorage
   * ni en localStorage.
   */
  async signTransaction(
    transaction: xrpl.Payment
  ): Promise<{
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
   * Al poner wallet = null, la wallet desaparece de memoria.
   */
  async disconnect(): Promise<void> {
    this.wallet = null;

    console.log("🔌 Wallet simulada desconectada");
  }
}

// Creamos una única instancia para toda la aplicación
const simulatedWallet = new SimulatedWallet();

export default simulatedWallet;