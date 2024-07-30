import db from '@thxnetwork/api/util/database';
import { safeVersion } from '@thxnetwork/api/services/ContractService';
import { AccountPlanType, AccountVariant, ChainId, WalletVariant } from '@thxnetwork/common/enums';
import { userWalletAddress, userWalletAddress2, userWalletAddress3, userWalletAddress4 } from './constants';
import { Account, Wallet } from '@thxnetwork/api/models';
import { poll } from '../polling';
import { agenda } from '../agenda';
import { SUPABASE_JWT_SECRET } from '@thxnetwork/api/config/secrets';
import { supabase } from '@thxnetwork/api/proxies/AccountProxy';
import { User } from '@supabase/supabase-js';
import NetworkService from '@thxnetwork/api/services/NetworkService';
import SafeService from '@thxnetwork/api/services/SafeService';
import jwt from 'jsonwebtoken';
import nock from 'nock';

const user = {
    id: 'uuid_supabase',
    identities: [],
    app_metadata: { provider: 'email' },
    user_metadata: { email: '', address: '', variant: AccountVariant.EmailPassword },
} as unknown as User;

class Mock {
    public accounts = [];

    constructor() {
        jest.spyOn(supabase.auth, 'getUser').mockImplementation(async (token?: string) => {
            try {
                const { sub } = await jwt.verify(token, SUPABASE_JWT_SECRET);
                const account = this.accounts.find((account) => String(account._id) === sub);
                user.user_metadata.email = account.email;
                return {
                    data: { user },
                    error: null,
                };
            } catch (error) {
                console.error(error);
            }
        });

        jest.spyOn(supabase.auth.admin, 'updateUserById').mockResolvedValue({
            data: { user },
            error: null,
        });
    }

    url(method: string, baseUrl: string, path: string, status: number, callback: any = {}) {
        const n = nock(baseUrl).persist() as any;
        return n[method](path).reply(status, callback);
    }

    clear() {
        nock.cleanAll();
    }

    async beforeAll(options = { skipWalletCreation: false }) {
        // Wait for this hardhat log:
        const { web3 } = NetworkService.getProvider(ChainId.Hardhat);
        const lastDeployedContractAddress = '0x58C0e64cBB7E5C7D0201A3a5c2D899cC70B0dc4c';
        const fn = () => web3.eth.getCode(lastDeployedContractAddress);
        const fnCondition = (result: string) => result === '0x';
        await poll(fn, fnCondition, 500);

        // Add accounts with variant EmailPassword
        this.accounts = await Promise.all(
            [userWalletAddress, userWalletAddress2, userWalletAddress3].map(async (address) => {
                const account = await Account.create({
                    variant: AccountVariant.EmailPassword,
                    plan: AccountPlanType.Lite,
                });
                const email = `${account.id}@thx.network`;

                await account.updateOne({ email });

                return {
                    ...account.toJSON(),
                    email,
                    userWalletAddress: address,
                };
            }),
        );

        // Add account with variant Metamask
        const account = await Account.create({
            variant: AccountVariant.Metamask,
            plan: AccountPlanType.Lite,
            address: userWalletAddress4,
        });

        this.accounts.push({
            ...account.toJSON(),
            userWalletAddress: userWalletAddress4,
        });

        this.accounts = this.accounts.map((account) => ({
            ...account,
            sub: String(account._id),
            authHeader: `Bearer ${jwt.sign({ sub: String(account._id), email: account.email }, SUPABASE_JWT_SECRET)}`,
        }));

        // Create wallets for accounts
        if (!options.skipWalletCreation) {
            const chainId = ChainId.Hardhat;
            for (const entry of this.accounts) {
                switch (entry.variant) {
                    case AccountVariant.EmailPassword:
                        await SafeService.create({ sub: entry.id, chainId, safeVersion }, entry.userWalletAddress);
                        break;
                    case AccountVariant.Metamask:
                        await Wallet.create({
                            chainId,
                            sub: entry.id,
                            address: userWalletAddress4,
                            variant: WalletVariant.WalletConnect,
                        });
                        break;
                }
            }
        }
    }

    async afterAll() {
        await new Promise<void>((resolve) => {
            // Listen for 'complete' event
            agenda.on('complete', () => {
                resolve();
            });
        });
        await agenda.stop();
        await agenda.cancel({});
        await agenda.purge();
        await db.truncate();
    }
}

export default new Mock();
