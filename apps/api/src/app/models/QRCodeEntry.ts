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
            // rewardId: String
            // amount: Number,
            erc721Id: String,
            erc721MetadataId: String,
            claimedAt: Date,
        },
        { timestamps: true },
    ),
    'qrcodeentry',
);
