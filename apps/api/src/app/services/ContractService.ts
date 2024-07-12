import { ChainId } from '@thxnetwork/common/enums';
import NetworkService from '@thxnetwork/api/services/NetworkService';
import { TContractName, getArtifact } from '@thxnetwork/api/hardhat';
import { ethers } from 'ethers';

export const safeVersion = '1.3.0';

class ContractService {
    getContract(contractName: TContractName, chainId: ChainId, address: string) {
        const { signer } = NetworkService.getProvider(chainId);
        const artifact = getArtifact(contractName);
        return new ethers.Contract(address, artifact.abi, signer);
    }

    async deploy(contractName: TContractName, args: any[], signer: ethers.Signer): Promise<ethers.Contract> {
        const { abi, bytecode } = getArtifact(contractName);
        const factory = new ethers.ContractFactory(abi, bytecode, signer);
        const tx = await factory.deploy(...args);
        return new ethers.Contract(await tx.getAddress(), abi, signer);
    }
}

export default new ContractService();
