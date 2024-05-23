import mongoose from 'mongoose';

export type ParticipantDocument = mongoose.Document & TParticipant;

export const Participant = mongoose.model<ParticipantDocument>(
    'Participant',
    new mongoose.Schema(
        {
            sub: String,
            poolId: String,
            balance: { type: Number, default: 0 },
            rank: Number,
            score: Number,
            questEntryCount: Number,
            riskAnalysis: { score: Number, reasons: [String] },
            isSubscribed: { type: Boolean, default: false },
        },
        { timestamps: true },
    ),
    'participant',
);
