type TWallet = {
    _id: string;
    uuid: string;
    address: string;
    version: string;
    chainId: number;
    pendingTransactions: TTransaction[];
    token?: string;
    variant: WalletVariant;
    safeVersion: string;
    latestVersion: string;
    logo: string;
    short: string;
};

type TTransaction = {
    from: string;
    to: string;
    nonce: number;
    gas: string;
    chainId: ChainId;
    walletId: string;
    transactionHash: string;
    safeTxHash: string;
};

type TWalletState = {
    modal: Web3Modal | null;
    account: any | null;
    chainId: ChainId;
    wallets: TWallet[];
    wallet: TWallet | null;
    erc20: any[];
    erc721: any[];
    erc1155: any[];
    allowances: { [tokenAddress: string]: { [spender: string]: string } };
    balances: { [tokenAddress: string]: string };
    couponCodes: any[];
    discordRoles: any[];
    pendingPoints: number;
    isLoading: boolean;
    isModalWalletCreateShown: boolean;
    isModalChainSwitchShown: boolean;
};

type TERC20 = {
    _id: string;
    balance: number;
    symbol: string;
    name: string;
    logoImgUrl: string;
};

type TERC721Token = {
    _id: string;
    sub: string;
    nft: TERC721 | TERC1155;
    recipient: string;
    metadata: TNFTMetadata;
    tokenUri: string;
    tokenId: string;
    owner: string;
    balance: string;
};

type TNFTMetadata = {
    name: string;
    description: string;
    image: string;
    imageUrl: string;
    externalUrl: string;
};

type TERC721 = {
    _id: string;
    chainId: ChainId;
    variant: NFTVariant;
    name: string;
    symbol: string;
    description: string;
    logoImgUrl: string;
    address: string;
};

type TERC1155 = {
    _id: string;
    variant: NFTVariant;
    name: string;
    symbol: string;
    description: string;
    logoImgUrl: string;
    address: string;
};

type TERC20Token = {
    _id: string;
    name: string;
    symbol: string;
    balance: number;
    walletBalance: number;
    migrationBalance: string;
    logoImg: string;
    erc20: TERC20;
};

type TERC20TransferConfig = {
    erc20Id: string;
    to: string;
    amount: string;
    chainId: number;
};

type TNFTTransferConfig = {
    erc721Id: string;
    erc721TokenId: string;
    erc1155Id: string;
    erc1155Amount: number;
    to: string;
};

type TVeLock = {
    amount: string;
    end: number;
};

type TVeState = {
    lock: TVeLock;
    now: number;
    balance: BigNumber;
    rewards: { tokenAddress: string; amount: string; symbol: string }[];
};

type TLiquidityState = {
    pricing: { [key: string]: number };
};

type TRequestBodyDeposit = {
    lockEndTimestamp: number;
    amountInWei: string;
};
