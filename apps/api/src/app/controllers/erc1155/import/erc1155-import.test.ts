import request from 'supertest';
import app from '@thxnetwork/api/';
import { ChainId } from '@thxnetwork/common/enums';
import { afterAllCallback, beforeAllCallback } from '@thxnetwork/api/util/jest/config';
import { dashboardAccessToken, sub } from '@thxnetwork/api/util/jest/constants';
import { ERC1155Document } from '@thxnetwork/api/models/ERC1155';
import { alchemy } from '@thxnetwork/api/util/alchemy';
import { deployERC1155, mockGetNftsForOwner } from '@thxnetwork/api/util/jest/erc1155';
import { Contract } from 'web3-eth-contract';
import { ethers } from 'ethers';
import { WalletDocument } from '@thxnetwork/api/models';
import { poll } from 'ethers/lib/utils';
import NetworkService from '@thxnetwork/api/services/NetworkService';
import TransactionService from '@thxnetwork/api/services/TransactionService';

const user = request.agent(app);

describe('ERC1155 import', () => {
    let erc1155: ERC1155Document, wallet: WalletDocument, poolId: string, nftContract: Contract;
    const chainId = ChainId.Hardhat,
        nftName = 'Test Collection';

    beforeAll(beforeAllCallback);
    afterAll(afterAllCallback);

    it('POST /pools', (done) => {
        user.post('/v1/pools')
            .set('Authorization', dashboardAccessToken)
            .send({ chainId })
            .expect((res: request.Response) => {
                poolId = res.body._id;
            })
            .expect(201, done);
    });

    it('POST /pools/:poolId/wallets', async () => {
        await user
            .post(`/v1/pools/${poolId}/wallets`)
            .set('Authorization', dashboardAccessToken)
            .send({ chainId })
            .expect((res: request.Response) => {
                wallet = res.body;
            })
            .expect(201);
        const { web3 } = NetworkService.getProvider(ChainId.Hardhat);
        await poll(async () => {
            const code = await web3.eth.getCode(wallet.address);
            return code !== '0x';
        });
        expect(wallet.address).toBeDefined();
    });

    it('POST /erc1155/import`', async () => {
        // Create 1 NFT collection
        nftContract = await deployERC1155();
        const id = 1;
        const amount = 1;

        // Mint 1 token in the collection
        await TransactionService.sendAsync(
            nftContract.options.address,
            nftContract.methods.mint(wallet.address, id, amount, ethers.constants.HashZero),
            chainId,
        );

        // Mock Alchemy SDK return value for getNftsForOwner
        jest.spyOn(alchemy.nft, 'getNftsForOwner').mockImplementation(() =>
            Promise.resolve(mockGetNftsForOwner(nftContract.options.address) as any),
        );

        // Run the import for the deployed contract address
        await user
            .post('/v1/erc1155/import')
            .set({ Authorization: dashboardAccessToken })
            .send({ walletId: wallet._id, chainId, contractAddress: nftContract.options.address, name: nftName })
            .expect(201)
            .expect(({ body }: request.Response) => {
                console.log(body);
                expect(body.erc1155._id).toBeDefined();
                expect(body.erc1155.address).toBe(nftContract.options.address);

                erc1155 = body.erc1155;
            });
    });

    it('GET /erc1155/:id', (done) => {
        const { defaultAccount } = NetworkService.getProvider(chainId);
        user.get(`/v1/erc1155/${erc1155._id}`)
            .set('Authorization', dashboardAccessToken)
            .send()
            .expect(({ body }: request.Response) => {
                expect(body.chainId).toBe(chainId);
                expect(body.sub).toBe(sub);
                expect(body.name).toBe(nftName);
                expect(body.address).toBe(nftContract.options.address);
                expect(body.owner).toBe(defaultAccount);
            })
            .expect(200, done);
    });

    it('GET /erc1155/:id/metadata', (done) => {
        user.get(`/v1/erc1155/${erc1155._id}/metadata`)
            .set('Authorization', dashboardAccessToken)
            .send()
            .expect(({ body }: request.Response) => {
                expect(body.total).toBe(1);
                expect(body.results[0].name).toBeDefined();
                expect(body.results[0].description).toBeDefined();
                expect(body.results[0].image).toBeDefined();
            })
            .expect(200, done);
    });
});
