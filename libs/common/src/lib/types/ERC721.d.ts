type TERC721Token = {
    _id: string;
    sub: string;
    state: ERC721TokenState;
    recipient: string;
    transactions: string[];
    tokenId: number;
    tokenUri: string;
    metadataId: string;
    erc721Id: string;
    metadata: TERC721Metadata;
    nft: TERC721 | TERC1155;
    walletId: string;
    chainId: ChainId;
    balance?: string;
};

type TERC721 = {
    _id: string;
    variant: NFTVariant;
    sub: string;
    chainId: ChainId;
    name: string;
    minters: string[];
    wallets: string[];
    symbol: string;
    transactions?: string[];
    baseURL?: string;
    description?: string;
    contract?: Contract;
    address?: string;
    createdAt?: Date;
    updatedAt?: Date;
    archived?: boolean;
    logoImgUrl?: string;
};

type TERC721Metadata = {
    _id: string;
    erc721Id: string;
    imageUrl: string;
    name: string;
    image: string;
    description: string;
    externalUrl: string;
    tokens?: TERC721Token[];
    createdAt?: Date;
    updatedAt?: Date;
};

type TERC721Transfer = {
    erc721Id: string;
    erc721TokenId: string;
    from: string;
    to: string;
    chainId: ChainId;
    transactionId: string;
    sub: string;
};
