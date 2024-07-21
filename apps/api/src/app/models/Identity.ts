import mongoose from 'mongoose';

export type IdentityDocument = mongoose.Document & TIdentity;

export const Identity = mongoose.model<IdentityDocument>(
    'Identity',
    new mongoose.Schema(
        {
            poolId: String,
            sub: String,
            uuid: { unique: true, type: String },
            accountId: String,
        },
        { timestamps: true },
    ),
    'identity',
);
