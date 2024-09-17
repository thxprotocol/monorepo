type TQRCodeEntry = {
    _id: string;
    accountId: string;
    sub: string;
    uuid: string;
    redirectURL: string;
    rewardId: string;
    amount: number;
    error: string;
    account: TAccount;
    claimedAt: Date;
    createdAt: Date;
};
