import * as xrpl from 'xrpl';
import { XRPL_TESTNET, RLUSD_ISSUER, RLUSD_CURRENCY } from '../config';

export const checkRLUSDTrustline = async (address: string): Promise<boolean> => {
  if (!xrpl.isValidAddress(address)) return false;

  const client = new xrpl.Client(XRPL_TESTNET);
  try {
    await client.connect();
    const response = await client.request({
      command: 'account_lines',
      account: address,
      peer: RLUSD_ISSUER,
      ledger_index: 'validated',
    });
    const hasLine = response.result.lines.some(
      (line: any) => line.currency === RLUSD_CURRENCY
    );
    return hasLine;
  } catch (error) {
    console.error('Error verificando Trust Line:', error);
    return false;
  } finally {
    try {
      if (client.isConnected()) await client.disconnect();
    } catch {}
  }
};