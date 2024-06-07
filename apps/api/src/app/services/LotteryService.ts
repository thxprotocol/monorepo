import { CouponCode } from '@thxnetwork/api/models';
import AccountProxy from '@thxnetwork/api/proxies/AccountProxy';
import { logger } from '../util/logger';

export const Rewards = {
    ForestKnight: {
        RunestoneOfTheEclipse: {
            title: 'Runestone of the Eclipse',
            description:
                'Rate items from the Mines of Eragoth collection can be bought at a discount using your THX campaign points.',
            marketValue: '199 MATIC',
            image: 'https://i.seadn.io/s/raw/files/77485858457f42c1e4a3f5d89436cced.png?auto=format&dpr=1&w=1000',
        },
        BigBagOfKnight: {
            title: 'Big bag of $KNIGHT',
            description:
                'We distribute 375 USD worth of $KNIGHT as coin rewards ready to be redeemed for your THX campaign points.',
            marketValue: '375 USD',
            image: 'https://miro.medium.com/v2/resize:fit:1000/format:webp/1*-TH_NNMfBLgtbZhvZmNoCA.png',
        },
        ClockworkCodex: {
            title: 'Clockwork Codex',
            description:
                'A bunch of these will be made available for redemption at a discount using your THX campaign points.',
            marketValue: '30 MATIC',
            image: 'https://i.seadn.io/s/raw/files/71fdb00461b8d0d6d0db8e2c714eee8e.png?auto=format&dpr=1&w=1000',
        },
    },
};

export default class LotteryService {
    static async getWinners(lotteries: any[]) {
        return await Promise.all(
            lotteries.map(async (lottery) => {
                try {
                    // Get CouponCode for winning codes
                    const codes = await CouponCode.find({
                        code: { $in: lottery.winners.map((winner) => winner.code) },
                    });

                    // Get subs for winning codes
                    const subs = codes.map((code) => code.sub);

                    // Get tokens with kind discord for winning codes
                    const accounts = await AccountProxy.find({ subs });

                    return {
                        ...lottery,
                        winners: lottery.winners.map((winner) => {
                            const code = codes.find(({ code }) => code === winner.code);
                            const account = accounts.find((a) => a.sub === code.sub);
                            return {
                                ...winner,
                                account: {
                                    avatarURL: account.profileImg,
                                    username: account.username,
                                },
                            };
                        }),
                    };
                } catch (error) {
                    logger.error(error);
                    return lottery;
                }
            }),
        );
    }
}
