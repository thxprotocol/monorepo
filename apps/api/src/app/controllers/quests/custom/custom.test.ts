import request from 'supertest';
import app from '@thxnetwork/api/';
import Mock from '@thxnetwork/api/util/jest/config';
import { v4 } from 'uuid';
import { QuestVariant } from '@thxnetwork/common/enums';
import { userWalletAddress2 } from '@thxnetwork/api/util/jest/constants';
import { PoolDocument, QuestCustom } from '@thxnetwork/api/models';

const user = request.agent(app);

describe('Quests Custom ', () => {
    let pool: PoolDocument, customQuest: TQuestCustom;
    const eventName = v4();

    beforeAll(() => Mock.beforeAll());
    afterAll(() => Mock.afterAll());

    it('POST /pools', (done) => {
        user.post('/v1/pools')
            .set('Authorization', Mock.accounts[0].authHeader)
            .send()
            .expect((res: request.Response) => {
                pool = res.body;
            })
            .expect(201, done);
    });

    it('POST /pools/:id/quests', (done) => {
        user.post(`/v1/pools/${pool._id}/quests/${QuestVariant.Custom}`)
            .set('Authorization', Mock.accounts[0].authHeader)
            .send({
                variant: QuestVariant.Custom,
                title: 'Expiration date is next 30 min',
                description: 'Lorem ipsum dolor sit amet',
                amount: 100,
                limit: 1,
                index: 0,
                eventName,
            })
            .expect(async (res: request.Response) => {
                expect(res.body.uuid).toBeDefined();
                expect(res.body.amount).toBe(100);
                customQuest = res.body;
                await QuestCustom.findByIdAndUpdate(customQuest._id, { eventName: customQuest.uuid });
            })
            .expect(201, done);
    });

    describe('Qualify (to be deprecated)', () => {
        it('POST /webhook/milestone/:token/claim', (done) => {
            user.post(`/v1/webhook/milestone/${customQuest.uuid}/claim`)
                .send({
                    address: userWalletAddress2,
                })
                .expect(201, done);
        });

        it('POST /webhook/milestone/:token/claim second time should also succeed', (done) => {
            user.post(`/v1/webhook/milestone/${customQuest.uuid}/claim`)
                .send({
                    address: userWalletAddress2,
                })
                .expect(201, done);
        });
    });

    describe('Collect', () => {
        it('GET /account to update identity', (done) => {
            user.get(`/v1/account`)
                .set({ 'X-PoolId': pool._id, 'Authorization': Mock.accounts[0].authHeader })
                .expect(200, done);
        });

        it('POST /quests/custom/:id/entries', async () => {
            const { status } = await user
                .post(`/v1/quests/custom/${customQuest._id}/entries`)
                .set({ 'X-PoolId': pool._id, 'Authorization': Mock.accounts[0].authHeader })
                .send({ recaptcha: 'test' });
            expect(status).toBe(200);
        });
    });
});
