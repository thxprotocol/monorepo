import request from 'supertest';
import app from '@thxnetwork/api/';
import { ChainId } from '@thxnetwork/common/enums';
import { dashboardAccessToken } from '@thxnetwork/api/util/jest/constants';
import { afterAllCallback, beforeAllCallback } from '@thxnetwork/api/util/jest/config';

const user = request.agent(app);

describe('Default Pool', () => {
    let poolId: string;

    beforeAll(beforeAllCallback);
    afterAll(afterAllCallback);

    describe('POST /pools', () => {
        it('HTTP 201 (success)', async () => {
            const { body, status } = await user
                .post('/v1/pools')
                .set('Authorization', dashboardAccessToken)
                .send({ title: 'My Pool', chainId: ChainId.Hardhat });
            expect(status).toBe(201);
            poolId = body._id;
            expect(body.settings.title).toBe('My Pool');
        });
    });

    describe('PATCH /pools/:id', () => {
        it('HTTP 200', (done) => {
            user.patch('/v1/pools/' + poolId)
                .set({ 'X-PoolId': poolId, 'Authorization': dashboardAccessToken })
                .send({
                    settings: {
                        title: 'My Pool 2',
                    },
                })
                .expect(({ body }: request.Response) => {
                    expect(body.settings.title).toBe('My Pool 2');
                })
                .expect(200, done);
        });
    });

    describe('DELETE /pools/:id', () => {
        it('HTTP 204', (done) => {
            user.delete('/v1/pools/' + poolId)
                .set({ 'X-PoolId': poolId, 'Authorization': dashboardAccessToken })
                .expect(204, done);
        });
    });
});
