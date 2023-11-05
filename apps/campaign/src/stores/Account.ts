import { THXClient } from '@thxnetwork/sdk';
import { defineStore } from 'pinia';
import { API_URL } from '../config/secrets';
import { usePerkStore } from './Perk';
import { useRewardStore } from './Reward';
import { useWalletStore } from './Wallet';
import { track } from '@thxnetwork/mixpanel';
import { getStyles } from '../utils/theme';
import { useAuthStore } from './Auth';
import { getAccessTokenKindForPlatform, getConnectionStatus } from '../utils/social';
import { RewardConditionPlatform } from '../types/enums/rewards';
import { User } from 'oidc-client-ts';
import { AccountVariant } from '../types/enums/accountVariant';
import poll from 'promise-poller';

export const useAccountStore = defineStore('account', {
    state: (): TAccountState => ({
        poolId: '',
        isPreview: false,
        api: null,
        account: null,
        balance: 0,
        migration: null,
        subscription: null,
        config: {},
        sheet: null,
        isModalConnectSettingsShown: false,
        isAuthenticated: null,
        isRewardsLoaded: false,
        isEthereumBrowser: window.ethereum && window.matchMedia('(pointer:coarse)').matches, // Feature only available on mobile devices
    }),
    actions: {
        setConfig(poolId: string, config: TWidgetConfig) {
            this.poolId = poolId;
            this.config = { ...this.config, ...config };
        },
        setTheme(config: TWidgetConfig) {
            const { title, theme } = config;
            const { elements, colors } = JSON.parse(theme);
            const sheet = getStyles(elements, colors);
            document.title = title;
            this.sheet = document.head.appendChild(sheet);
        },
        reset() {
            this.poolId = '';
            this.api.setPoolId('');
            this.sheet?.remove();
        },
        getTheme() {
            return JSON.parse(this.config.theme);
        },
        async init(poolIdOrSlug: string, origin: string) {
            if (!this.api) {
                this.api = new THXClient({ url: API_URL, accessToken: '', poolId: '' });
                this.addEventListeners();
                this.setStatus(false);
                this.getUserData();
            }

            if (poolIdOrSlug) {
                const config = await this.api.request.get('/v1/widget/' + poolIdOrSlug);
                this.poolId = config.poolId;
                this.api.setPoolId(this.poolId);

                this.setConfig(config.poolId, { ...config, origin });
                this.setTheme(config);
                this.getCampaignData();

                track('UserVisits', [
                    this.account?.sub || '',
                    'page with widget',
                    { origin: this.config.origin, poolId: this.poolId },
                ]);

                if (window.top === window.self) {
                    track('UserOpens', [
                        this.account?.sub || '',
                        `widget iframe`,
                        { origin: this.config.origin, poolId: this.poolId, isShown: true },
                    ]);
                }
            }
        },
        onLoad() {
            // debugger;
        },
        addEventListeners() {
            const authStore = useAuthStore();

            authStore.userManager.events.addUserLoaded(this.onUserLoaded);
            authStore.userManager.events.addUserUnloaded(this.onUserUnloaded);
            authStore.userManager.events.load(this.onLoad);
            authStore
                .getUser()
                .then(() => {
                    if (!authStore.user) {
                        this.setStatus(null);
                    }
                })
                .catch((error) => {
                    this.setStatus(null);
                    console.log(error);
                });
        },
        async onUserLoaded(user: User) {
            const authStore = useAuthStore();
            if (user.access_token) this.api.setAccessToken(user.access_token);
            await authStore.onUserLoadedCallback(user);

            this.getUserData();

            if (this.poolId) {
                this.getCampaignData();
            }
        },
        onUserUnloaded() {
            return useAuthStore().onUserUnloadedCallback();
        },
        async getAccount() {
            this.account = await this.api.request.get('/v1/account');
        },
        async getBalance() {
            const { balance } = await this.api.pointBalance.list();
            this.balance = balance;
        },
        async subscribe(email: string) {
            this.subscription = await this.api.pools.subscription.post({ poolId: this.poolId, email });

            track('UserCreates', [
                this.account?.sub,
                'pool subscription',
                { poolId: this.poolId, origin: this.config.origin },
            ]);
        },
        async unsubscribe() {
            await this.api.pools.subscription.delete(this.poolId);
            this.subscription = null;

            track('UserCreates', [
                this.account?.sub,
                'pool unsubscription',
                { poolId: this.poolId, origin: this.config.origin },
            ]);
        },
        async getSubscription() {
            this.subscription = await this.api.pools.subscription.get(this.poolId);
        },
        connect(platform: RewardConditionPlatform) {
            return useAuthStore().requestOAuthShare({
                prompt: 'connect',
                channel: String(platform),
                access_token_kind: String(getAccessTokenKindForPlatform(platform)),
            });
        },
        waitForConnectionStatus(platform: RewardConditionPlatform) {
            const taskFn = async () => {
                if (!this.account) return;
                await this.getAccount();

                return getConnectionStatus(this.account as unknown as { [accessKey: string]: boolean }, platform)
                    ? Promise.resolve()
                    : Promise.reject('Could no validate connection status...');
            };
            return poll({
                taskFn,
                interval: 3000,
                retries: 20, // 3s * 20 = 60s
            });
        },
        signin(extraQueryParams?: { [key: string]: string }) {
            this.setStatus(false);
            return useAuthStore().requestOAuthShare(extraQueryParams);
        },
        async signout() {
            const { signout } = useAuthStore();
            await signout();
            this.setStatus(null);
            this.account = null;
        },
        async migrate(body: { erc20Id?: string; erc721Id?: string; erc721TokenId?: string }) {
            await this.api.request.post('/v1/account/wallet/migrate', { body: JSON.stringify(body) });
        },
        async getCampaignData() {
            if (!this.poolId) return;
            const questStore = useRewardStore();
            const rewardStore = usePerkStore();
            const authStore = useAuthStore();

            questStore.list().then(() => {
                const amount = questStore.quests.filter((r: any) => !r.isClaimed).length;
                this.isRewardsLoaded = true;
                // Send the amount of unclaimed rewards to the parent window and update the launcher
                this.postMessage({ message: 'thx.reward.amount', amount });
            });
            rewardStore.list();

            // Guard HTTP requests that do require auth
            if (!authStore.oAuthShare) return;

            await Promise.all([this.getBalance(), this.getSubscription()]);
        },
        async getUserData() {
            const walletStore = useWalletStore();
            const authStore = useAuthStore();

            // Guard HTTP requests that do require auth
            if (!authStore.oAuthShare) return;

            await this.getAccount();

            if (this.account && this.account.variant !== AccountVariant.Metamask) {
                authStore.getPrivateKey();
            }

            await walletStore.getWallet();
            walletStore.list();

            this.setStatus(true);
        },
        setStatus(isAuthenticated: boolean | null) {
            this.isAuthenticated = isAuthenticated;
            this.postMessage({ message: 'thx.auth.status', isAuthenticated });

            if (isAuthenticated) {
                track('UserSignsIn', [this.account, { origin, poolId: this.poolId }]);
            }
        },
        postMessage(payload: any) {
            if (this.config.origin && window.self !== window.top) {
                window.top?.postMessage(payload, this.config.origin);
            }
        },
        async updateAccountAddress() {
            const authStore = useAuthStore();
            if (!authStore.privateKey) return;

            // Patch the account with the MPC address
            const authRequestMessage = 'validate_account_address_ownership';
            const authRequestSignature = await authStore.sign(authRequestMessage);
            await this.api.account.patch({ authRequestMessage, authRequestSignature });
            if (this.account) this.account.address = authStore.wallet.address;
        },
    },
});
