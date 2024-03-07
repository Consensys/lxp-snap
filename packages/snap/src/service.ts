import {
  fetchAllActivations,
  fetchBalanceFromLineascan,
  fetchPohStatus,
} from './api';
import type { Activation } from './types';
import { convertBalanceToDisplay } from './utils';

/**
 * Get the LXP balance for an address from Lineascan.
 * @param address - The address to get the LXP balance for.
 * @returns The LXP balance for the address.
 */
async function getLxpBalanceFromLineascan(address: string) {
  const rawBalance = await fetchBalanceFromLineascan(address);
  return convertBalanceToDisplay(rawBalance);
}

/**
 * Get the LXP balance for an address from the chain.
 * @param address - The address to get the LXP balance for.
 * @returns The LXP balance for the address.
 */
async function getLxpBalanceFromChain(address: string) {
  const method = 'eth_call';
  const params = [
    {
      to: '0xd83af4fbD77f3AB65C3B1Dc4B38D7e67AEcf599A',
      data: `0x70a08231000000000000000000000000${address.slice(2)}`,
    },
    'latest',
  ];

  const rawBalance = await ethereum.request<string>({ method, params });

  return convertBalanceToDisplay(rawBalance);
}

/**
 * Get the LXP balance for an address.
 * @param address - The address to get the LXP balance for.
 * @param chainId - The chain ID.
 * @returns The LXP balance for the address.
 */
export async function getLxpBalanceForAddress(
  address: string,
  chainId: string,
) {
  if (chainId === '0xe708') {
    return getLxpBalanceFromChain(address);
  }
  return getLxpBalanceFromLineascan(address);
}

/**
 * Get the POH status for an address.
 * @param address - The address to get the POH status for.
 * @returns The POH status for the address.
 */
export async function getPohStatus(address: string) {
  const pohStatus = await fetchPohStatus(address);
  return pohStatus.poh as boolean;
}

/**
 * Get the current activations.
 * @returns The current activations.
 */
export async function getCurrentActivations() {
  const rawResponse = await fetchAllActivations();
  const allActivations =
    rawResponse?.pageProps?.pageLayout?.sections?.[0]?.items?.[0]?.items ?? [];
  return allActivations.filter((activation: Activation) => {
    const isCurrent = new Date(activation?.endDate) > new Date();
    const hasXpTag = activation?.tags?.find((tag) => tag.name === 'Get XP');
    return isCurrent && hasXpTag;
  });
}
