import mongoose from 'mongoose';
import NetworkService from '@thxnetwork/api/services/NetworkService';
import { getArtifact } from '../hardhat';

export type ERC721Document = mongoose.Document & TERC721;

const schema = new mongoose.Schema(
    {
        chainId: Number,
        sub: String,
        name: String,
        symbol: String,
        description: String,
        transactions: [String],
        address: String,
        baseURL: String,
        archived: Boolean,
        logoImgUrl: String,
        variant: String,
    },
    { timestamps: true },
);

schema.virtual('contract').get(function () {
    if (!this.address) return;
    const { web3 } = NetworkService.getProvider(this.chainId);
    const { abi } = getArtifact('THXERC721');
    return new web3.eth.Contract(abi, this.address);
});

export const ERC721 = mongoose.model<ERC721Document>('ERC721', schema, 'erc721');
