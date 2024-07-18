type TJob = Job;

type TJobDeploySafe = {
    attrs: { data: { safeAccountConfig: SafeAccountConfig; saltNonce: string; chainId: ChainId } };
};
