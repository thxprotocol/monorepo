import { Request } from 'express';
import { authClient, getAuthAccessToken } from '@thxnetwork/api/util/auth';
import { BadRequestError, NotFoundError } from '../util/errors';
import { AccessTokenKind, AccountPlanType, AccountVariant, OAuthScope } from '@thxnetwork/common/enums';
import { AxiosRequestConfig } from 'axios';
import { supabaseClient } from '../util/supabase';
import { Account, AccountDocument } from '../models';
import { Token } from '../models/Token';
import { accountVariantProviderMap, providerAccountVariantMap } from '@thxnetwork/common/maps';
import { toChecksumAddress } from 'web3-utils';
import { SUPABASE_JWT_SECRET } from '@thxnetwork/api/config/secrets';
import crypto from 'crypto';
import TokenService from '../services/TokenService';
import { logger } from '../util/logger';

export const supabase = supabaseClient();

class AccountProxy {
    async request(config: AxiosRequestConfig) {
        const header = await getAuthAccessToken();
        const { status, data } = await authClient({
            ...config,
            headers: {
                Authorization: header,
            },
        });

        if (status >= 400 && status <= 500 && data.error) {
            throw new BadRequestError(data.error.message);
        }

        return data;
    }

    async getToken(account: TAccount, kind: AccessTokenKind, requiredScopes: OAuthScope[] = []) {
        const token = await TokenService.get({ sub: account.sub, kind });
        if (token && requiredScopes.every((scope) => token.scopes.includes(scope))) return token;
    }

    disconnect(account: TAccount, kind: AccessTokenKind) {
        return this.request({
            method: 'DELETE',
            url: `/accounts/${account.sub}/tokens/${kind}`,
        });
    }

    async findById(sub: string) {
        return await Account.findById(sub);
    }

    async findByRequest(req: Request) {
        const header = req.header('authorization');
        if (!header) return;

        const token = header.split(' ')[1];
        if (!token) return;

        console.log({ token });

        const { data, error } = await supabase.auth.getUser(token);
        if (error) throw error;

        const provider = data.user.app_metadata.provider;
        const identities = data.user.identities;

        // Determine the provider used for the authentication request
        const isOAuthProvider = Object.values(accountVariantProviderMap).includes(provider as AccessTokenKind);
        const isEmailProvider = provider === 'email';

        let account, email, address, variant, providerUserId;

        // Find the account for the user login provider and provider user id
        if (isOAuthProvider) {
            variant = providerAccountVariantMap[provider];
            email = data.user.user_metadata.email;
            account = await this.findByIdentityUserId(variant, provider, identities[0].id);
            providerUserId = identities[0].id;
        }

        // Find the account for the email used in the OTP flow
        else if (isEmailProvider && !data.user.user_metadata.address) {
            variant = AccountVariant.EmailPassword;
            email = data.user.user_metadata.email;
            account = await this.findByEmail(email);
        }

        // Find the account for the address stored in authenticated user metadata
        else if (isEmailProvider && data.user.user_metadata.address) {
            variant = AccountVariant.Metamask;
            address = data.user.user_metadata.address;
            account = await this.findByAddress(address);
        }

        // If all of the above are skipped we create a new account
        if (!account) {
            account = await this.create({
                variant,
                providerUserId,
                email: email && email.toLowerCase(),
                address: address && toChecksumAddress(address),
                // We can assume emails are verified in case of OTP flows
                isEmailVerified: variant === AccountVariant.EmailPassword,
            });
        }

        return await this.decorate(account);
    }

    private async decorate(account: AccountDocument): Promise<TAccount> {
        return {
            profileImg: `https://api.dicebear.com/7.x/identicon/svg?seed=${account.id}`,
            username: '',
            ...account.toJSON(),
            sub: account.id,
            tokens: await this.findTokensBySub(account.id),
        };
    }

    private async findTokensBySub(sub: string) {
        const tokens = await Token.find({ sub });
        return (
            tokens
                // Filters out the social auth providers
                .filter(({ kind }) => Object.values(accountVariantProviderMap).includes(kind))
                // Removes sensitive access and refresh tokens
                .map(({ kind, userId, scopes, metadata }) => ({
                    kind,
                    userId,
                    scopes,
                    metadata,
                })) as TToken[]
        );
    }

    async findByAddress(address: string) {
        return await Account.findOne({ address });
    }

    private async findByEmail(email: string) {
        return await Account.findOne({ email });
    }

    private async findByIdentityUserId(variant: AccountVariant, kind: string, userId: string) {
        const accounts = await Account.find({ variant, providerUserId: userId });
        if (!accounts.length) {
            logger.error(`No accounts found for OAuth login request`, { kind, userId });
            return;
        }
        if (accounts.length > 1) {
            logger.error(`Multiple accounts found for OAuth login request`, { kind, userId });
            return;
        }
        return accounts[0];
    }

    private async create(data: Partial<TAccount>) {
        return await Account.create({
            plan: AccountPlanType.Lite,
            username: '',
            ...data,
        });
    }

    async find({ subs, query }: Partial<{ subs: string[]; query: string }>): Promise<TAccount[]> {
        if (subs && subs.length) {
            return await Account.find({ _id: { $in: subs } });
        } else if (query && query.length) {
            return await Account.find({
                $or: [{ username: new RegExp(query, 'i') }, { email: new RegExp(query, 'i') }],
            });
        } else {
            return [];
        }
    }

    async update(sub: string, data: Partial<TAccount>) {
        const account = await Account.findById(sub);
        if (!account) throw new NotFoundError('Account not found.');

        // Test username when changing username
        if (data.username && account.username !== data.username) {
            const isUsed = await Account.exists({
                username: data.username,
                _id: { $ne: data._id, $exists: true },
            });
            if (isUsed) throw new BadRequestError('Username already in use.');
        }

        // Send verification email when changing email
        if (data.email) {
            // Only check if email is different than the current one
            if (data.email !== account.email) {
                const isUsed = await Account.exists({
                    email: data.email,
                    _id: { $ne: String(account._id), $exists: true },
                });
                if (isUsed) throw new BadRequestError('Email already in use.');
                data.isEmailVerified = false;
            }
        }

        return await this.decorate(await Account.findByIdAndUpdate(account.id, data, { new: true }));
    }

    async getByDiscordId(discordId: string): Promise<TAccount> {
        const token = await Token.findOne({ kind: AccessTokenKind.Discord, userId: discordId });
        return await Account.findById(token.sub);
    }

    getByIdentity(identity: string): Promise<TAccount> {
        return Account.findById({ identity });
    }

    async isEmailDuplicate(email: string) {
        try {
            const accountExists = await Account.exists({ email: email.toLowerCase() });
            return !!accountExists;
        } catch (error) {
            if (error.response.status === 404) {
                return false;
            }
            throw error;
        }
    }

    createPassword(address: string) {
        const hmac = crypto.createHmac('sha256', SUPABASE_JWT_SECRET);
        hmac.update(address);
        return hmac.digest('hex');
    }

    remove(sub: string) {
        return Account.findByIdAndDelete(sub);
    }
}

export default new AccountProxy();
