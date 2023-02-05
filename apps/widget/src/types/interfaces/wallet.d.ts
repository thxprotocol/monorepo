type TWallet = {
    _id: string;
    address: string;
    isUpgradeAvailable: boolean;
};

type TWalletState = {
    wallet: TWallet | null;
    erc20: any[];
    erc721: any[];
};

type TERC20 = {
    _id: string;
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
