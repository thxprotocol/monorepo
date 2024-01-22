type TWallet = {
    _id: string;
    address: string;
    version: string;
    chainId: number;
    pendingTransactions: TTransaction[];
    token?: string;
    safeVersion: string;
    latestVersion: string;
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
    wallet: TWallet | null;
    walletTransfer: TWallet | null;
    wallets: TWallet[];
    erc20: any[];
    erc721: any[];
    erc1155: any[];
    allowances: { [tokenAddress: string]: { [spender: string]: number } };
    balances: { [tokenAddress: string]: number };
    couponCodes: any[];
    pendingPoints: number;
    isModalWalletCreateShown: boolean;
    isModalAccountShown: boolean;
    isModalWalletRecoveryShown: boolean;
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
