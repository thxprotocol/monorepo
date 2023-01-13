type TAccount = {
    sub: string;
    address: string;
    googleAccess: boolean;
    youtubeViewAccess: boolean;
    youtubeManageAccess: boolean;
    twitterAccess: boolean;
    discordAccess: boolean;
    twitchAccess: boolean;
    githubAccess: boolean;
};

type TAccountState = {
    api: THXClient | null;
    getConfig: (id: string) => TWidgetConfig;
    poolId: string;
    balance: number;
    isAuthenticated: boolean;
    account: TAccount | null;
};

type TWidgetConfig = {
    poolId: string;
    origin: string;
    chainId: number;
    theme: string;
    ref?: string;
};
