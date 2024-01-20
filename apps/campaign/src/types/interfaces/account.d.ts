declare module 'color';

type TSubscription = {
    sub: string;
    poolId: string;
};

type TAccount = {
    username: string;
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
    profileImg: string;
    rank: number;
};

type TAuthState = {
    wallet: Wallet;
    isDeviceShareAvailable: boolean | null;
    isSecurityQuestionAvailable: boolean | null;
    userManager: UserManager;
    user: {
        id_token?: string;
        expired: boolean;
        session_state: string | null;
        access_token: string;
        refresh_token?: string;
        token_type: string;
        scope?: string;
        profile: UserProfile;
        expires_at?: number;
        state: unknown;
    } | null;
    privateKey: string;
    oAuthShare: string;
    securityQuestion: string;
};

type TAccountState = {
    sheet: HTMLStyleElement | null;
    isAuthenticated: boolean | null;
    isMobileIFrame: boolean;
    isMobileEthereumBrowser: boolean;
    isRewardsLoaded: boolean;
    isPreview: boolean;
    isModalAccountShown: boolean;
    api: THXClient | null;
    poolId: string;
    migration: {
        wallet: TWallet;
        erc20Tokens: TERC20Token[];
        erc721Tokens: TERC721Token[];
    } | null;
    balance: number;
    account: TAccount | null;
    subscription: TSubscription | null;
    config: any;
    leaderboard: { score; wallet; questsCompleted }[];
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
    returnUrl: string;
    backgroundUrl: string;
    ref?: string;
    expired: boolean;
};
