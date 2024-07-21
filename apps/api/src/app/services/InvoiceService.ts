import { planPricingMap } from '@thxnetwork/common/constants';
import {
    Pool,
    Invoice,
    QuestDailyEntry,
    QuestInviteEntry,
    QuestSocialEntry,
    QuestCustomEntry,
    QuestWeb3Entry,
    QuestGitcoinEntry,
    PoolDocument,
} from '../models';
import AccountProxy from '../proxies/AccountProxy';
import { logger } from '../util/logger';
import { AccountPlanType } from '@thxnetwork/common/enums';
import { startOfMonth, endOfMonth } from 'date-fns';

// Determine the lookup stages for the quest entries in the pools pipeline
const questEntryModels = [
    QuestDailyEntry,
    QuestInviteEntry,
    QuestSocialEntry,
    QuestCustomEntry,
    QuestWeb3Entry,
    QuestGitcoinEntry,
];

export default class InvoiceService {
    /**
     * Upsert invoices for the current month. Periodically (daily) invoked by the agenda job scheduler.
     */
    static async upsertJob() {
        const currentDate = new Date();
        // Define the start and end dates for the month range
        const invoicePeriodstartDate = startOfMonth(currentDate);
        const invoicePeriodEndDate = endOfMonth(currentDate);

        await this.upsertInvoices(invoicePeriodstartDate, invoicePeriodEndDate);
    }

    /**
     * Upsert invoices for a given period. Used independently for testing and backfills.
     * @param invoicePeriodstartDate
     * @param invoicePeriodEndDate
     */
    static async upsertInvoices(invoicePeriodstartDate: Date, invoicePeriodEndDate: Date, accountsColl?: TAccount[]) {
        // Iterate over all pools in chunks of 1000
        const poolCount = await Pool.countDocuments({});
        const chunkSize = 1000;
        const chunkCount = Math.ceil(poolCount / chunkSize);
        for (let i = 0; i < chunkCount; i++) {
            const pools = await Pool.find({})
                .skip(i * chunkSize)
                .limit(chunkSize);
            await this.upsertInvoicesForPools(pools, invoicePeriodstartDate, invoicePeriodEndDate, accountsColl);
        }
    }

    /**
     * Upsert invoices for the given pools and period
     * @param pools
     * @param questEntryModels
     * @param invoicePeriodstartDate
     * @param invoicePeriodEndDate
     */
    static async upsertInvoicesForPools(
        pools: PoolDocument[],
        invoicePeriodstartDate: Date,
        invoicePeriodEndDate: Date,
        accountsColl?: TAccount[],
    ) {
        try {
            // Get all relevant pools
            const questEntriesByCampaign = await Promise.all(
                pools.map(async (pool) => {
                    const uniqueEntriesByVariant = await Promise.all(
                        questEntryModels.map(async (model) => {
                            return await model
                                .countDocuments({
                                    poolId: pool.id,
                                    createdAt: { $gte: invoicePeriodstartDate, $lte: invoicePeriodEndDate },
                                })
                                .distinct('sub');
                        }),
                    );
                    const flattenedArray = uniqueEntriesByVariant.flat();

                    return { poolId: pool.id, poolSub: pool.sub, mapCount: new Set(flattenedArray).size };
                }),
            );

            // Get the pool owner accounts to send the invoices
            const subs = questEntriesByCampaign.map(({ poolSub }) => poolSub);
            const accounts =
                accountsColl.map((a) => Object.assign(a, { sub: String(a._id) })) ||
                (await AccountProxy.find({ subs }));

            // Build operations array for the current month metrics
            const operations = questEntriesByCampaign.map(({ poolId, poolSub, mapCount }) => {
                try {
                    const account = accounts.find((a) => a.sub === poolSub);
                    // If the account can not be found, has no email or plan then notify admin.
                    // Continue with invoice generation for future reference
                    // @todo: notify admin
                    if (!account) {
                        logger.info(`Account ${account.sub} not found for invoicing.`);
                    }
                    if (!account.email) {
                        logger.info(`Account ${account.sub} has no email for invoicing.`);
                    }
                    if (![AccountPlanType.Lite, AccountPlanType.Premium].includes(account.plan)) {
                        logger.info(`Account ${account.sub} has no plan for invoicing.`);
                    }

                    const plan = account.plan || AccountPlanType.Lite;

                    return {
                        updateOne: {
                            filter: {
                                poolId,
                                periodStartDate: invoicePeriodstartDate,
                                periodEndDate: invoicePeriodEndDate,
                            },
                            update: {
                                $set: {
                                    poolId,
                                    periodStartDate: invoicePeriodstartDate,
                                    periodEndDate: invoicePeriodEndDate,
                                    mapCount,
                                    mapLimit: planPricingMap[plan].subscriptionLimit,
                                    ...this.createInvoiceDetails(plan, mapCount),
                                },
                            },
                            upsert: true,
                        },
                    };
                } catch (error) {
                    logger.error('Invoice entry failed', error);
                }
            });

            // Remove empty ops and bulk write the invoices
            await Invoice.bulkWrite(operations.filter((op) => !!op));
        } catch (error) {
            logger.error('Invoice chunk failed', { error });
        }
    }

    /**
     * Create invoice details for the given account and monthly active participant count
     * @param account
     * @param mapCount
     * @returns invoice details used for upsert in db
     */
    static createInvoiceDetails(plan: AccountPlanType, mapCount: number) {
        const countAdditionalUnits = (mapCount: number, limit: number) => {
            return Math.max(0, mapCount - limit);
        };
        const { subscriptionLimit, costPerUnit, costSubscription } = planPricingMap[plan];

        // Plan limit is subtracted from unit count as costs are included in subscription costs
        const additionalUnitCount = countAdditionalUnits(mapCount, subscriptionLimit);

        return {
            additionalUnitCount,
            costPerUnit,
            costSubscription,
            costTotal: costSubscription + additionalUnitCount * costPerUnit,
            currency: 'USDC',
            plan,
        };
    }
}
