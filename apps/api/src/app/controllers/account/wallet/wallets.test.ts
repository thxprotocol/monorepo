import app from '@thxnetwork/api/';
import { safeVersion } from '@thxnetwork/api/services/ContractService';
import Mock from '@thxnetwork/api/util/jest/config';
import { userWalletPrivateKey4 } from '@thxnetwork/api/util/jest/constants';
import { signMessage } from '@thxnetwork/api/util/jest/network';
import { ChainId, WalletVariant } from '@thxnetwork/common/enums';
import request from 'supertest';

const user = request.agent(app);

describe('Account Wallets', () => {
    beforeAll(() => Mock.beforeAll({ skipWalletCreation: true }));
    afterAll(() => Mock.afterAll());

    describe('GET /wallets', () => {
        it('HTTP 200 if OK', (done) => {
            user.get(`/v1/account/wallets`)
                .set({ Authorization: Mock.accounts[0].authHeader })
                .expect((res: request.Response) => {
                    expect(res.body.length).toEqual(0);
                })
                .expect(200, done);
        });
    });

    // Create Safe Wallet
    describe('POST /wallets (Safe)', () => {
        it('HTTP 200 if OK', (done) => {
            const message = 'test';
            const signature = signMessage(userWalletPrivateKey4, message);
            user.post(`/v1/account/wallets`)
                .set({ Authorization: Mock.accounts[0].authHeader })
                .send({
                    variant: WalletVariant.Safe,
                    message,
                    signature,
                    chainId: ChainId.Hardhat,
                })
                .expect(201, done);
        });
    });

    describe('POST /wallets (WalletConnect)', () => {
        it('HTTP 200 if OK', (done) => {
            const message = 'test';
            const signature = signMessage(userWalletPrivateKey4, message);
            user.post(`/v1/account/wallets`)
                .set({ Authorization: Mock.accounts[0].authHeader })
                .send({
                    variant: WalletVariant.WalletConnect,
                    message,
                    signature,
                })
                .expect(201, done);
        });
    });

    describe('GET /wallets (connected)', () => {
        it('HTTP 200 if OK', (done) => {
            const [account] = Mock.accounts;
            user.get('/v1/account/wallets')
                .set({ Authorization: account.authHeader })
                .expect((res: request.Response) => {
                    expect(res.body.length).toEqual(2);

                    const safe = res.body.find((wallet: any) => wallet.variant === WalletVariant.Safe);
                    const wallet = res.body.find((wallet: any) => wallet.variant === WalletVariant.WalletConnect);
                    expect(safe.sub).toEqual(account.sub);
                    expect(safe.chainId).toEqual(ChainId.Hardhat);
                    expect(safe.variant).toBe(WalletVariant.Safe);
                    expect(safe.address).toBeDefined();
                    expect(safe.safeVersion).toBe(safeVersion);

                    expect(wallet.sub).toEqual(account.sub);
                    expect(wallet.chainId).toBeUndefined();
                    expect(wallet.variant).toBe(WalletVariant.WalletConnect);
                    expect(wallet.address).toBeDefined();
                })
                .expect(200, done);
        });
    });

    describe('POST /wallets', () => {
        //
    });
});
