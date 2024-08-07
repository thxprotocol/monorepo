import mongoose from 'mongoose';
import { questEntrySchema } from './Quest';

export type QuestSocialEntryDocument = mongoose.Document & TQuestSocialEntry;

export const QuestSocialEntry = mongoose.model<QuestSocialEntryDocument>(
    'QuestSocialEntry',
    new mongoose.Schema(
        {
            ...questEntrySchema,
            metadata: {
                platformUserId: String,
                twitter: {
                    followersCount: Number,
                    followingCount: Number,
                    tweetCount: Number,
                    listedCount: Number,
                    likeCount: Number,
                },
                discord: {
                    guildId: String,
                    username: String,
                    joinedAt: Date,
                    messageCount: Number,
                    reactionCount: Number,
                },
            },
        },
        { timestamps: true },
    ),
    'questsocialentry',
);
