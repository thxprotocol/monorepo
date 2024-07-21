type TJob = Job;

type TJobDeploySafe = {
    safeAccountConfig: SafeAccountConfig;
    saltNonce: string;
    chainId: ChainId;
};
