import mongoose from 'mongoose';

export type DiscordGuildDocument = mongoose.Document & TDiscordGuild;

export const DiscordGuild = mongoose.model<DiscordGuildDocument>(
    'DiscordGuild',
    new mongoose.Schema(
        {
            sub: String,
            poolId: String,
            guildId: String,
            adminRoleId: String,
            name: String,
            secret: String,
            notifications: {
                type: {
                    questCreate: {
                        isEnabled: Boolean,
                        message: String,
                        channelId: String,
                    },
                    questEntryCreate: {
                        isEnabled: Boolean,
                        message: String,
                        channelId: String,
                    },
                },
                default: {
                    questCreate: {
                        isEnabled: false,
                        message: '',
                        channelId: '',
                    },
                    questEntryCreate: {
                        isEnabled: false,
                        message: '',
                        channelId: '',
                    },
                },
            },
        },
        {
            timestamps: true,
        },
    ),
    'discordguild',
);
