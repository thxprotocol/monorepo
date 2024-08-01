import { QuestVariant } from '@thxnetwork/common/enums';
import { PoolDocument, QuestSocialDocument } from '@thxnetwork/api/models';
import { logger } from '../util/logger';
import { sleep } from '../util';
import { Notification, Widget, Participant } from '@thxnetwork/api/models';
import { DiscordButtonVariant } from '../events/InteractionCreated';
import { ButtonStyle } from 'discord.js';
import { WIDGET_URL } from '../config/secrets';
import { celebratoryWords } from '../util/dictionaries';
import { Pool } from '@thxnetwork/api/models';
import { DASHBOARD_URL } from '../config/secrets';
import AccountProxy from '../proxies/AccountProxy';
import MailService from './MailService';
import PoolService from './PoolService';
import BrandService from './BrandService';
import DiscordDataProxy from '../proxies/DiscordDataProxy';
import AnalyticsService from '../services/AnalyticsService';
import { subDays } from 'date-fns';
import * as html from 'html-entities';
import DiscordService from './DiscordService';
import { QuestRequirement } from 'libs/sdk/src';

const MAIL_CHUNK_SIZE = 600;
const emojiMap = ['🥇', '🥈', '🥉'];

async function send(
    pool: PoolDocument,
    { subjectId, subject, message, link }: Partial<TNotification> & { link?: { src: string; text: string } },
) {
    const participants = await Participant.find({ poolId: pool._id, isSubscribed: true });
    const subs = participants.map((p) => p.sub);
    const accounts = (await AccountProxy.find({ subs })).filter((a) => a.email);

    // Create chunks for bulk email sending to avoid hitting Sendgrit rate limits
    for (let i = 0; i < subs.length; i += MAIL_CHUNK_SIZE) {
        const chunk = subs.slice(i, i + MAIL_CHUNK_SIZE);
        await Promise.all(
            chunk.map(async (sub) => {
                try {
                    // Make sure to not sent duplicate notifications
                    // for the same subjectId
                    const isNotifiedAlready = await Notification.exists({ sub, subjectId });
                    if (isNotifiedAlready) return;

                    const account = accounts.find((a) => a.sub === sub);
                    await MailService.send(account.email, subject, message, link);

                    await Notification.create({ sub, poolId: pool._id, subjectId, subject, message });
                } catch (error) {
                    logger.error(error);
                }
            }),
        );

        // Sleep 60 seconds before sending the next chunk
        await sleep(60);
    }
}

async function notify(variant: QuestVariant, quest: TQuest) {
    const [pool, brand, widget] = await Promise.all([
        PoolService.getById(quest.poolId),
        BrandService.get(quest.poolId),
        Widget.findOne({ poolId: quest.poolId }),
    ]);

    sendQuestPublishEmail(pool, variant, quest as TQuest, widget);
    sendQuestPublishNotification(pool, variant, quest as TQuest, widget, brand);
}

async function sendQuestPublishEmail(pool: PoolDocument, variant: QuestVariant, quest: TQuest, widget: TWidget) {
    const { amount, amounts } = quest as any;
    const subject = `🎁 New ${QuestVariant[variant]} Quest: Earn ${amounts ? amounts[0] : amount} pts!"`;
    const message = `<p style="font-size: 18px">Earn ${amounts ? amounts[0] : amount} points!🔔</p>
    <p>Hi! <strong>${pool.settings.title}</strong> just published a new ${QuestVariant[variant]} Quest.
    <p><strong>${quest.title}</strong><br />${quest.description}.</p>`;
    const src = WIDGET_URL + `/c/${pool.settings.slug}`;

    send(pool, {
        subjectId: quest.uuid,
        subject,
        message,
        link: { text: `Complete ${QuestVariant[variant]} Quest`, src },
    });
}

async function sendQuestPublishNotification(
    pool: PoolDocument,
    variant: QuestVariant,
    quest: TQuest,
    widget: TWidget,
    brand?: TBrand,
) {
    const theme = JSON.parse(widget.theme);
    const { amount, amounts } = quest as any;

    const embed = {
        title: html.decode(quest.title),
        description: html.decode(quest.description),
        author: {
            name: html.decode(pool.settings.title),
            icon_url: brand ? brand.logoImgUrl : '',
            url: widget.domain,
        },
        image: { url: quest.image },
        color: parseInt(theme.elements.btnBg.color.replace(/^#/, ''), 16),
        fields: [
            {
                name: 'Points',
                value: `${amounts ? amounts[0] : amount}`,
                inline: true,
            },
            {
                name: 'Type',
                value: `${QuestVariant[quest.variant]}`,
                inline: true,
            },
        ],
    };

    // Adding additional embeds for specific quest requirements
    const requirements = getQuestRequirements(quest, variant);
    if (requirements.length) {
        embed.fields.push(...requirements);
    }

    // Get notification configuration and send message in connected guilds
    const guilds = await DiscordService.getGuilds(pool.id);
    const defaultMessage = `Hi @everyone! We published a **${QuestVariant[variant]} Quest**.`;

    for (const guild of guilds) {
        const { message, channelId, isEnabled } = guild.notifications.questCreate;

        // If notification is not enabled continue
        if (!isEnabled) continue;

        await DiscordDataProxy.sendChannelMessage(
            channelId,
            message || defaultMessage,
            [embed],
            [
                {
                    customId: `${DiscordButtonVariant.QuestComplete}:${quest.variant}:${quest._id}`,
                    label: 'Complete Quest!',
                    style: ButtonStyle.Success,
                },
                { label: 'More Info', style: ButtonStyle.Link, url: WIDGET_URL + `/c/${pool.settings.slug}` },
            ],
        );
    }
}

function getQuestRequirements(quest: TQuest, variant: QuestVariant) {
    switch (variant) {
        case QuestVariant.Daily: {
            return [
                {
                    name: 'Requirement',
                    value: 'Visit and claim points daily!',
                    inline: false,
                },
            ];
        }
        case QuestVariant.Twitter: {
            const { interaction: interactionString, contentMetadata } = quest as QuestSocialDocument;
            const interaction = Number(interactionString);
            const metadata = JSON.parse(contentMetadata);
            if (interaction === QuestRequirement.TwitterRetweet) {
                return [
                    {
                        name: 'Requirement',
                        value: `[Repost & Like](${metadata.url})`,
                        inline: false,
                    },
                ];
            } else if (interaction === QuestRequirement.TwitterFollow) {
                return [
                    {
                        name: 'Requirement',
                        value: `[Follow ${metadata.name}](https://x.com/${metadata.username})`,
                        inline: false,
                    },
                ];
            } else if (interaction === QuestRequirement.TwitterQuery) {
                return [
                    {
                        name: 'Requirement',
                        value: `Make a post! Please click more info for it's requirements.`,
                        inline: false,
                    },
                ];
            }
            break;
        }
        default: {
            return [
                {
                    name: 'Requirement',
                    value: 'See quest description.',
                    inline: false,
                },
            ];
        }
    }
    return [];
}

async function sendQuestEntryNotification(pool: PoolDocument, quest: TQuest, account: TAccount, amount: number) {
    const index = Math.floor(Math.random() * celebratoryWords.length);
    const discord = account.tokens && account.tokens.find((a) => a.kind === 'discord');
    const user = discord && discord.userId ? `<@${discord.userId}>` : `**${account.username}**`;
    const guilds = await DiscordService.getGuilds(pool.id);
    const defaultMessage = `${celebratoryWords[index]} ${user} completed the **${html.decode(
        quest.title,
    )}** quest and earned **${amount} points.**`;

    for (const guild of guilds) {
        const { message, channelId, isEnabled } = guild.notifications.questEntryCreate;

        // If notification is not enabled continue
        if (!isEnabled) continue;

        await DiscordDataProxy.sendChannelMessage(
            channelId,
            message || defaultMessage,
            [],
            [{ label: 'More Info', style: ButtonStyle.Link, url: WIDGET_URL + `/c/${pool.settings.slug}/quests` }],
        );
    }
}

export async function sendWeeklyDigestJob() {
    const endDate = new Date();
    const startDate = subDays(endDate, 7);
    startDate.setHours(0, 0, 0, 0);

    const options = { startDate, endDate };
    const pools = await Pool.find({ 'settings.isWeeklyDigestEnabled': true });
    const subs = pools.map((p) => p.sub);
    const accounts = await AccountProxy.find({ subs });
    for (const pool of pools) {
        try {
            const account = accounts.find(({ sub }) => sub === pool.sub);
            if (!account || !account.email) continue;

            const {
                dailyQuest,
                socialQuest,
                inviteQuest,
                customQuest,
                web3Quest,
                gitcoinQuest,
                coinReward,
                nftReward,
                customReward,
                couponReward,
                discordRoleReward,
            } = await AnalyticsService.getPoolMetrics(pool, options);

            const leaderboardCache = await PoolService.getLeaderboardFromCache(pool, options);
            const leaderboard = await PoolService.getLeaderboardTop(leaderboardCache, 3);

            const entryCount = [dailyQuest, socialQuest, inviteQuest, customQuest, web3Quest, gitcoinQuest].reduce(
                (acc, entry) => acc + entry.totalCreated,
                0,
            );

            const paymentCount = [coinReward, nftReward, customReward, couponReward, discordRoleReward].reduce(
                (acc, payment) => acc + payment.totalCreated,
                0,
            );

            // Skip if nothing happened.
            if (!entryCount && !paymentCount) continue;

            let html = `<p style="font-size: 18px">Hi there!👋</p>`;
            html += `<p>We're pleased to bring you the <strong>Weekly Digest</strong> for "${pool.settings.title}".</p>`;
            html += `<hr />`;

            html += `<p><strong>🏆 Quests: </strong> ${entryCount} completed</p>`;
            html += `<hr />`;

            html += `<p><strong>🎁 Rewards: </strong> ${paymentCount} purchased</p>`;
            html += `<hr />`;

            html += `<p style="font-size:16px"><strong>Top 3</strong></p>`;
            html += `<p><table role="presentation" border="0" cellpadding="0" cellspacing="0">`;

            for (const index in leaderboard) {
                const entry = leaderboard[index];
                html += `<tr>
                <td width="5%">${emojiMap[index]}</td>
                <td><strong>${entry.account.username || 'Unknown'}</strong></td>
                <td align="right" width="25%"><strong>${entry.questEntryCount} quests</strong></td>
                <td align="right" width="25%"><strong>${entry.score} points</strong></td>
                </tr>`;
            }
            html += '</table></p>';
            html += `<a href="${DASHBOARD_URL}/pool/${pool.id}/participants">All participants</a>`;

            await MailService.send(account.email, `🎁 Weekly Digest: "${pool.settings.title}"`, html);
        } catch (error) {
            logger.error(error);
        }
    }
}

export default { send, notify, sendQuestEntryNotification, sendWeeklyDigestJob };
