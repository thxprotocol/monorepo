import request from 'supertest';
import app from '@thxnetwork/api/';
import Mock from '@thxnetwork/api/util/jest/config';
import QuestService from '@thxnetwork/api/services/QuestService';
import { QuestSocialRequirement, QuestVariant } from '@thxnetwork/common/enums';
import { ChainId } from '@thxnetwork/common/enums';
import { contractNetworks } from '@thxnetwork/api/hardhat';
import { signMessage, waitForJob } from '@thxnetwork/api/util/jest/network';
import { userWalletPrivateKey4 } from '@thxnetwork/api/util/jest/constants';
import { QuestWeb3Entry } from '@thxnetwork/api/models';
import NetworkService from '@thxnetwork/api/services/NetworkService';

const user = request.agent(app);

describe('Default Pool', () => {
    let poolId: string;

    beforeAll(() => Mock.beforeAll());
    afterAll(() => Mock.afterAll());

    describe('POST /pools', () => {
        it('HTTP 201 (success)', async () => {
            const { body, status } = await user
                .post('/v1/pools')
                .set('Authorization', Mock.accounts[0].authHeader)
                .send({ title: 'My Pool' });
            expect(status).toBe(201);
            poolId = body._id;
            expect(body.settings.title).toBe('My Pool');
        });
    });

    describe('PATCH /pools/:id', () => {
        it('HTTP 200', async () => {
            await user
                .patch('/v1/pools/' + poolId)
                .set({ Authorization: Mock.accounts[0].authHeader })
                .send({ settings: { title: 'My Pool 2' } })
                .expect(({ body }: request.Response) => {
                    expect(body.settings.title).toBe('My Pool 2');
                })
                .expect(200);
        });
    });

    describe('DELETE /pools/:id', () => {
        it('HTTP 204', async () => {
            user.delete('/v1/pools/' + poolId)
                .set({ 'X-PoolId': poolId, 'Authorization': Mock.accounts[0].authHeader })
                .expect(204);
        });
    });

    // describe('Quest Web3', () => {
    //     let message, signature, wallet, account, quest;

    //     beforeAll(async () => {
    //         message = 'signing message';
    //         signature = signMessage(userWalletPrivateKey4, message);

    //         const { web3 } = NetworkService.getProvider(ChainId.Hardhat);
    //         wallet = web3.eth.accounts.privateKeyToAccount(userWalletPrivateKey4);
    //         account = Mock.accounts[3];
    //         quest = await QuestService.create(QuestVariant.Web3, poolId, {
    //             isPublished: true,
    //             title: 'Web3 Quest',
    //             amount: 10,
    //             methodName: 'balanceOf',
    //             threshold: '0',
    //             contracts: [{ address: contractNetworks[ChainId.Hardhat].THX, chainId: ChainId.Hardhat }],
    //         });
    //     });

    //     it('Create an entry', async () => {
    //         const { body, status } = await user
    //             .post(`/v1/quests/web3/${quest.id}/entries`)
    //             .set('Authorization', account.authHeader)
    //             .send({
    //                 message,
    //                 signature,
    //                 recaptcha: 'test',
    //                 chainId: ChainId.Hardhat,
    //             });
    //         expect(status).toBe(200);
    //         expect(body.jobId).toBeDefined();
    //         expect(await QuestWeb3Entry.find({ questId: quest.id, sub: account.sub })).toHaveLength(0);
    //         await waitForJob(body.jobId);

    //         const entry = await QuestWeb3Entry.findOne({ questId: quest.id, sub: account.sub });
    //         expect(entry).toBeDefined();
    //         expect(entry.metadata.address).toBe(wallet.address);
    //     });

    //     it('Create another entry for the same wallet', async () => {
    //         const { body, status } = await user
    //             .post(`/v1/quests/web3/${quest.id}/entries`)
    //             .set('Authorization', account.authHeader)
    //             .send({
    //                 message,
    //                 signature,
    //                 recaptcha: 'test',
    //                 chainId: ChainId.Hardhat,
    //             });
    //         expect(status).toBe(200);
    //         expect(body.error).toBe('You have completed this quest with this account and/or address already.');
    //     });
    // });
});
