declare module 'color';

type TAccount = {
    sub: string;
    firstName: string;
    lastName: string;
    email: string;
    address: string;
    plan: number;
    variant: AccountVariant;
    googleAccess: boolean;
    youtubeViewAccess: boolean;
    youtubeManageAccess: boolean;
    twitterAccess: boolean;
    discordAccess: boolean;
    twitchAccess: boolean;
    githubAccess: boolean;
    shopifyAccess: boolean;
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
