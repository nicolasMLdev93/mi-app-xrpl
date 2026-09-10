import xrpl from "xrpl";

class SimulatedWallet {
  private wallet: xrpl.Wallet | null = null;

  async connect(): Promise<string> {
    // 🔥 Buscar si ya hay una wallet guardada en sessionStorage
    const savedSeed = sessionStorage.getItem("simulatedWalletSeed");
    if (savedSeed) {
      this.wallet = xrpl.Wallet.fromSeed(savedSeed);
      console.log("🔐 Wallet recuperada de sessionStorage");
      return this.wallet.classicAddress;
    }

    // Si no hay, generar una nueva y guardarla
    this.wallet = xrpl.Wallet.generate();
    const seed = this.wallet.seed;
    if (seed === undefined) {
      throw new Error("No se pudo obtener la semilla de la wallet.");
    }
    sessionStorage.setItem("simulatedWalletSeed", seed);
    console.log("🔐 Nueva wallet generada y guardada");
    return this.wallet.classicAddress;
  }

  getAddress(): string | null {
    return this.wallet?.classicAddress ?? null;
  }

  getWallet(): xrpl.Wallet | null {
    return this.wallet;
  }

  async fund(client: xrpl.Client): Promise<number> {
    if (!this.wallet) {
      throw new Error("La wallet no está conectada.");
    }
    console.log("💰 Solicitando fondos de XRP Testnet...");
    const funded = await client.fundWallet(this.wallet);
    console.log("💰 Wallet fondeada:", funded.balance, "XRP");
    return Number(funded.balance);
  }

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

  async disconnect(): Promise<void> {
    this.wallet = null;
    sessionStorage.removeItem("simulatedWalletSeed");
    console.log("🔌 Wallet simulada desconectada");
  }
}

const simulatedWallet = new SimulatedWallet();
export default simulatedWallet;
