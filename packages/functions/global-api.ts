import type { Activation } from '@consensys/linea-voyager/src/types';

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
};

export const LXP_CONTRACT_ADDRESS =
  '0xd83af4fbD77f3AB65C3B1Dc4B38D7e67AEcf599A';
export const LXP_L_CONTRACT_ADDRESS =
  '0x96B3a15257c4983A6fE9073D8C91763433124B82';

const LINEASCAN_API_KEY = process.env.LINEASCAN_API_KEY;

/**
 * This function is called on every network call.
 * @param event - The event object.
 * @param event.httpMethod - The HTTP method used by the caller.
 * @param event.body - The HTTP request body.
 * @returns The response object.
 */
export async function handler(event: {
  queryStringParameters: { address: string; isLineascan: boolean };
  body: string;
  httpMethod: string;
}) {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers,
      body: '',
    };
  }

  if (event.httpMethod === 'GET') {
    if (!LINEASCAN_API_KEY) {
      return {
        statusCode: 500,
        body: JSON.stringify({
          message: 'Lineascan API key not set',
        }),
      };
    }

    const { address, isLineascan } = event.queryStringParameters;

    if (!address || address == '') {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: 'Missing address parameter',
        }),
      };
    }

    const [activations, pohStatus, openBlockScore, lxpBalance, lxpLBalance] =
      await Promise.all([
        getActivations(),
        fetchPohStatus(address),
        getOpenBlockScore(address.toLowerCase()),
        isLineascan
          ? fetchBalanceFromLineascan(LXP_CONTRACT_ADDRESS, address)
          : Promise.resolve('0'),
        isLineascan
          ? fetchBalanceFromLineascan(LXP_L_CONTRACT_ADDRESS, address)
          : Promise.resolve('0'),
      ]);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        activations,
        pohStatus,
        openBlockScore,
        lxpBalance,
        lxpLBalance,
      }),
    };
  }

  return {
    statusCode: 405,
    headers,
    body: JSON.stringify({
      message: 'Method not allowed',
    }),
  };
}

async function getData(
  url: string,
  additionalHeaders?: Record<string, string>,
) {
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      ...additionalHeaders,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    console.error(`Call to ${url} failed with status ${response.status}`);
    throw new Error(`HTTP error! Status: ${response.status}`);
  }

  return response.json();
}

/**
 * Get current active activations from Contentful.
 * @returns The activations object.
 */
async function getActivations() {
  const { CONTENTFUL_API_KEY } = process.env;
  const GET_XP_TAG = '4WJBpV24ju4wlbr6Kvi2pt';

  if (!CONTENTFUL_API_KEY) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Contentful API key not set',
      }),
    };
  }

  try {
    const res = await getData(
      'https://api.contentful.com/spaces/64upluvbiuck/environments/master/entries/?content_type=activationsCard',
      {
        Authorization: CONTENTFUL_API_KEY,
      },
    );

    const allActivations = res?.items ?? [];
    return allActivations.filter((activation: Activation) => {
      const isCurrent =
        new Date(activation?.fields?.endDate?.['en-US']) > new Date();
      const hasXpTag = activation?.fields?.tags?.['en-US']?.find(
        (tag) => tag?.sys?.id === GET_XP_TAG,
      );
      return isCurrent && hasXpTag;
    });
  } catch (error) {
    return [];
  }
}

/**
 * Get the current OpenBlock XP score for an address.
 * @param address - The address to get the OpenBlock XP score for.
 * @returns The OpenBlock XP score for the address.
 */
async function getOpenBlockScore(address: string) {
  try {
    const res = await getData(
      `https://kx58j6x5me.execute-api.us-east-1.amazonaws.com/linea/userPointsSearchMetaMask?user=${address}`,
      {
        Origin: 'snap://linea-voyager',
      },
    );

    return res[0].xp;
  } catch (error) {
    return 0;
  }
}

async function fetchBalanceFromLineascan(
  tokenBalance: string,
  address: string,
) {
  try {
    const res = await getData(
      `https://api.lineascan.build/api?module=account&action=tokenbalance&contractaddress=${tokenBalance}&address=${address}&tag=latest&apiKey=${LINEASCAN_API_KEY}`,
    );

    return res.result as string;
  } catch (e) {
    return '0';
  }
}

async function fetchPohStatus(address: string) {
  try {
    const pohPayload = await getData(
      ` https://linea-xp-poh-api.linea.build/poh/${address}`,
    );
    return pohPayload.poh as boolean;
  } catch (e) {
    return false;
  }
}
