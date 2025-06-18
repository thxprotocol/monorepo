import TelegramBot from 'node-telegram-bot-api';
import { logger } from '../util/logger';
import { TelegramUserActivity, TelegramUserReward } from '../models/QuestTelegram';
import { TELEGRAM_BOT_TOKEN, TELEGRAM_CHANNEL_ID, TELEGRAM_CHANNEL_CHAT_ID } from '../config/secrets';

class TelegramService {
    private bot: TelegramBot;
    private readonly POINTS = {
        JOIN: 10,
        MESSAGE: 5,
    };

    constructor() {
        if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHANNEL_ID || !TELEGRAM_CHANNEL_CHAT_ID) {
            throw new Error('Telegram bot token, channel ID, and channel chat ID are required');
        }

        this.bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: true });
        this.setupBotHandlers();
    }

    private setupBotHandlers() {
        // Handle new chat members
        this.bot.on('new_chat_members', async (msg) => {
            if (msg.chat.id.toString() === TELEGRAM_CHANNEL_CHAT_ID) {
                for (const member of msg.new_chat_members) {
                    await this.handleUserJoin(member, msg.chat.id.toString());
                }
            }
        });

        // Handle channel messages
        this.bot.on('message', async (msg) => {
            if (msg.chat.id.toString() === TELEGRAM_CHANNEL_CHAT_ID) {
                await this.handleUserMessage(msg);
            }
        });

        // Handle /register command
        this.bot.onText(/\/register/, async (msg) => {
            await this.handleUserRegistration(msg);
        });

        // Handle /points command
        this.bot.onText(/\/points/, async (msg) => {
            await this.handlePointsCheck(msg);
        });

        // Handle /stats command
        this.bot.onText(/\/stats/, async (msg) => {
            if (msg.chat.id.toString() === TELEGRAM_CHANNEL_CHAT_ID) {
                await this.handleStatsCheck(msg);
            }
        });

        // Error handling
        this.bot.on('polling_error', (error) => {
            logger.error('Telegram bot polling error:', error);
        });
    }

    private async handleUserJoin(member: TelegramBot.User, channelId: string) {
        try {
            const activity = new TelegramUserActivity({
                userId: member.id,
                username: member.username || 'unknown',
                firstName: member.first_name,
                lastName: member.last_name,
                activityType: 'JOIN',
                channelId,
                pointsEarned: this.POINTS.JOIN,
            });

            await activity.save();
            await this.updateUserRewards(member, 'JOIN');
            logger.info(`New member joined: ${member.first_name} (@${member.username})`);
        } catch (error) {
            logger.error('Error handling user join:', error);
        }
    }

    private async handleUserMessage(msg: TelegramBot.Message) {
        if (!msg.from) return;

        try {
            const activity = new TelegramUserActivity({
                userId: msg.from.id,
                username: msg.from.username || 'unknown',
                firstName: msg.from.first_name,
                lastName: msg.from.last_name,
                activityType: 'MESSAGE',
                messageId: msg.message_id,
                messageText: msg.text,
                channelId: msg.chat.id.toString(),
                pointsEarned: this.POINTS.MESSAGE,
            });

            await activity.save();
            await this.updateUserRewards(msg.from, 'MESSAGE');
        } catch (error) {
            logger.error('Error handling user message:', error);
        }
    }

    private async handleUserRegistration(msg: TelegramBot.Message) {
        if (!msg.from) return;

        try {
            const userReward = await TelegramUserReward.findOne({ userId: msg.from.id });

            if (userReward) {
                if (userReward.isRegistered) {
                    await this.bot.sendMessage(msg.chat.id, 'You are already registered!');
                    return;
                }
                userReward.isRegistered = true;
                await userReward.save();
            } else {
                await TelegramUserReward.create({
                    userId: msg.from.id,
                    username: msg.from.username || 'unknown',
                    isRegistered: true,
                });
            }

            await this.bot.sendMessage(msg.chat.id, 'Successfully registered for rewards!');
        } catch (error) {
            logger.error('Error handling user registration:', error);
            await this.bot.sendMessage(msg.chat.id, 'An error occurred during registration. Please try again later.');
        }
    }

    private async handlePointsCheck(msg: TelegramBot.Message) {
        if (!msg.from) return;

        try {
            const userReward = await TelegramUserReward.findOne({ userId: msg.from.id });

            if (!userReward) {
                await this.bot.sendMessage(
                    msg.chat.id,
                    'You are not registered for rewards. Use /register to start earning points!',
                );
                return;
            }

            const message = `
📊 Your Points Summary:
Total Points: ${userReward.totalPoints}
Points Today: ${userReward.pointsByDate.get(new Date().toISOString().split('T')[0]) || 0}

Activity Breakdown:
${Array.from(userReward.pointsByActivity.entries())
    .map(([activity, points]) => `${activity}: ${points} points`)
    .join('\n')}
            `;

            await this.bot.sendMessage(msg.chat.id, message);
        } catch (error) {
            logger.error('Error handling points check:', error);
            await this.bot.sendMessage(
                msg.chat.id,
                'An error occurred while fetching your points. Please try again later.',
            );
        }
    }

    private async handleStatsCheck(msg: TelegramBot.Message) {
        try {
            const today = new Date().toISOString().split('T')[0];
            const joinsToday = await TelegramUserActivity.countDocuments({
                activityType: 'JOIN',
                createdAt: { $gte: new Date(today) },
            });
            const totalJoins = await TelegramUserActivity.countDocuments({ activityType: 'JOIN' });
            const recentJoins = await TelegramUserActivity.find({ activityType: 'JOIN' })
                .sort({ createdAt: -1 })
                .limit(5);

            const statsMessage = `
📊 Channel Statistics:
Total Joins: ${totalJoins}
Joins Today: ${joinsToday}

Recent Joins:
${recentJoins.map((join) => `- ${join.firstName} (@${join.username}) - ${join.createdAt.toLocaleString()}`).join('\n')}
            `;

            await this.bot.sendMessage(msg.chat.id, statsMessage);
        } catch (error) {
            logger.error('Error handling stats check:', error);
            await this.bot.sendMessage(
                msg.chat.id,
                'An error occurred while fetching channel statistics. Please try again later.',
            );
        }
    }

    private async updateUserRewards(user: TelegramBot.User, activityType: 'JOIN' | 'MESSAGE') {
        const points = this.POINTS[activityType];
        const dateKey = new Date().toISOString().split('T')[0];

        try {
            const userReward = await TelegramUserReward.findOne({ userId: user.id });

            if (userReward) {
                userReward.totalPoints += points;
                userReward.lastActivityDate = new Date();

                // Update points by date
                const currentDatePoints = userReward.pointsByDate.get(dateKey) || 0;
                userReward.pointsByDate.set(dateKey, currentDatePoints + points);

                // Update points by activity
                const currentActivityPoints = userReward.pointsByActivity.get(activityType) || 0;
                userReward.pointsByActivity.set(activityType, currentActivityPoints + points);

                await userReward.save();
            } else {
                await TelegramUserReward.create({
                    userId: user.id,
                    username: user.username || 'unknown',
                    totalPoints: points,
                    pointsByDate: new Map([[dateKey, points]]),
                    pointsByActivity: new Map([[activityType, points]]),
                    lastActivityDate: new Date(),
                });
            }
        } catch (error) {
            logger.error('Error updating user rewards:', error);
        }
    }

    // API methods for frontend integration
    async getUserRewards(userId: number) {
        return TelegramUserReward.findOne({ userId });
    }

    async getUserActivities(userId: number, limit = 10) {
        return TelegramUserActivity.find({ userId }).sort({ createdAt: -1 }).limit(limit);
    }

    async getTopUsers(limit = 10) {
        return TelegramUserReward.find().sort({ totalPoints: -1 }).limit(limit);
    }
}

export const telegramService = new TelegramService();
