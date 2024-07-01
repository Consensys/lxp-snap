import { decode } from '@metamask/abi-utils';
import type { Hex } from '@metamask/utils';

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
    const [userData, lxpBalanceRaw, lxpLBalanceRaw, name] = await Promise.all([
      callGlobalApi(address, isLineascan),
      isLineascan ? 0 : getBalanceFromChain(LXP_CONTRACT_ADDRESS, address),
      isLineascan ? 0 : getBalanceFromChain(LXP_L_CONTRACT_ADDRESS, address),
      isLineascan ? '' : getNameFromChain(address),
    ]);

    userData.lxpBalance = isLineascan
      ? convertBalanceToDisplay(userData.lxpBalance.toString())
      : lxpBalanceRaw;
    userData.lxpLBalance = isLineascan
      ? convertBalanceToDisplay(userData.lxpLBalance.toString())
      : lxpLBalanceRaw;
    userData.name = isLineascan ? userData.name : name;

    return userData;
  } catch (error) {
    return {
      openBlockScore: 0,
      lxpBalance: 0,
      lxpLBalance: 0,
      pohStatus: false,
      activations: [],
      name: '',
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

/**
 * Get the Linea ENS node hash from the chain.
 * @param address - The address to get the Linea ENS node hash for.
 * @returns The Linea ENS node hash for the address.
 */
async function getNodeHashFromChain(address: string) {
  const method = 'eth_call';
  const params = [
    {
      to: '0x2372154B01F1071b2f2BB02e93Ab97404f1F7a76',
      data: `0xbffbe61c000000000000000000000000${address.slice(2)}`,
    },
    'latest',
  ];

  return ethereum.request<string>({ method, params });
}

/**
 * Get the Linea ENS domain name for an address from the chain.
 * @param address - The address to get the Linea ENS domain name for.
 * @returns The Linea ENS domain name for the address.
 */
async function getNameFromChain(address: string): Promise<string> {
  const nodeHash = await getNodeHashFromChain(address);

  if (!nodeHash || nodeHash === '0x') {
    return '';
  }

  const method = 'eth_call';
  const params = [
    {
      to: '0x5bDA6a6B90452e8a399B412E70915B61Dd50c82B',
      data: `0x691f3431${nodeHash.slice(2)}`,
    },
    'latest',
  ];

  const rawName = await ethereum.request<string>({ method, params });

  if (!rawName || rawName === '0x') {
    return '';
  }

  return decode(['string'], rawName.toString() as Hex)[0] as string;
}
