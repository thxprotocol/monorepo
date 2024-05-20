import mongoose from 'mongoose';
import { ERC20Type } from '@thxnetwork/common/enums';
import { getProvider } from '@thxnetwork/api/util/network';
import { getArtifact, TContractName } from '../hardhat';

export type ERC20Document = mongoose.Document & TERC20;

const schema = new mongoose.Schema(
    {
        sub: String,
        type: Number,
        address: String,
        chainId: Number,
        name: String,
        symbol: String,
        transactions: [String],
        archived: Boolean,
        logoImgUrl: String,
    },
    { timestamps: true },
);

schema.virtual('contractName').get(function () {
    return getContractName(this.type) as TContractName;
});

schema.virtual('contract').get(function () {
    if (!this.address) return;
    const { web3, defaultAccount } = getProvider(this.chainId);
    const { abi } = getArtifact(getContractName(this.type));
    return new web3.eth.Contract(abi, this.address, { from: defaultAccount });
});

function getContractName(type: ERC20Type) {
    return type === ERC20Type.Unlimited ? 'THXERC20_UnlimitedSupply' : 'THXERC20_LimitedSupply';
}

export const ERC20 = mongoose.model<ERC20Document>('ERC20', schema, 'erc20');
