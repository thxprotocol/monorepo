import { API_URL, MINIMUM_GAS_LIMIT, VERSION } from '@thxnetwork/api/config/secrets';
import { ChainId } from '@thxnetwork/common/enums';
import { getArtifact } from '@thxnetwork/api/hardhat';
import NetworkService from '../../services/NetworkService';

export async function deployERC721(nftName: string, nftSymbol: string) {
    const { web3, defaultAccount } = NetworkService.getProvider(ChainId.Hardhat);
    const contractName = 'THXERC721';
    const { abi, bytecode } = getArtifact(contractName);
    const contract = new web3.eth.Contract(abi);
    const baseURL = `${API_URL}/${VERSION}/erc721/metadata/`;
    const fn = contract.deploy({
        data: bytecode,
        arguments: [nftName, nftSymbol, baseURL, defaultAccount],
    });
    const data = fn.encodeABI();
    const estimate = await fn.estimateGas({ from: defaultAccount });
    const gas = estimate < Number(MINIMUM_GAS_LIMIT) ? MINIMUM_GAS_LIMIT : estimate;
    const receipt = await web3.eth.sendTransaction({
        from: defaultAccount,
        to: null,
        data,
        gas,
    });

    contract.options.address = receipt.contractAddress;

    return contract;
}

export const mockGetNftsForOwner = (contractAddress: string, nftName: string, nftSymbol: string) => {
    return {
        ownedNfts: [
            {
                contract: {
                    address: contractAddress,
                    name: nftName,
                    symbol: nftSymbol,
                },
                tokenId: '1',
                tokenUri: 'https://ipfs.io/ipfs/QmRvCinGkzqDdmSZ3PzQRyHbQVqaFLTDyfyMMD54Bwcjsi',
                rawMetadata: {
                    name: '#1',
                    description: 'image description piece #1',
                    image: 'https://gateway.pinata.cloud/ipfs/QmemtAVJMkfUj3bAXee1H7vccbX6nC6Vbkbu6gBjdn1Kdh/1.png',
                },
                name: 'Test Collection',
                description: 'Test Collection description',
                image: {
                    originalUrl: 'ipfs://QmRvCinGkzqDdmSZ3PzQRyHbQVqaFLTDyfyMMD54Bwcjsi/1.png',
                },
                collection: {
                    externalUrl: 'https://example.com',
                },
            },
        ],
        pageKey: 1,
        totalCount: 1,
    };
};
