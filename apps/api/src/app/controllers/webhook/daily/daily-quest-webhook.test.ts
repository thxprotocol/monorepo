import request from 'supertest';
import app from '@thxnetwork/api/';
import Mock from '@thxnetwork/api/util/jest/config';
import { QuestVariant } from '@thxnetwork/common/enums';
import { QuestDailyDocument } from '@thxnetwork/api/models';
import { poll } from '@thxnetwork/api/util/polling';
import { Job } from '@thxnetwork/api/models/Job';
import { v4 } from 'uuid';

const user = request.agent(app);

describe('Daily Rewards WebHooks', () => {
    let poolId: string, dailyReward: QuestDailyDocument;
    const eventName = v4();

    beforeAll(() => Mock.beforeAll());
    afterAll(() => Mock.afterAll());

    it('POST /pools', (done) => {
        user.post('/v1/pools')
            .set('Authorization', Mock.accounts[0].authHeader)
            .send()
            .expect((res: request.Response) => {
                poolId = res.body._id;
            })
            .expect(201, done);
    });

    it('POST /daily-rewards', (done) => {
        user.post(`/v1/pools/${poolId}/quests/${QuestVariant.Daily}`)
            .set({ 'X-PoolId': poolId, 'Authorization': Mock.accounts[0].authHeader })
            .send({
                isPublished: true,
                variant: QuestVariant.Daily,
                title: 'Expiration date is next 30 min',
                description: 'Lorem ipsum dolor sit amet',
                amounts: JSON.stringify([100]),
                eventName,
                index: 0,
            })
            .expect(async ({ body }: request.Response) => {
                expect(body.uuid).toBeDefined();
                expect(body.eventName).toBeDefined();
                expect(body.amounts[0]).toBe(100);
                dailyReward = body;
            })
            .expect(201, done);
    });

    it('POST /webhook/daily/:uuid', async () => {
        const { status } = await user.post(`/v1/webhook/daily/${eventName}`).send({
            address: Mock.accounts[3].address,
        });
        expect(status).toBe(201);
    });

    it('GET /participant', async () => {
        const { status } = await user
            .get(`/v1/participants`)
            .query({ poolId })
            .set({ Authorization: Mock.accounts[3].authHeader });
        expect(status).toBe(200);
    });

    it('POST /quests/daily/:id/entries', async () => {
        const { status, body } = await user
            .post(`/v1/quests/daily/${dailyReward._id}/entries`)
            .set({ 'X-PoolId': poolId, 'Authorization': Mock.accounts[3].authHeader })
            .send({ recaptcha: 'test' });
        expect(body.jobId).toBeDefined();
        expect(status).toBe(200);

        await poll(
            () => Job.findById(body.jobId),
            (job: any) => !job.lastRunAt,
            1000,
        );

        const job = await Job.findById(body.jobId);
        expect(job.lastRunAt).toBeDefined();
    });

    it('POST /quests/daily/:id/entries should throw an error', (done) => {
        user.post(`/v1/quests/daily/${dailyReward._id}/entries`)
            .set({ 'X-PoolId': poolId, 'Authorization': Mock.accounts[3].authHeader })
            .send({ recaptcha: 'test' })
            .expect(({ body }: request.Response) => {
                expect(body.error).toBe('You have completed this quest within the last 24 hours.');
            })
            .expect(200, done);
    });
});
