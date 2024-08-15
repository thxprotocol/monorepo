import mongoose from 'mongoose';

export type TransactionDocument = mongoose.Document & TTransaction;

export const Transaction = mongoose.model<TransactionDocument>(
    'Transaction',
    new mongoose.Schema(
        {
            from: String,
            to: String,
            nonce: Number,
            walletId: String,
            data: String,
            transactionHash: String,
            safeTxHash: String,
            type: Number,
            state: { type: Number, index: { sparse: true } },
            chainId: Number,
            failReason: String,
            callback: {},
        },
        { timestamps: true },
    ),
    'transaction',
);
