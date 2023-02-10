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
    isOwned: boolean;
    isPromoted: boolean;
    metadata: { attributes: { key: string; value: string }[] };
};
