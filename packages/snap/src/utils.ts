import { ManageStateOperation } from '@metamask/snaps-sdk';

import type { Captions, SnapState } from './types';

export const LXP_CONTRACT_ADDRESS =
  '0xd83af4fbD77f3AB65C3B1Dc4B38D7e67AEcf599A';
export const LXP_L_CONTRACT_ADDRESS =
  '0x96B3a15257c4983A6fE9073D8C91763433124B82';

/**
 * Get the snap state.
 * @returns Snap State.
 */
export async function getState() {
  const snapState = await snap.request({
    method: 'snap_manageState',
    params: {
      operation: ManageStateOperation.GetState,
      encrypted: false,
    },
  });
  return (snapState ?? {}) as SnapState;
}

/**
 * Set the snap state.
 * @param state - The new state to set.
 */
export async function setState(state: SnapState): Promise<void> {
  try {
    const currentState = await getState();
    const newState = {
      ...currentState,
      ...state,
    };
    await snap.request({
      method: 'snap_manageState',
      params: {
        operation: ManageStateOperation.UpdateState,
        newState,
        encrypted: false,
      },
    });
  } catch (error) {
    console.error(`Failed to set the Snap's state`);
  }
}

/**
 * Get the current chain ID.
 * @returns The current chain ID.
 */
export async function getChainId() {
  let chainId = await ethereum.request<string>({
    method: 'eth_chainId',
  });

  if (!chainId) {
    console.error('Something went wrong while getting the chain ID.');
    chainId = '1';
  }

  return chainId;
}

/**
 * Convert the raw balance to a displayable balance.
 * @param rawBalance - The raw balance.
 * @returns The displayable balance.
 */
export function convertBalanceToDisplay(rawBalance?: string | null) {
  if (!rawBalance || rawBalance === '0x') {
    return 0;
  }

  return Number(BigInt(rawBalance) / BigInt(10 ** 18));
}

/**
 * Load the captions based on the locale and save to state.
 * @param force - This forces the loading of captions. (Usecase: If the Captions have changed, irrespective of Locale change).
 */
export async function loadCaptions(force = false) {
  const locale = await snap.request({ method: 'snap_getLocale' });
  const snapState = await getState();
  if (snapState?.captions) {
    if (!force && snapState.captions.locale === locale) {
      return;
    }
  }

  let captions: Captions;
  try {
    captions = await import(`../locales/${locale}.json`);
  } catch (error) {
    console.error(
      `Cannot find localized files for lang '${locale}'. Switching to default 'en'`,
    );
    captions = await import(`../locales/en.json`);
  }
  await setState({
    captions,
  });
}

/**
 * Simple string truncation with ellipsis.
 * @param input - The input to be truncated.
 * @param maxLength - The size of the string to truncate.
 * @returns The truncated string or the original string if shorter than maxLength.
 */
export function truncateString(input: string, maxLength: number): string {
  if (input.length > maxLength) {
    return `${input.substring(0, maxLength)}...`;
  }
  return input;
}
