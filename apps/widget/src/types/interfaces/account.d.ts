type TAccount = {
    sub: string;
    address: string;
    googleAccess: boolean;
    twitterAccess: boolean;
};

type TAccountState = {
    api: THXClient | null;
    config: () => TWidgetConfig;
    balance: number;
    isAuthenticated: boolean;
    isConnected: { [platform: number]: boolean };
    account: TAccount | null;
};

type TWidgetConfig = {
    poolId: string;
    origin: string;
    chainId: number;
    theme: string;
};
