import crypto from 'crypto';
import TokenService from '../services/TokenService';
import MailService from '../services/MailService';
import { Request } from 'express';
import { authClient, getAuthAccessToken } from '@thxnetwork/api/util/auth';
import { BadRequestError, NotFoundError } from '../util/errors';
import { AccessTokenKind, AccountPlanType, AccountVariant, OAuthScope } from '@thxnetwork/common/enums';
import { AxiosRequestConfig } from 'axios';
import { supabaseClient } from '../util/supabase';
import { Account, AccountDocument, Wallet } from '../models';
import { Token } from '../models/Token';
import { accountVariantProviderMap, providerAccountVariantMap } from '@thxnetwork/common/maps';
import { toChecksumAddress } from 'web3-utils';
import { SUPABASE_JWT_SECRET } from '@thxnetwork/api/config/secrets';
import { logger } from '../util/logger';
import { UserIdentity } from '@supabase/supabase-js';
import { isObjectIdOrHexString } from 'mongoose';
import { isAddress } from 'ethers/lib/utils';

export function validateEmail(email: string) {
    return !!String(email)
        .toLowerCase()
        .match(
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        );
}

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

    async disconnect(account: TAccount, kind: AccessTokenKind) {
        return await TokenService.unset({ sub: account.sub, kind });
    }

    async findById(sub: string) {
        const account = await Account.findById(sub);
        return await this.decorate(account);
    }

    async findByRequest(req: Request) {
        const header = req.header('authorization');
        if (!header) return;

        const token = header.split(' ')[1];
        if (!token) return;

        const { data, error } = await supabase.auth.getUser(token);
        if (error) throw error;

        const { app_metadata, user_metadata, identities } = data.user;
        const provider = app_metadata.provider;
        let variant = user_metadata.variant;

        // user_metadata.variant can not be set through the client when using
        // OAuth flows so we update the user_metadata based on the provider
        // if no variant is found for the user. Should only occur once!
        if (typeof variant === 'undefined' && provider) {
            variant = providerAccountVariantMap[provider];

            await supabase.auth.admin.updateUserById(data.user.id, {
                user_metadata: { variant },
            });
        }
        // At this point an account variant should be determined
        if (typeof variant === 'undefined') throw new BadRequestError('Account variant not found.');

        // Prepare the account data
        let account: AccountDocument, email: string, address: string, providerUserId: string;
        switch (variant) {
            // Find the account for the email used in the OTP flow
            case AccountVariant.EmailPassword:
                email = user_metadata.email;
                account = await this.findByEmail(email);
                break;
            // Find the account for the address stored in authenticated user metadata
            case AccountVariant.Metamask:
                address = user_metadata.address;
                account = await this.findByAddress(address);
                break;
            case AccountVariant.SSOGoogle:
            case AccountVariant.SSOTwitter:
            case AccountVariant.SSODiscord:
            case AccountVariant.SSOTwitch:
            case AccountVariant.SSOGithub: {
                const provider = accountVariantProviderMap[variant];
                const identity = identities.find((identity) => identity.provider === provider);
                providerUserId = identity.id;
                account = await this.findByIdentity(variant, provider, identity);
                break;
            }
            default: {
                break;
            }
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

        return await this.decorate(account as AccountDocument);
    }

    async decorate(account: AccountDocument): Promise<TAccount> {
        if (!account) return;
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
                })) as TAccessToken[]
        );
    }

    async findByAddress(address: string) {
        return await Account.findOne({ address });
    }

    private async findByEmail(email: string) {
        return await Account.findOne({ email });
    }

    private async findByIdentity(variant: AccountVariant, kind: string, identity: UserIdentity) {
        const accounts = await Account.find({ variant, providerUserId: identity.id });
        if (!accounts.length) {
            logger.error(`No accounts found for OAuth login request`, { kind, providerUserId: identity.id });
            return;
        }
        if (accounts.length > 1) {
            logger.error(`Multiple accounts found for OAuth login request`, { kind, providerUserId: identity.id });
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
        let accounts = [];
        if (subs && subs.length) {
            accounts = await Account.find({ _id: { $in: subs } });
        } else if (query && query.length) {
            const conditions: any[] = [{ email: new RegExp(query, 'i') }, { username: new RegExp(query, 'i') }];
            if (isAddress(query)) {
                const wallets = await Wallet.find({ address: new RegExp(query, 'i') });
                const subs = wallets.map(({ sub }) => sub);
                conditions.push({ _id: { $in: subs } });
            } else if (isObjectIdOrHexString(query)) {
                conditions.push({ _id: query });
            }
            accounts = await Account.find({ $or: conditions });
        } else {
            return [];
        }

        return await Promise.all(accounts.map(async (account) => await this.decorate(account)));
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
                // Send email confirmation
                await MailService.sendEmailConfirmation(account, data.email);
            }
        }

        return await this.decorate(await Account.findByIdAndUpdate(account.id, data, { new: true }));
    }

    async getByDiscordId(discordId: string): Promise<TAccount> {
        const token = await Token.findOne({ kind: AccessTokenKind.Discord, userId: discordId });
        if (!token) return;
        const account = await Account.findById(token.sub);
        if (!account) return;
        return await this.decorate(account);
    }

    getByIdentity(identity: string): Promise<TAccount> {
        return Account.findOne({ identity });
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
