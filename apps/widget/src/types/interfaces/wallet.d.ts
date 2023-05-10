type TWallet = {
    _id: string;
    address: string;
    version: string;
    latestVersion: string;
};

type TWalletState = {
    wallet: TWallet | null;
    erc20: any[];
    erc721: any[];
    erc1155: any[];
    shopifyDiscountCode: any[];
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
    metadata: TNFTMetadata;
    tokenUri: string;
    tokenId: string;
    owner: string;
    balance: string;
};

type TNFTMetadata = {
    name: string;
    description: string;
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
    name: string;
    symbol: string;
    balance: number;
    walletBalance: number;
    logoImg: string;
    erc20: TERC20;
};

type TERC20TransferConfig = {
    erc20Id: string;
    to: string;
    amount: string;
    chainId: number;
};

type TERC721TransferConfig = {
    erc721Id: string;
    erc721TokenId: string;
    to: string;
};
