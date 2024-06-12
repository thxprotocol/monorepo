import { CouponCode } from '@thxnetwork/api/models';
import AccountProxy from '@thxnetwork/api/proxies/AccountProxy';
import { logger } from '../util/logger';

export const Rewards = {
    ForestKnight: {
        RunestoneOfTheEclipse: {
            title: 'Runestone of the Eclipse',
            marketValue: '75 USD',
            image: 'https://i.seadn.io/s/raw/files/77485858457f42c1e4a3f5d89436cced.png?auto=format&dpr=1&w=1000',
        },
        RunestoneOfTheEthereal: {
            title: 'Runestone of the Ethereal',
            marketValue: '120 USD',
            image: 'https://i.seadn.io/s/raw/files/b5f30b83dd6409b12a9113dca62f75ca.png?auto=format&dpr=1&w=1000',
        },
        EpicArcticFin: {
            title: 'Epic Arctic Fin',
            marketValue: '50 USD',
            image: 'https://i.seadn.io/s/raw/files/ad579adb4566c4203176f5a5b8748286.png?auto=format&dpr=1&w=1000',
        },
        EpicZothsAmulet: {
            title: "Zoth's Amulet",
            marketValue: '55 USD',
            image: 'https://i.seadn.io/s/raw/files/b894bc39670f99f427e1e5594c91c210.png?auto=format&dpr=1&w=1000',
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
