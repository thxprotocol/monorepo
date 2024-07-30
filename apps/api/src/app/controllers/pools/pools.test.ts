import request from 'supertest';
import app from '@thxnetwork/api/';
import Mock from '@thxnetwork/api/util/jest/config';

const user = request.agent(app);

describe('Default Pool', () => {
    let poolId: string;

    beforeAll(() => Mock.beforeAll());
    afterAll(() => Mock.afterAll());

    describe('POST /pools', () => {
        it('HTTP 201 (success)', async () => {
            const [account] = Mock.getAccounts();
            const { body, status } = await user
                .post('/v1/pools')
                .set('Authorization', account.authHeader)
                .send({ title: 'My Pool' });
            expect(status).toBe(201);
            poolId = body._id;
            expect(body.settings.title).toBe('My Pool');
        });
    });

    describe('PATCH /pools/:id', () => {
        it('HTTP 200', async () => {
            const [account] = Mock.getAccounts();
            await user
                .patch('/v1/pools/' + poolId)
                .set({ Authorization: account.authHeader })
                .send({ settings: { title: 'My Pool 2' } })
                .expect(({ body }: request.Response) => {
                    expect(body.settings.title).toBe('My Pool 2');
                })
                .expect(200);
        });
    });

    describe('DELETE /pools/:id', () => {
        it('HTTP 204', async () => {
            const [account] = await Mock.getAccounts();
            user.delete('/v1/pools/' + poolId)
                .set({ 'X-PoolId': poolId, 'Authorization': account.authHeader })
                .expect(204);
        });
    });
});
