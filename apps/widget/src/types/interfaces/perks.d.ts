type TPerkState = {
    perks: any[];
};

type TPerk = {
    uuid: string;
    image: string;
    title: string;
    description: string;
    pointPrice: number;
    isOwned: boolean;
    isPromoted: boolean;
    metadata: { attributes: { key: string; value: string }[] };
};
