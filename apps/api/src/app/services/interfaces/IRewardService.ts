import { Model } from 'mongoose';
import { WalletDocument } from '@thxnetwork/api/models';
import { RewardVariant } from '@thxnetwork/common/enums';
import RewardNFTService from '../RewardNFTService';
import RewardDiscordRoleService from '../RewardDiscordRoleService';
import RewardCustomService from '../RewardCustomService';
import RewardCouponService from '../RewardCouponService';
import RewardCoinService from '../RewardCoinService';

export interface IRewardService {
    models: {
        reward: Model<TReward>;
        payment: Model<TRewardPayment>;
    };
    decorate(data: { reward: TReward; account?: TAccount }): Promise<TReward>;
    decoratePayment(payment: TRewardPayment): Promise<TRewardPayment>;
    getValidationResult(data: {
        reward: TReward;
        wallet?: WalletDocument;
        safe?: WalletDocument;
        account?: TAccount;
    }): Promise<TValidationResult>;
    create(data: Partial<TReward>): Promise<TReward>;
    update(reward: TReward, updates: Partial<TReward>): Promise<TReward>;
    remove(reward: TReward): Promise<void>;
    findById(id: string): Promise<TReward>;
    createPayment({
        reward,
        account,
        wallet,
    }: {
        reward: TReward;
        account: TAccount;
        wallet?: WalletDocument;
    }): Promise<TValidationResult | void>;
}

export const serviceMap = {
    [RewardVariant.Coin]: new RewardCoinService(),
    [RewardVariant.NFT]: new RewardNFTService(),
    [RewardVariant.Custom]: new RewardCustomService(),
    [RewardVariant.Coupon]: new RewardCouponService(),
    [RewardVariant.DiscordRole]: new RewardDiscordRoleService(),
};
