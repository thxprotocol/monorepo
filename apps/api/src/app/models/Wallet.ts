import mongoose from 'mongoose';

export type WalletDocument = mongoose.Document & TWallet;

export const Wallet = mongoose.model<WalletDocument>(
    'Wallet',
    new mongoose.Schema(
        {
            uuid: String,
            expiresAt: Date,
            poolId: String,
            address: String,
            sub: { type: String, index: 'hashed' },
            chainId: Number,
            version: String,
            safeVersion: String,
            nonce: { default: 0, type: Number },
            variant: String,
            owners: [String],
        },
        { timestamps: true },
    ),
    'wallet',
);
