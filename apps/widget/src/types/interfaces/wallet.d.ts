type TWallet = {
    address: string;
};

type TWalletState = {
    wallet: TWallet | null;
    erc20: any[];
    erc721: any[];
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
