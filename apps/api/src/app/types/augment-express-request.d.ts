namespace Express {
    interface Request {
        origin?: string;
        auth?: any;
        account?: TAccount;
        rawBody?: string;
        account?: TAccount;
        wallet?: WalletDocument;
        campaign?: PoolDocument;
        quest?: TQuest;
    }
}
