import type { UserData } from './types';

export const callGlobalApi = async (
  address: string,
  isLineascan: boolean,
): Promise<UserData> => {
  const response = await fetch(
    `https://lxp-snap-api.netlify.app/.netlify/functions/global-api?address=${address}&isLineascan=${isLineascan}`,
    {
      method: 'GET',
    },
  );

  if (!response.ok) {
    console.error(
      `Call to the global API failed with status ${response.status}`,
    );
    throw new Error(`HTTP error! Status: ${response.status}`);
  }

  return response.json();
};
