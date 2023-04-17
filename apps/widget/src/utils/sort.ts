export const sortDailyRewards = (a: any, b: any) => {
    return a.claimAgainDuration ? 1 : b.claimAgainDuration ? 1 : -1;
};

export const sortConditionalRewards = (a: any, b: any) => {
    return (!!a.isClaimed as boolean) ? 1 : (!!b.isClaimed as boolean) ? 1 : -1;
};

export const sortMilestoneRewards = (a: any, b: any) => {
    const aNum = a.claims && a.claims.length - a.claims.filter((c: TMilestoneRewardClaim) => c.isClaimed).length;
    const bNum = b.claims && b.claims.length - b.claims.filter((c: TMilestoneRewardClaim) => c.isClaimed).length;
    return aNum - bNum > 0 ? -1 : bNum - aNum > 0 ? 1 : -1;
};
