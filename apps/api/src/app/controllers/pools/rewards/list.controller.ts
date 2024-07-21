import { param, query } from 'express-validator';
import { Request, Response } from 'express';
import {
    CouponCode,
    RewardNFT,
    RewardCoupon,
    RewardCoin,
    RewardDiscordRole,
    RewardCustom,
    ERC20,
    ERC721,
    ERC1155,
} from '@thxnetwork/api/models';
import { RewardVariant } from '@thxnetwork/common/enums';
import PoolService from '@thxnetwork/api/services/PoolService';
import SafeService from '@thxnetwork/api/services/SafeService';

const validation = [
    param('id').isMongoId(),
    query('page').isInt(),
    query('limit').isInt(),
    query('isPublished')
        .optional()
        .isBoolean()
        .customSanitizer((value) => {
            return value && JSON.parse(value);
        }),
];

const controller = async (req: Request, res: Response) => {
    const poolId = req.params.id;
    const page = Number(req.query.page);
    const limit = Number(req.query.limit);
    const $match = { poolId, isPublished: req.query.isPublished };
    const pipeline = [
        { $unionWith: { coll: RewardNFT.collection.name } },
        { $unionWith: { coll: RewardCoupon.collection.name } },
        { $unionWith: { coll: RewardCustom.collection.name } },
        { $unionWith: { coll: RewardDiscordRole.collection.name } },
        { $match },
    ];
    const arr = await Promise.all(
        [RewardCoin, RewardNFT, RewardCoupon, RewardCustom, RewardDiscordRole].map(
            async (model) => await model.countDocuments($match),
        ),
    );
    const total = arr.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
    const results = await RewardCoin.aggregate([
        ...pipeline,
        { $sort: { index: 1 } },
        { $skip: (page - 1) * limit },
        { $limit: limit },
    ]);
    const pool = await PoolService.getById(poolId);

    res.json({
        total,
        limit,
        page,
        results: await Promise.all(
            results.map(async (reward) => {
                // TODO Move this hack to a service method and make it part of the IRewardService
                if (reward.variant === RewardVariant.Coupon) {
                    const couponCodeCount = await CouponCode.countDocuments({ couponRewardId: reward._id });
                    return { ...reward, couponCodeCount };
                }

                if ([RewardVariant.Coin, RewardVariant.NFT].includes(reward.variant)) {
                    const getToken = async (reward) => {
                        return reward.erc20Id
                            ? await ERC20.findById(reward.erc20Id)
                            : reward
                            ? await ERC721.findById(reward.erc721Id)
                            : reward
                            ? await ERC1155.findById(reward.erc1155Id)
                            : null;
                    };
                    const token = await getToken(reward);
                    const wallet = token ? await SafeService.findOneByPool(pool, token.chainId) : null;

                    return { ...reward, wallet };
                }
                return reward;
            }),
        ),
    });
};

export { controller, validation };
