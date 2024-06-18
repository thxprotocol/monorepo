import request from 'supertest';
import app from '@thxnetwork/api/';
import { afterAllCallback, beforeAllCallback } from '@thxnetwork/api/util/jest/config';
import { getProvider } from '@thxnetwork/api/util/network';
import { ChainId } from '@thxnetwork/common/enums';

describe('VESytem', () => {
    beforeAll(beforeAllCallback);
    afterAll(afterAllCallback);

    it('Deploy Tokens', async () => {
        //
    });
});
