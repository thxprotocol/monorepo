import { Document } from 'mongoose';
import { RewardVariant } from '@thxnetwork/common/enums';
import { Participant, QRCodeEntry, Wallet, WalletDocument } from '@thxnetwork/api/models';
import { v4 } from 'uuid';
import { logger } from '../util/logger';
import { Job } from '@hokify/agenda';
import { PromiseParser } from '../util';
import RewardCoinService from './RewardCoinService';
import LockService from './LockService';
import AccountProxy from '../proxies/AccountProxy';
import ParticipantService from './ParticipantService';
import RewardNFTService from './RewardNFTService';
import RewardCouponService from './RewardCouponService';
import ImageService from './ImageService';
import PointBalanceService from './PointBalanceService';
import MailService from './MailService';
import RewardDiscordRoleService from './RewardDiscordRoleService';
import RewardCustomService from './RewardCustomService';
import PoolService from './PoolService';

const serviceMap = {
    [RewardVariant.Coin]: new RewardCoinService(),
    [RewardVariant.NFT]: new RewardNFTService(),
    [RewardVariant.Custom]: new RewardCustomService(),
    [RewardVariant.Coupon]: new RewardCouponService(),
    [RewardVariant.DiscordRole]: new RewardDiscordRoleService(),
};

export default class RewardService {
    static async count({ poolId }) {
        const variants = Object.keys(RewardVariant).filter((v) => !isNaN(Number(v)));
        const counts = await Promise.all(
            variants.map(async (variant: string) => {
                const Reward = serviceMap[variant].models.reward;
                return await Reward.countDocuments({ poolId, isPublished: true });
            }),
        );
        return counts.reduce((acc, count) => acc + count, 0);
    }

    static async list({ pool, account }) {
        const owner = await AccountProxy.findById(pool.sub);
        const rewardVariants = Object.keys(RewardVariant).filter((v) => !isNaN(Number(v)));
        const callback: any = async (variant: RewardVariant) => {
            const Reward = serviceMap[variant].models.reward;
            // Filter out rewards that have QR codes (RDM)
            const qrCodeRewardIds = await QRCodeEntry.find().distinct('rewardId');
            const rewards = await Reward.find({
                _id: { $nin: qrCodeRewardIds },
                poolId: pool._id,
                variant,
                isPublished: true,
                $or: [
                    // Include quests with expiryDate less than or equal to now
                    { expiryDate: { $exists: true, $gte: new Date() } },
                    // Include quests with no expiryDate
                    { expiryDate: { $exists: false } },
                    { expiryDate: null },
                ],
            });
            return await Promise.all(
                rewards.map(async (reward) => {
                    try {
                        const decorated = await serviceMap[reward.variant].decorate({ reward, account });
                        const isLocked = await this.isLocked({ reward, account });
                        const isLimitReached = await this.isLimitReached({ reward, account });
                        const isLimitSupplyReached = await this.isLimitSupplyReached(reward);
                        const isExpired = this.isExpired(reward);
                        const isAvailable = account
                            ? !isLocked && !isExpired && !isLimitSupplyReached && !isLimitReached
                            : true;
                        const limitProgress = {
                            count: account
                                ? await serviceMap[reward.variant].models.payment.countDocuments({
                                      rewardId: reward.id,
                                      sub: account.sub,
                                  })
                                : 0,
                            max: reward.limit,
                        };
                        const paymentCount = await serviceMap[reward.variant].models.payment.countDocuments({
                            rewardId: reward.id,
                        });
                        const limitSupplyProgress = {
                            count: paymentCount,
                            max: reward.limitSupply,
                        };
                        return {
                            isLocked,
                            isLimitReached,
                            isLimitSupplyReached,
                            isExpired,
                            isAvailable,
                            paymentCount,
                            author: {
                                username: owner.username,
                            },
                            limitSupplyProgress,
                            limitProgress,
                            ...decorated,
                        };
                    } catch (error) {
                        logger.error(error);
                    }
                }),
            );
        };

        return await Promise.all(rewardVariants.map(callback));
    }

    static async findPaymentsBySub(
        reward: TReward,
        { skip, limit, query }: { skip: number; limit: number; query: string },
    ) {
        const Payment = serviceMap[reward.variant].models.payment;
        // Get all matching accounts by email and username first
        const accounts = await AccountProxy.find({ query });
        // We then fetch the payments for the list of subs
        const subs = accounts.map(({ sub }) => sub);
        // Then we fetch the participants for the poolId and the list of subs
        const participants = await Participant.find({ poolId: reward.poolId, sub: { $in: subs } });
        const payments = await Payment.find({ rewardId: reward._id, sub: { $in: subs } })
            .limit(limit)
            .skip(skip);

        return { payments, accounts, participants };
    }

    static async findPaymentsByReward(
        reward: TReward,
        { skip, limit }: { skip: number; limit: number; query: string },
    ) {
        const Payment = serviceMap[reward.variant].models.payment;
        // If there is no query we fetch the payments for the reward
        const payments = await Payment.find({ rewardId: reward._id }).limit(limit).skip(skip);
        const subs = payments.map(({ sub }) => sub);
        const accounts = await AccountProxy.find({ subs });
        const participants = await Participant.find({ poolId: reward.poolId, sub: { $in: subs } });

        return { payments, accounts, participants };
    }

    static async findPayments(reward: TReward, { page, limit, query }: { page: number; limit: number; query: string }) {
        const skip = (page - 1) * limit;
        const Payment = serviceMap[reward.variant].models.payment;
        const total = await Payment.countDocuments({ rewardId: reward._id });

        // If there is a query we fetch accounts by username first
        const { payments, accounts, participants } =
            query.length > 3
                ? await this.findPaymentsBySub(reward, { skip, limit, query })
                : await this.findPaymentsByReward(reward, { skip, limit, query });
        const results = await PromiseParser.parse(
            payments.map(async (payment: Document & TRewardPayment) =>
                ParticipantService.decorate(payment, { accounts, participants }),
            ),
        );

        return {
            total,
            limit,
            page,
            results,
        };
    }

    static async findPaymentsForSub(sub: string) {
        const rewardVariants: string[] = Object.keys(RewardVariant).filter((v) => !isNaN(Number(v)));
        const payments = await PromiseParser.parse(
            rewardVariants.map(async (variant: string) => {
                const rewardVariant = Number(variant);
                const payments = await serviceMap[rewardVariant].models.payment.find({ sub });
                const callback = payments.map(async (p: Document & TRewardPayment) => {
                    const decorated = await serviceMap[rewardVariant].decoratePayment(p);
                    return { ...decorated, rewardVariant };
                });
                return await Promise.all(callback);
            }),
        );
        return payments.flat();
    }

    static async createPaymentJob(job: Job) {
        try {
            const { variant, sub, rewardId, walletId } = job.attrs.data as any;
            const account = await AccountProxy.findById(sub);
            const reward = await this.findById(variant, rewardId);
            const pool = await PoolService.getById(reward.poolId);
            const wallet = walletId && (await Wallet.findById(walletId));

            // Validate supply, expiry, locked and reward specific validation
            const validationResult = await this.getValidationResult({ reward, account, wallet });
            if (!validationResult.result) return validationResult.reason;

            // @TODO Should create payment with state and update after point subtraction and reward distribution etc

            // Subtract points for account
            await PointBalanceService.subtract(pool, account, reward.pointPrice);

            // Create the payment
            await serviceMap[variant].createPayment({ reward, account, wallet });

            // Send email notification
            let html = `<p style="font-size: 18px">Congratulations!🚀</p>`;
            html += `<p>Your payment has been received! <strong>${reward.title}</strong> is available in your account.</p>`;
            html += `<p class="btn"><a href="${pool.campaignURL}">View Wallet</a></p>`;
            await MailService.send(account.email, `🎁 Reward Received!`, html);
        } catch (error) {
            console.log(error);
            logger.error(error);
        }
    }

    static async create(variant: RewardVariant, poolId: string, data: Partial<TReward>, file: Express.Multer.File) {
        if (file) {
            data.image = await ImageService.upload(file);
        }

        const reward = await serviceMap[variant].create({ ...data, poolId, variant, uuid: v4() });

        // TODO Implement publish notification flow for rewards
        // if (data.isPublished) {
        //     await NotificationService.notify(variant, quest);
        // }

        return reward;
    }

    static async update(reward: TReward, updates: Partial<TReward>, file?: Express.Multer.File) {
        if (file) {
            updates.image = await ImageService.upload(file);
        }

        reward = await serviceMap[reward.variant].update(reward, updates);

        // TODO Implement publish notification flow for rewards
        // if (data.isPublished) {
        //     await NotificationService.notify(variant, quest);
        // }

        return reward;
    }

    static async remove(reward: TReward) {
        return await serviceMap[reward.variant].remove(reward);
    }

    static findById(variant: RewardVariant, rewardId: string) {
        return serviceMap[variant].findById(rewardId);
    }

    static async getValidationResult({
        reward,
        account,
        wallet,
    }: {
        reward: TReward;
        account: TAccount;
        wallet?: WalletDocument;
    }) {
        const participant = await Participant.findOne({ sub: account.sub, poolId: reward.poolId });
        if (Number(participant.balance) < Number(reward.pointPrice)) {
            return { result: false, reason: 'Participant has insufficient points.' };
        }

        const isLocked = await this.isLocked({ reward, account });
        if (isLocked) return { result: false, reason: 'This reward is locked.' };

        const isExpired = this.isExpired(reward);
        if (isExpired) return { result: false, reason: 'This reward claim has expired.' };

        const isLimitSupplyReached = await this.isLimitSupplyReached(reward);
        if (isLimitSupplyReached) return { result: false, reason: "This reward has reached it's supply limit." };

        const isLimitReached = await this.isLimitReached({ reward, account });
        if (isLimitReached) return { result: false, reason: 'This reward has reached your personal limit.' };

        return serviceMap[reward.variant].getValidationResult({ reward, account, wallet });
    }

    // Checks if the account has reached the max amount of payments for this reward
    static async isLimitReached({ reward, account }: { reward: TReward; account?: TAccount }) {
        if (!account || !reward.limit) return false;
        const Payment = await serviceMap[reward.variant].models.payment;
        const paymentCount = await Payment.countDocuments({ rewardId: reward.id, sub: account.sub });
        return paymentCount >= reward.limit;
    }

    // Checks if the reward is locked with a quest
    static async isLocked({ reward, account }) {
        if (!account || !reward.locks.length) return false;
        return await LockService.getIsLocked(reward.locks, account);
    }

    // Checks if the reward is expired
    static isExpired(reward: TReward) {
        if (!reward.expiryDate) return false;
        return Date.now() > new Date(reward.expiryDate).getTime();
    }

    // Checks if the reward supply is sufficient
    static async isLimitSupplyReached(reward: TReward) {
        if (!reward.limitSupply) return false;
        // Check if reward has a limit and if limit has been reached
        const paymentCount = await serviceMap[reward.variant].models.payment.countDocuments({
            rewardId: reward.id,
        });
        return paymentCount >= reward.limitSupply;
    }

    static async isAvailable({ reward, account }: { reward: TReward; account?: TAccount }) {
        if (!account) return true;

        const isLocked = await this.isLocked({ reward, account });
        const isLimitSupplyReached = await this.isLimitSupplyReached(reward);
        const isLimitReached = await this.isLimitReached({ reward, account });
        const isExpired = this.isExpired(reward);

        return !isLocked && !isExpired && !isLimitSupplyReached && !isLimitReached;
    }
}
