type TWallet = {
    address: string;
};

type TWalletState = {
    wallet: TWallet | null;
    erc20: any[];
    erc721: any[];
};

type TERC20 = {
    balance: number;
    symbol: string;
    name: string;
    logoImgUrl: string;
};

type TERC721 = {
    erc721: {
        name: string;
        symbol: string;
        logoImgUrl: string;
        address: string;
    };
    logoImg: string;
    tokenId: string;
};
