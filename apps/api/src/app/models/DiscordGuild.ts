import mongoose from 'mongoose';

export type DiscordGuildDocument = mongoose.Document & TDiscordGuild;

export const DiscordGuild = mongoose.model<DiscordGuildDocument>(
    'DiscordGuild',
    new mongoose.Schema(
        {
            sub: String,
            poolId: String,
            guildId: String,
            // channelId: String,
            adminRoleId: String,
            name: String,
            secret: String,
            notifications: {
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
        },
        {
            timestamps: true,
        },
    ),
    'discordguild',
);
