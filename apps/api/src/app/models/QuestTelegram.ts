import mongoose, { Document, Schema } from 'mongoose';

export interface ITelegramUserActivity extends Document {
    userId: number;
    username: string;
    firstName: string;
    lastName?: string;
    activityType: 'JOIN' | 'MESSAGE';
    messageId?: number;
    messageText?: string;
    channelId: string;
    pointsEarned: number;
    createdAt: Date;
}

export interface ITelegramUserReward extends Document {
    userId: number;
    username: string;
    totalPoints: number;
    pointsByDate: Map<string, number>;
    pointsByActivity: Map<string, number>;
    isRegistered: boolean;
    lastActivityDate: Date;
    claimedRewards: string[];
}

const TelegramUserActivitySchema = new Schema<ITelegramUserActivity>(
    {
        userId: { type: Number, required: true },
        username: { type: String, required: true },
        firstName: { type: String, required: true },
        lastName: String,
        activityType: { type: String, required: true, enum: ['JOIN', 'MESSAGE'] },
        messageId: Number,
        messageText: String,
        channelId: { type: String, required: true },
        pointsEarned: { type: Number, required: true, default: 0 },
    },
    { timestamps: true },
);

const TelegramUserRewardSchema = new Schema<ITelegramUserReward>(
    {
        userId: { type: Number, required: true, unique: true },
        username: { type: String, required: true },
        totalPoints: { type: Number, required: true, default: 0 },
        pointsByDate: { type: Map, of: Number, default: new Map() },
        pointsByActivity: { type: Map, of: Number, default: new Map() },
        isRegistered: { type: Boolean, default: false },
        lastActivityDate: Date,
        claimedRewards: { type: [String], default: [] },
    },
    { timestamps: true },
);

export const TelegramUserActivity = mongoose.model<ITelegramUserActivity>(
    'TelegramUserActivity',
    TelegramUserActivitySchema,
);
export const TelegramUserReward = mongoose.model<ITelegramUserReward>('TelegramUserReward', TelegramUserRewardSchema);
