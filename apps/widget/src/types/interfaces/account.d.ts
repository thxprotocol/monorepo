declare module 'color';

type TSubscription = {
    sub: string;
    poolId: string;
};

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
    isEthereumBrowser: boolean;
    isRewardsLoaded: boolean;
    user: { id_token: string; access_token: string } | null;
    privateKey: string;
    oAuthShare: string;
    api: THXClient | null;
    poolId: string;
    balance: number;
    isAuthenticated: boolean;
    account: TAccount | null;
    subscription: TSubscription | null;
    getConfig: (id: string) => TWidgetConfig;
};

type TWidgetTheme = {
    elements: { [key]: { color: string; label: string } };
    colors: { [key]: { color: string; label: string } };
};

type TWidgetConfig = {
    poolId: string;
    origin: string;
    chainId: number;
    theme: string;
    title: string;
    logoUrl: string;
    backgroundUrl: string;
    ref?: string;
    expired: boolean;
};
