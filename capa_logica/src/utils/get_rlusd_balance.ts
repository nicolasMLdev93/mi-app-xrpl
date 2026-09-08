import * as xrpl from 'xrpl';
import { XRPL_TESTNET, RLUSD_ISSUER, RLUSD_CURRENCY } from '../config';

export const getRLUSDBalance = async (address: string): Promise<number> => {
  if (!xrpl.isValidAddress(address)) {
    console.error('❌ Dirección XRPL inválida:', address);
    return 0;
  }

  const client = new xrpl.Client(XRPL_TESTNET);
  try {
    console.log('⏳ Consultando balance RLUSD...');
    await client.connect();
    console.log('✅ Conectado a XRPL Testnet');

    const response = await client.request({
      command: 'account_lines',
      account: address,
      peer: RLUSD_ISSUER,
      ledger_index: 'validated',
    });

    const rlusdLine = response.result.lines.find(
      (line: any) => line.currency === RLUSD_CURRENCY
    );

    if (!rlusdLine) {
      console.log('ℹ️ La wallet no tiene Trust Line de RLUSD.');
      return 0;
    }

    const balance = Number(rlusdLine.balance);
    if (!Number.isFinite(balance)) {
      console.error('❌ Balance RLUSD inválido:', rlusdLine.balance);
      return 0;
    }

    console.log('💰 Balance RLUSD:', balance);
    return balance;
  } catch (error) {
    console.error('❌ Error consultando RLUSD:', error);
    return 0;
  } finally {
    try {
      if (client.isConnected()) {
        await client.disconnect();
        console.log('🔌 Conexión cerrada.');
      }
    } catch {
      console.log('⚠️ No se pudo cerrar la conexión.');
    }
  }
};