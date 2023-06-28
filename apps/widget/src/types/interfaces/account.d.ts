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

type THXAuthUser = {
    accessToken: string;
    idToken: string;
    expiresIn: number;
    expiresAt: number;
};

type TAccountState = {
    isEthereumBrowser: boolean;
    isRewardsLoaded: boolean;
    isDeviceShareAvailable: boolean;
    user: THXAuthUser | null;
    privateKey: string;
    oAuthShare: string;
    securityQuestion: string;
    api: THXClient | null;
    poolId: string;
    balance: number;
    isAuthenticated: boolean;
    account: TAccount | null;
    subscription: TSubscription | null;
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
