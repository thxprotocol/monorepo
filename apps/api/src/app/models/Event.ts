import mongoose from 'mongoose';

export type EventDocument = mongoose.Document & TEvent;

export const Event = mongoose.model<EventDocument>(
    'Event',
    new mongoose.Schema(
        {
            sub: String,
            identityId: String,
            name: String,
        },
        { timestamps: true },
    ),
    'event',
);
