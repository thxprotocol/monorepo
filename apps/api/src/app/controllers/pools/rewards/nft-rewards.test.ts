import app from '@thxnetwork/api/';
import { ERC721Document } from '@thxnetwork/api/models/ERC721';
import { ERC721MetadataDocument } from '@thxnetwork/api/models/ERC721Metadata';
import { RewardNFTDocument } from '@thxnetwork/api/models/RewardNFT';
import { addMinutes } from '@thxnetwork/api/util/date';
import Mock from '@thxnetwork/api/util/jest/config';
import { createImage } from '@thxnetwork/api/util/jest/images';
import { ChainId, RewardVariant } from '@thxnetwork/common/enums';
import request from 'supertest';

const user = request.agent(app);

describe('NFT Rewards', () => {
    let poolId: string, erc721metadata: ERC721MetadataDocument, erc721: ERC721Document, reward: RewardNFTDocument;

    beforeAll(() => Mock.beforeAll());
    afterAll(() => Mock.afterAll());

    it('POST /erc721', (done) => {
        const name = 'Planets of the Galaxy',
            symbol = 'GLXY',
            description = 'description';

        user.post('/v1/erc721')
            .set('Authorization', Mock.accounts[0].authHeader)
            .send({
                chainId: ChainId.Hardhat,
                name,
                symbol,
                description,
            })
            .expect(({ body }: request.Response) => {
                expect(body._id).toBeDefined();
                expect(body.address).toBeDefined();
                erc721 = body;
            })
            .expect(201, done);
    });

    it('POST /erc721/:id/metadata', (done) => {
        const config = {
            name: 'Lorem',
            description: 'Lorem ipsum dolor sit.',
            imageUrl: 'https://image.com',
            externalUrl: 'https://example.com',
        };

        user.post('/v1/erc721/' + erc721._id + '/metadata')
            .set('Authorization', Mock.accounts[0].authHeader)
            .send(config)
            .expect(({ body }: request.Response) => {
                expect(body._id).toBeDefined();
                expect(body.name).toBe(config.name);
                expect(body.description).toBe(config.description);
                expect(body.image).toBe(config.imageUrl);
                expect(body.externalUrl).toBe(config.externalUrl);
                erc721metadata = body;
            })
            .expect(201, done);
    });

    it('POST /pools', (done) => {
        user.post('/v1/pools')
            .set('Authorization', Mock.accounts[0].authHeader)
            .expect(({ body }: request.Response) => {
                poolId = body._id;
            })
            .expect(201, done);
    });

    // it('POST /wallets', async () => {
    //     let walletAddress;
    //     await user
    //         .post(`/v1/wallets`)
    //         .set('Authorization', Mock.accounts[0].authHeader)
    //         .send({
    //             chainId: ChainId.Hardhat,
    //         })
    //         .expect((res: request.Response) => {
    //             walletAddress = res.body.address;
    //         })
    //         .expect(201);
    //     const { web3 } = NetworkService.getProvider(ChainId.Hardhat);
    //     await poll(async () => {
    //         const code = await web3.eth.getCode(walletAddress);
    //         return code !== '0x';
    //     });
    //     expect(walletAddress).toBeDefined();
    // });

    it('POST /pools/:poolId/rewards/:variant', (done) => {
        const expiryDate = addMinutes(new Date(), 30);
        const image = createImage();
        const config = {
            title: 'Lorem',
            description: 'Lorem ipsum',
            erc721Id: String(erc721._id),
            metadataId: erc721metadata._id,
            pointPrice: 200,
            expiryDate: new Date(expiryDate).toISOString(),
            limit: 0,
            claimAmount: 0,
            isPromoted: true,
            variant: RewardVariant.NFT,
            isPublished: true,
        };
        user.post(`/v1/pools/${poolId}/rewards/${RewardVariant.NFT}`)
            .set('Authorization', Mock.accounts[0].authHeader)
            .attach('file', image, {
                filename: 'test.jpg',
                contentType: 'image/jpg',
            })
            .field(config)
            .expect((res: request.Response) => {
                expect(res.body.uuid).toBeDefined();
                expect(res.body.title).toBe(config.title);
                expect(res.body.description).toBe(config.description);
                expect(res.body.image).toBeDefined();
                expect(res.body.pointPrice).toBe(config.pointPrice);
                expect(new Date(res.body.expiryDate).getDate()).toBe(expiryDate.getDate());
                expect(res.body.limit).toBe(config.limit);
                expect(res.body.claimAmount).toBe(config.claimAmount);
                expect(res.body.isPromoted).toBe(config.isPromoted);
                expect(res.body.erc721Id).toBe(erc721._id);
                expect(res.body.metadataId).toBe(erc721metadata._id);
            })
            .expect(201, done);
    });

    it('GET /pools/:poolId/rewards?page=:page&limit=:limit', (done) => {
        user.get(`/v1/pools/${poolId}/rewards`)
            .query({ page: 1, limit: 10, isPublished: true })
            .set('Authorization', Mock.accounts[0].authHeader)
            .expect((res: request.Response) => {
                expect(res.body.results.length).toBe(1);
                expect(res.body.limit).toBe(10);
                expect(res.body.total).toBe(1);
                reward = res.body.results[0];
            })
            .expect(200, done);
    });

    it('DELETE /rewards/:id', (done) => {
        user.delete(`/v1/pools/${poolId}/rewards/${reward.variant}/${reward._id}`)
            .set('Authorization', Mock.accounts[0].authHeader)
            .expect(204, done);
    });
});
