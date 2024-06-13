import type {
  OnHomePageHandler,
  OnInstallHandler,
  OnRpcRequestHandler,
  OnUpdateHandler,
} from '@metamask/snaps-sdk';
import { isValidHexAddress } from '@metamask/utils';

import { getDataForUser } from './service';
import {
  renderMainUi,
  renderPromptLxpAddress,
  renderPromptLxpAddressError,
  renderPromptNextSteps,
} from './ui';
import { getChainId, getState, loadCaptions, setState } from './utils';

export const onInstall: OnInstallHandler = async () => {
  await loadCaptions(true);
  await snap.request({
    method: 'snap_dialog',
    params: await renderPromptNextSteps(),
  });
};

export const onUpdate: OnUpdateHandler = async () => {
  await loadCaptions(true);
};

export const onHomePage: OnHomePageHandler = async () => {
  await loadCaptions();

  /* make calls in parallel */
  const [chainId, snapState] = await Promise.all([getChainId(), getState()]);

  const myAccount = snapState.lxpAddress as string;

  const {
    lxpBalance,
    lxpLBalance,
    openBlockScore,
    pohStatus,
    activations,
    name,
  } = await getDataForUser(myAccount, chainId);

  await setState({
    myLxpBalance: lxpBalance,
    myLxpLBalance: lxpLBalance,
    myOpenBlockScore: openBlockScore,
    myPohStatus: pohStatus,
    activations,
    myLineaEns: name,
  });

  return renderMainUi(myAccount);
};

export const onRpcRequest: OnRpcRequestHandler = async ({ request }) => {
  const params = request.params as any;

  switch (request.method) {
    case 'getLxpAddress': {
      const snapState = await getState();
      return snapState.lxpAddress as string;
    }

    case 'setLxpAddress': {
      const { lxpAddress } = params;

      if (lxpAddress) {
        const lxpAddressStr = lxpAddress as `0x${string}`;
        if (isValidHexAddress(lxpAddressStr)) {
          await setState({
            lxpAddress: lxpAddressStr,
          });
          return lxpAddress;
        }
        console.error(`${lxpAddressStr} is not a valid address`);
        return null;
      }
      console.error(`No address provided.`);
      return null;
    }

    case 'watchLxpAddress': {
      await loadCaptions();
      const lxpAddress = await snap.request({
        method: 'snap_dialog',
        params: await renderPromptLxpAddress(),
      });

      if (lxpAddress) {
        const lxpAddressStr = lxpAddress as `0x${string}`;
        if (isValidHexAddress(lxpAddressStr)) {
          await setState({
            lxpAddress: lxpAddressStr,
          });
          return lxpAddressStr;
        }

        await snap.request({
          method: 'snap_dialog',
          params: await renderPromptLxpAddressError(lxpAddressStr),
        });
      }

      return null;
    }

    default:
      throw new Error('Method not found.');
  }
};
