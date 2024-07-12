type TNetworkConfig = {
    rpc: string;
    web3: Web3;
    txServiceUrl: string;
    defaultAccount: string;
    signer: Signer;
    relayer?: Relayer;
    provider?: DefenderRelayProvider;
};

type TWallet = {
    _id?: string;
    poolId: string;
    sub: string;
    chainId: ChainId;
    address: string;
    version: string;
    variant: WalletVariant;
    safeVersion: string;
    uuid: string;
    createdAt: Date;
    expiresAt: Date;
};
