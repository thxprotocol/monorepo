import mongoose from 'mongoose';
import NetworkService from '@thxnetwork/api/services/NetworkService';
import { getArtifact } from '../hardhat';

export type ERC1155Document = mongoose.Document & TERC1155;

const schema = new mongoose.Schema(
    {
        variant: String,
        chainId: Number,
        sub: String,
        name: String,
        description: String,
        transactions: [String],
        address: String,
        baseURL: String,
        archived: Boolean,
        logoImgUrl: String,
    },
    { timestamps: true },
);

schema.virtual('contract').get(function () {
    if (!this.address) return;
    const { web3, defaultAccount } = NetworkService.getProvider(this.chainId);
    const { abi } = getArtifact('THXERC1155');
    return new web3.eth.Contract(abi, this.address, { from: defaultAccount });
});

export const ERC1155 = mongoose.model<ERC1155Document>('ERC1155', schema, 'erc1155');
