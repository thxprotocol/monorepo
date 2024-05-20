import { ChainId } from '@thxnetwork/common/enums';
import { getProvider } from '@thxnetwork/api/util/network';
import { SafeVersion } from '@safe-global/safe-core-sdk-types';
import { TContractName, getArtifact } from '@thxnetwork/api/hardhat';
import { ethers } from 'ethers';

export const safeVersion: SafeVersion = '1.3.0';

export default class ContractService {
    static getChainId() {
        return process.env.NODE_ENV !== 'production' ? ChainId.Hardhat : ChainId.Polygon;
    }

    static getContract(contractName: TContractName, chainId: ChainId, address: string) {
        const { signer } = getProvider(chainId);
        const artifact = getArtifact(contractName);
        return new ethers.Contract(address, artifact.abi, signer);
    }

    static async deploy(contractName: TContractName, args: any[], signer: ethers.Signer): Promise<ethers.Contract> {
        const { abi, bytecode } = getArtifact(contractName);
        const factory = new ethers.ContractFactory(abi, bytecode, signer);
        const tx = await factory.deploy(...args);
        return new ethers.Contract(await tx.getAddress(), abi, signer);
    }
}
