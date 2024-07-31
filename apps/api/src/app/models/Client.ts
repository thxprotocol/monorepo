import mongoose from 'mongoose';

export type TClient = {
    sub: string;
    name: string;
    secret: string;
};

export type ClientDocument = mongoose.Document & TClient;

export const Client = mongoose.model<ClientDocument>(
    'Client',
    new mongoose.Schema(
        {
            sub: String,
            name: String,
            secret: String,
        },
        { timestamps: true },
    ),
    'client',
);
