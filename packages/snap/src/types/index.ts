export type Captions = {
  locale: string;
  poh: {
    status: string;
    verified: string;
    notVerified: string;
  };
  lxp: string;
  balance: string;
  balanceLxpL: string;
  pendingBalanceLxpL: string;
  address: string;
  pohStatus: string;
  activations: {
    number: string;
    none: string;
    one: string;
  };
  lxpAddress: {
    heading: string;
    prompt: string;
  };
  nextSteps: {
    heading: string;
    body: string;
  };
  noAddress: {
    toSetText: string;
    toSetLink: string;
  };
  help: string;
  viewBalance: string;
  viewLxpLBalance: string;
  completePOH: string;
  exploreAll: string;
  errors: {
    heading: string;
    invalidLxpAddress: string;
  };
};

export type Tag = {
  sys: {
    id: string;
  };
};

export type Activation = {
  fields: {
    endDate: {
      'en-US': string;
    };
    tags: {
      'en-US': Tag[];
    };
    title: {
      'en-US': string;
    };
    url: {
      'en-US': string;
    };
  };
};

export type UserData = {
  activations: Activation[];
  pohStatus: boolean;
  openBlockScore: number;
  lxpBalance: number;
  lxpLBalance: number;
};

export type SnapState = {
  captions?: Captions;
  lxpAddress?: string;
  myLxpBalance?: number;
  myLxpLBalance?: number;
  myOpenBlockScore?: number;
  myPohStatus?: boolean;
  activations?: Activation[];
};
