import request from 'supertest';
import app from '@thxnetwork/api/';
import Mock from '@thxnetwork/api/util/jest/config';
import { ChainId, ERC20Type, RewardVariant } from '@thxnetwork/common/enums';
import { isAddress } from 'web3-utils';
import { addMinutes } from '@thxnetwork/api/util/date';
import { createImage } from '@thxnetwork/api/util/jest/images';
import { ERC20Document } from '@thxnetwork/api/models/ERC20';
import { RewardCoinDocument } from '@thxnetwork/api/models/RewardCoin';
import { poll } from 'ethers/lib/utils';
import NetworkService from '@thxnetwork/api/services/NetworkService';

const user = request.agent(app);

describe('Coin Rewards', () => {
    let poolId: string, erc20: ERC20Document, reward: RewardCoinDocument;

    beforeAll(() => Mock.beforeAll());
    afterAll(() => Mock.afterAll());

    it('POST /erc20', (done) => {
        user.post('/v1/erc20')
            .set('Authorization', Mock.accounts[0].authHeader)
            .send({
                chainId: ChainId.Hardhat,
                name: 'Token Name',
                symbol: 'SMBL',
                type: ERC20Type.Unlimited,
                totalSupply: 0,
            })
            .expect(({ body }: request.Response) => {
                erc20 = body;
                expect(isAddress(body.address)).toBe(true);
            })
            .expect(201, done);
    });

    it('POST /pools', (done) => {
        user.post('/v1/pools')
            .set('Authorization', Mock.accounts[0].authHeader)
            .expect((res: request.Response) => {
                poolId = res.body._id;
                expect(poolId).toBeDefined();
            })
            .expect(201, done);
    });

    it('POST /pools/:poolId/wallets', async () => {
        let walletAddress;
        await user
            .post(`/v1/pools/${poolId}/wallets`)
            .set('Authorization', Mock.accounts[0].authHeader)
            .send({
                chainId: ChainId.Hardhat,
            })
            .expect((res: request.Response) => {
                walletAddress = res.body.address;
            })
            .expect(201);
        const { web3 } = NetworkService.getProvider(ChainId.Hardhat);
        await poll(async () => {
            const code = await web3.eth.getCode(walletAddress);
            return code !== '0x';
        });
        expect(walletAddress).toBeDefined();
    });

    it('POST /pools/:poolId/rewards/:variant', (done) => {
        const title = 'Lorem',
            description = 'Ipsum',
            expiryDate = addMinutes(new Date(), 30),
            pointPrice = 200,
            image = createImage(),
            amount = '1',
            limit = 0,
            isPromoted = true,
            isPublished = true;
        user.post(`/v1/pools/${poolId}/rewards/${RewardVariant.Coin}`)
            .set('Authorization', Mock.accounts[0].authHeader)
            .attach('file', image, {
                filename: 'test.jpg',
                contentType: 'image/jpg',
            })
            .field({
                title,
                description,
                image,
                limit,
                pointPrice,
                expiryDate: new Date(expiryDate).toISOString(),
                amount,
                erc20Id: String(erc20._id),
                isPromoted,
                isPublished,
            })
            .expect((res: request.Response) => {
                expect(res.body.uuid).toBeDefined();
                expect(res.body.title).toBe(title);
                expect(res.body.description).toBe(description);
                expect(res.body.image).toBeDefined();
                expect(res.body.amount).toBe(amount);
                expect(res.body.pointPrice).toBe(pointPrice);
                expect(new Date(res.body.expiryDate).getDate()).toBe(expiryDate.getDate());
                expect(res.body.limit).toBe(limit);
                expect(res.body.isPromoted).toBe(true);
            })
            .expect(201, done);
    });

    it('GET /pools/:poolId/rewards', (done) => {
        user.get(`/v1/pools/${poolId}/rewards`)
            .set('Authorization', Mock.accounts[0].authHeader)
            .query({ page: 1, limit: 10, isPublished: true })
            .expect((res: request.Response) => {
                expect(res.body.results.length).toBe(1);
                expect(res.body.limit).toBe(10);
                expect(res.body.total).toBe(1);
                reward = res.body.results[0];
            })
            .expect(200, done);
    });

    it('DELETE /pools/:poolId/rewards/:variant', (done) => {
        user.delete(`/v1/pools/${poolId}/rewards/${reward.variant}/${reward._id}`)
            .set('Authorization', Mock.accounts[0].authHeader)
            .expect(204, done);
    });
});
