import mongoose from 'mongoose';
import { JobType } from '../util/agenda';

export type TwitterQueryDocument = mongoose.Document & TTwitterQuery;

const schema = new mongoose.Schema(
    {
        poolId: String,
        query: String,
        frequencyInHours: Number,
        operators: {
            from: [String],
            to: [String],
            text: [String],
            url: [String],
            hashtags: [String],
            mentions: [String],
            media: String,
            excludes: [String],
        },
        defaults: {
            title: String,
            description: String,
            amount: Number,
            isPublished: Boolean,
            expiryInDays: Number,
            locks: [{ questId: String, variant: Number }],
        },
    },
    { timestamps: true },
);

schema.virtual('jobName').get(function () {
    return `${JobType.CreateTwitterQuests}${this.id}`;
});

export const TwitterQuery = mongoose.model<TwitterQueryDocument>('TwitterQuery', schema, 'twitterquery');
