import { Document } from 'mongoose';
import { Participant, Pool, PoolDocument, TwitterUser } from '../models';
import { AccessTokenKind, WalletVariant } from '@thxnetwork/common/enums';
import { Wallet, DiscordUser } from '../models';
import { logger } from '../util/logger';
import ReCaptchaService from '@thxnetwork/api/services/ReCaptchaService';
import AnalyticsService from './AnalyticsService';
import AccountProxy from '../proxies/AccountProxy';

export default class ParticipantService {
    static async export(pool: PoolDocument) {
        const participants = await Participant.find({ poolId: pool.id });
        const subs = participants.map((p) => p.sub);
        const accounts = await AccountProxy.find({ subs });
        const wallets = await Wallet.find({ sub: { $in: subs }, variant: WalletVariant.WalletConnect });

        return participants.map((p) => {
            const account = accounts.find((a) => a.sub === p.sub);
            const accountWallets = wallets.filter((w) => w.sub === p.sub);
            const discord = account.tokens.find((t) => t.kind === 'discord');
            const twitter = account.tokens.find((t) => t.kind === 'twitter');
            const google = account.tokens.find((t) => t.kind === 'google');

            return {
                accountId: account.sub,
                points: p.balance,
                twitterId: twitter ? twitter.userId : '',
                discordId: discord ? discord.userId : '',
                googleId: google ? google.userId : '',
                username: account.username,
                email: account.email,
                wallets: accountWallets.length ? accountWallets.map((aw) => aw.address).join(' ') : '',
                createdAt: p.createdAt,
            };
        });
    }

    static async decorate(
        data: Document & (TQuestEntry | TRewardPayment),
        { accounts, participants }: { accounts: TAccount[]; participants: TParticipant[] },
    ) {
        const account = accounts.find((a) => a.sub === data.sub);
        const pointBalance = participants.find((p) => account.sub === String(p.sub));
        const tokens = await Promise.all(
            account.tokens.map(async (token: TAccessToken) => {
                if (token.kind !== 'twitter') return token;
                const user = await TwitterUser.findOne({ userId: token.userId });
                return { ...token, user };
            }),
        );

        return {
            ...data.toJSON(),
            account: { ...account, tokens },
            pointBalance: pointBalance ? pointBalance.balance : 0,
        };
    }

    static async updateRiskScore(
        account: TAccount,
        poolId: string,
        { token, recaptchaAction }: { token: string; recaptchaAction: string },
    ) {
        // Get risk score from Google
        const riskAnalysis = await ReCaptchaService.getRiskAnalysis({
            token,
            recaptchaAction,
        });

        // Update the participant's risk score
        return await Participant.findOneAndUpdate({ sub: account.sub, poolId }, { riskAnalysis }, { new: true });
    }

    static async findUser(token: TAccessToken, { userId, guildId }: { userId: string; guildId?: string }) {
        const userModelMap = {
            [AccessTokenKind.Twitter]: () => TwitterUser.findOne({ userId }),
            [AccessTokenKind.Discord]: () => DiscordUser.findOne({ userId, guildId }),
        };

        const user = userModelMap[token.kind] && (await userModelMap[token.kind]());

        return {
            kind: token.kind,
            userId: token.userId,
            metadata: token.metadata,
            user,
        } as unknown as TAccessToken;
    }

    static async updateRanksJob(job: TJob) {
        if (!job.attrs.data) return;

        try {
            const pool = await Pool.findById(job.attrs.data.poolId);
            const leaderboard = await AnalyticsService.createLeaderboard(pool);

            // Update ranks based on query result
            const updates = leaderboard.map(
                (entry: { sub: string; score: number; questEntryCount: number }, index: number) => ({
                    updateOne: {
                        filter: { poolId: String(pool._id), sub: entry.sub },
                        update: {
                            $set: {
                                rank: Number(index) + 1,
                                score: entry.score,
                                questEntryCount: entry.questEntryCount,
                            },
                        },
                    },
                }),
            );

            await Participant.bulkWrite(updates);

            logger.info('Updated participant ranks.');
        } catch (error) {
            logger.error(error);
        }
    }
}
