type TInvoice = {
    sub: string;
    additionalUnitCount: number;
    costPerUnit: number;
    costSubscription: number;
    costTotal: number;
    currency: string;
    mapCount: number;
    mapLimit: number;
    plan: AccountPlanType;
    periodStartDate: Date;
    periodEndDate: Date;
};
