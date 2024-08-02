import { planPricingMap } from '@thxnetwork/common/constants';
import { Pool, Invoice } from '../models';
import { logger } from '../util/logger';
import { AccountPlanType, QuestVariant } from '@thxnetwork/common/enums';
import { startOfMonth, endOfMonth } from 'date-fns';
import { serviceMap } from './interfaces/IQuestService';
import AccountProxy from '../proxies/AccountProxy';

class InvoiceService {
    questEntryModels = [];

    /**
     * Upsert invoices for the current month. Periodically (daily) invoked by the agenda job scheduler.
     */
    async upsertJob() {
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
    async upsertInvoices(invoicePeriodstartDate: Date, invoicePeriodEndDate: Date) {
        // Iterate over all pools in chunks of 1000
        // const poolCount = await Pool.countDocuments({});
        const poolSubs = await Pool.distinct('sub');
        const accounts = await AccountProxy.find({ subs: poolSubs });
        const chunkSize = 1000;
        const chunkCount = Math.ceil(accounts.length / chunkSize);

        // Determine the lookup stages for the quest entries in the pools pipeline
        this.questEntryModels = Object.keys(QuestVariant)
            .filter((key) => isNaN(Number(key)))
            .map((key: string) => {
                return serviceMap[QuestVariant[key]].models.entry;
            });

        for (let i = 0; i < chunkCount; i++) {
            const startIndex = i * chunkSize;
            const endIndex = Math.min((i + 1) * chunkSize, accounts.length);
            const accountChunk = accounts.slice(startIndex, endIndex);

            await this.upsertInvoicesForAccounts(accountChunk, invoicePeriodstartDate, invoicePeriodEndDate);
        }
    }

    /**
     * Upsert invoices for the given pools and period
     * @param account
     * @param pools
     * @param invoicePeriodstartDate
     * @param invoicePeriodEndDate
     * @param accountsColl optional accounts collection
     */
    async upsertInvoicesForAccounts(accounts: TAccount[], invoicePeriodstartDate: Date, invoicePeriodEndDate: Date) {
        try {
            // Get all relevant pools
            const pools = await Pool.find({ sub: { $in: accounts.map((a) => a.sub) } });
            const questEntriesByAccount = await Promise.all(
                accounts.map(async (account) => {
                    const uniqueEntrySubsByPool = await Promise.all(
                        pools
                            // Get pools for the invoice account
                            .filter((pool) => pool.sub === account.sub)
                            // Create an array of unique subs for each pool
                            .map(async (pool) => {
                                // Get quest entries by sub for pool
                                const uniqueQuestEntrySubsByVariant = await Promise.all(
                                    this.questEntryModels.map(async (model) => {
                                        return await model
                                            .countDocuments({
                                                poolId: pool.id,
                                                createdAt: { $gte: invoicePeriodstartDate, $lte: invoicePeriodEndDate },
                                            })
                                            .distinct('sub');
                                    }),
                                );
                                // Flatten to an array of subs
                                return uniqueQuestEntrySubsByVariant.flat();
                            }),
                    );

                    const flattenedArray = uniqueEntrySubsByPool.flat();
                    const mapCount = new Set(flattenedArray).size;

                    return { account, mapCount };
                }),
            );

            // Build operations array for the current month metrics
            const operations = questEntriesByAccount.map(({ account, mapCount }) => {
                try {
                    if (!account) {
                        logger.error('Account is missing for invoice entry');
                        return;
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
                                sub: account.sub,
                                periodStartDate: invoicePeriodstartDate,
                                periodEndDate: invoicePeriodEndDate,
                            },
                            update: {
                                $set: {
                                    sub: account.sub,
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
    createInvoiceDetails(plan: AccountPlanType, mapCount: number) {
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

export default new InvoiceService();
