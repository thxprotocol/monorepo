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
            erc721TokenId: String,
            transactionId: String,
            erc721Id: String,
            erc721MetadataId: String,
            rewardId: String,
            claimedAt: Date,
        },
        { timestamps: true },
    ),
    'qrcodeentry',
);
