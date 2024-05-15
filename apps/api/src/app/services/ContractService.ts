import { ChainId } from '@thxnetwork/common/enums';
import { getProvider } from '@thxnetwork/api/util/network';
import { AbiItem } from 'web3-utils';
import { Contract } from 'web3-eth-contract';
import { TokenContractName } from '@thxnetwork/api/contracts';
import { SafeVersion } from '@safe-global/safe-core-sdk-types';
import { contractArtifacts } from '@thxnetwork/api/contracts';
import { ethers } from 'ethers';

export const safeVersion: SafeVersion = '1.3.0';

const getChainId = () => (process.env.NODE_ENV !== 'production' ? ChainId.Hardhat : ChainId.Polygon);
const getContract = (contractName: TokenContractName, chainId: ChainId, address: string) => {
    const { signer } = getProvider(chainId);
    return new ethers.Contract(address, contractArtifacts[contractName].abi, signer);
};

export const deploy = async (contractName: string, args: any[], signer: ethers.Signer): Promise<ethers.Contract> => {
    if (!contractArtifacts[contractName]) throw new Error('No artifact for contract name');
    const factory = new ethers.ContractFactory(
        contractArtifacts[contractName].abi,
        contractArtifacts[contractName].bytecode,
        signer,
    );
    return await factory.deploy(...args);
};

export const getContractFromAbi = (chainId: ChainId, abi: AbiItem[], address?: string): Contract => {
    const { web3 } = getProvider(chainId);
    return new web3.eth.Contract(abi, address) as unknown as Contract;
};

export const getAbiForContractName = (contractName: TokenContractName): AbiItem[] => {
    return require(`../contracts/abis/${contractName}.json`);
};

export const getByteCodeForContractName = (contractName: TokenContractName): string => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    return require(`../contracts/bytecodes/${contractName}.json`).bytecode;
};

export const getContractFromName = (chainId: ChainId, contractName: TokenContractName, address?: string) => {
    return getContractFromAbi(chainId, getAbiForContractName(contractName), address);
};

export { contractArtifacts, getChainId, getContract };
export default {
    getContractFromAbi,
    getAbiForContractName,
    getByteCodeForContractName,
    getContractFromName,
};
