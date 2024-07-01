import { callGlobalApi } from './api';
import type { UserData } from './types';
import {
  convertBalanceToDisplay,
  LXP_CONTRACT_ADDRESS,
  LXP_L_CONTRACT_ADDRESS,
} from './utils';

/**
 * Fetch all the relevant data for the user.
 * @param address - The address to get the data for.
 * @param chainId - The chain ID.
 * @returns The data for the user.
 */
export async function getDataForUser(
  address: string,
  chainId: string,
): Promise<UserData> {
  try {
    const isLineascan = chainId !== '0xe708';
    const [userData, lxpBalanceRaw, lxpLBalanceRaw] = await Promise.all([
      callGlobalApi(address, isLineascan),
      isLineascan ? 0 : getBalanceFromChain(LXP_CONTRACT_ADDRESS, address),
      isLineascan ? 0 : getBalanceFromChain(LXP_L_CONTRACT_ADDRESS, address),
    ]);

    userData.lxpBalance = isLineascan
      ? convertBalanceToDisplay(userData.lxpBalance.toString())
      : lxpBalanceRaw;
    userData.lxpLBalance = isLineascan
      ? convertBalanceToDisplay(userData.lxpLBalance.toString())
      : lxpLBalanceRaw;

    return userData;
  } catch (error) {
    return {
      openBlockScore: 0,
      lxpBalance: 0,
      lxpLBalance: 0,
      pohStatus: false,
      activations: [],
    };
  }
}

/**
 * Get token balance for an address from the chain.
 * @param tokenAddress - The address of the token contract.
 * @param address - The address to get the LXP balance for.
 * @returns The LXP balance for the address.
 */
async function getBalanceFromChain(tokenAddress: string, address: string) {
  const method = 'eth_call';
  const params = [
    {
      to: tokenAddress,
      data: `0x70a08231000000000000000000000000${address.slice(2)}`,
    },
    'latest',
  ];

  const rawBalance = await ethereum.request<string>({ method, params });

  return convertBalanceToDisplay(rawBalance);
}
