type TPerkState = {
    perks: any[];
};

type TPerk = {
    uuid: string;
    image: string;
    erc721: TERC721;
    title: string;
    amount: string;
    description: string;
    pointPrice: number;
    priceCurrency: string;
    price: number;
    isOwned: boolean;
    isPromoted: boolean;
    isDisabled: boolean;
    metadata: { attributes: { key: string; value: string }[] };
    erc20: TERC20;
    progress: {
        limit: number;
        count: number;
    };
    expiry: {
        date: number;
        now: number;
    };
    isLocked: boolean;
    isOwner: boolean;
    tokenGatingContractAddress: string;
};
