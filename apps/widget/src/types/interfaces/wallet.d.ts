type TWalletState = {
    erc20: any[];
    erc721: any[];
};

type TERC721 = {
    erc721: {
        name: string;
        symbol: string;
        logoImg: string;
        address: string;
    };
    tokenId: string;
};
