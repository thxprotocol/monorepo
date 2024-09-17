import mongoose from 'mongoose';

export type QRCodeEntryDocument = mongoose.Document & TQRCodeEntry;

export const QRCodeEntry = mongoose.model<QRCodeEntryDocument>(
    'QRCodeEntry',
    new mongoose.Schema(
        {
            accountId: String,
            sub: String,
            uuid: String,
            redirectURL: String,
            rewardId: String,
            amount: Number,
            claimedAt: Date,
        },
        { timestamps: true },
    ),
    'qrcodeentry',
);
