type TERC20 = {
    _id: string;
    type: ERC20Type;
    name: string;
    symbol: string;
    address: string;
    transactions: string[];
    chainId?: ChainId;
    contract?: Contract;
    contractName?: TContractName;
    sub?: string;
    totalSupply: number;
    decimals?: number;
    adminBalance?: number;
    poolBalance?: number; // TODO Should move to TAssetPool
    archived: boolean;
    logoImgUrl?: string;
};

type TERC20Token = {
    sub?: string;
    erc20Id: string;
    balance?: number;
    walletId: string;
    chainId: ChainId;
};
