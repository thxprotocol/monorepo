import { defineStore } from 'pinia';
import { useAccountStore } from './Account';
import { track } from '@thxnetwork/common/lib/mixpanel';
import { HARDHAT_RPC, POLYGON_RPC } from '../config/secrets';
import { useAuthStore } from './Auth';
import { EthersAdapter, SafeConfig } from '@safe-global/protocol-kit';
import { ethers } from 'ethers';
import { ChainId } from '@thxnetwork/sdk/src/lib/types/enums/ChainId';
import { WalletVariant } from '../types/enums/accountVariant';
import { AUTH_URL, WALLET_CONNECT_PROJECT_ID, WIDGET_URL } from '../config/secrets';
import { createWeb3Modal, defaultWagmiConfig } from '@web3modal/wagmi';
import { sendTransaction, disconnect, watchAccount, signMessage, switchChain } from '@wagmi/core';
import { mainnet } from 'viem/chains';
import { chainList } from '../utils/chains';
import { RewardVariant } from '../types/enums/rewards';
import { encodeFunctionData } from 'viem';
import { contractNetworks } from '../config/constants';
import Safe from '@safe-global/protocol-kit';
import imgSafeLogo from '../assets/safe-logo.jpg';
import imgWalletConnectLogo from '../assets/walletconnect-logo.png';

type TRequestBodyApproval = {
    tokenAddress: string;
    spender: string;
    amountInWei: string;
};

export const walletLogoMap: { [variant: string]: string } = {
    [WalletVariant.WalletConnect]: imgWalletConnectLogo,
    [WalletVariant.Safe]: imgSafeLogo,
};

const rpcMap: { [chainId: number]: string } = {
    [ChainId.Hardhat]: HARDHAT_RPC,
    [ChainId.Polygon]: POLYGON_RPC,
};

const wagmiConfig = defaultWagmiConfig({
    chains: [mainnet, ...Object.values(chainList).map((item) => item.chain)],
    projectId: WALLET_CONNECT_PROJECT_ID,
    metadata: {
        name: 'THX Network',
        description: 'THX Network Campaign Discovery',
        url: WIDGET_URL,
        icons: [AUTH_URL + '/img/logo.png'],
    },
});

export const useWalletStore = defineStore('wallet', {
    state: (): TWalletState => ({
        modal: null,
        account: null,
        chainId: null,
        allowances: {},
        balances: {},
        erc20: [],
        erc721: [],
        erc1155: [],
        couponCodes: [],
        discordRoles: [],
        galachain: [],
        pendingPoints: 0,
        wallets: [],
        wallet: null,
        isLoading: true,
        isModalWalletCreateShown: false,
        isModalChainSwitchShown: false,
    }),
    actions: {
        createWeb3Modal() {
            if (this.modal) return;

            watchAccount(wagmiConfig, {
                onChange: (account) => {
                    this.account = account;
                },
            });

            this.modal = createWeb3Modal({
                wagmiConfig,
                projectId: WALLET_CONNECT_PROJECT_ID,
                themeMode: 'dark',
            });

            this.modal.subscribeState((state: { open: boolean; selectedNetworkId: ChainId }) => {
                this.chainId = state.selectedNetworkId;

                // Show chain modal if an account is connected but the desired chain is not the current chain
                this.isModalChainSwitchShown =
                    this.account && this.wallet && this.wallet.variant === WalletVariant.WalletConnect
                        ? this.wallet.chainId !== this.chainId
                        : false;
            });
        },
        switchChain(chainId: ChainId) {
            return switchChain(wagmiConfig, { chainId });
        },
        signMessage(message: string) {
            return signMessage(wagmiConfig, { message });
        },
        async connect() {
            this.createWeb3Modal();
            this.modal.open();
            await this.waitForAccount();
        },
        async disconnect() {
            this.account = null;
            await disconnect(wagmiConfig);
            this.modal.resetAccount();
            this.modal.resetNetwork();
            this.modal.close();
            this.modal = null;
        },
        async sendTransaction(from: string, to: `0x${string}`, data: `0x${string}`) {
            this.createWeb3Modal();

            if (!this.account || this.account.address !== from) {
                await this.connect();
            }

            if (this.chainId && this.chainId !== this.chainId) {
                await this.switchChain(this.chainId);
            }

            return sendTransaction(wagmiConfig, { to, data });
        },
        waitForAccount() {
            return new Promise((resolve: any) => {
                const interval = setInterval(() => {
                    if (
                        this.account &&
                        this.account.isConnected &&
                        this.wallet &&
                        this.account.address === this.wallet.address
                    ) {
                        clearInterval(interval);
                        resolve();
                    }
                }, 300);
            });
        },
        async create(data: { variant: WalletVariant; message?: string; signature?: string }) {
            const { api } = useAccountStore();
            await api.request.post('/v1/account/wallets', { data });
            await this.listWallets();
        },
        async setWallet(wallet: TWallet | null) {
            this.wallet = wallet;

            // Check if there are pending transactions and confirm them
            // This will always be a Safe wallet
            if (this.wallet && this.wallet.pendingTransactions.length) {
                await this.confirmTransactions(this.wallet.pendingTransactions);
            }
        },
        async listWallets() {
            const { api, account } = useAccountStore();
            if (!account) return;
            this.wallets = await api.request.get(`/v1/account/wallets`);
        },
        async getERC721Token({ _id }: TERC721Token) {
            const { api } = useAccountStore();
            const token = await api.erc721.get(_id);
            const index = this.erc721.findIndex((t) => t._id === token._id);

            this.erc721[index] = { ...token, component: 'BaseCardERC721' };
        },
        async list() {
            if (!this.wallet) return;
            const { api } = useAccountStore();
            this.isLoading = true;

            const [erc20, erc721, erc1155, payments] = await Promise.all([
                api.erc20.list({ walletId: this.wallet._id }),
                api.erc721.list({ walletId: this.wallet._id }),
                api.erc1155.list({ walletId: this.wallet._id }),
                api.request.get('/v1/rewards/payments'),
            ]);

            // TODO Refactor to using a component map with r.variant as key
            this.erc20 = erc20.map((t: TERC20Token) => ({ ...t, component: 'BaseCardERC20' }));
            this.erc721 = erc721.map((t: TERC721Token) => ({ ...t, component: 'BaseCardERC721' }));
            this.erc1155 = erc1155.map((t: TERC721Token) => ({ ...t, component: 'BaseCardERC721' }));
            this.couponCodes = payments
                .filter((p: { rewardVariant: RewardVariant }) => p.rewardVariant === RewardVariant.Coupon)
                .map((t: TRewardCouponPayment[]) => ({
                    ...t,
                    component: 'BaseCardCouponCode',
                }));
            this.discordRoles = payments
                .filter((p: { rewardVariant: RewardVariant }) => p.rewardVariant === RewardVariant.DiscordRole)
                .map((t: TRewardDiscordRolePayment[]) => ({
                    ...t,
                    component: 'BaseCardDiscordRole',
                }));
            this.galachain = payments
                .filter((p: { rewardVariant: RewardVariant }) => p.rewardVariant === RewardVariant.Galachain)
                .map((t: TRewardGalachainPayment[]) => ({
                    ...t,
                    component: 'BaseCardGalachain',
                }));

            this.isLoading = false;
        },
        async transferERC20(config: TERC20TransferConfig) {
            if (!this.wallet) return;

            const { api, account } = useAccountStore();
            const data = { walletId: this.wallet._id, ...config };
            const response = await api.request.post('/v1/erc20/transfer', { data });
            await this.confirmTransaction(response.safeTxHash);
            track('UserCreates', [account?.sub, 'erc20 transfer']);
        },
        async transfer(config: TNFTTransferConfig) {
            if (!this.wallet) return;

            const { api, account } = useAccountStore();
            const data = { walletId: this.wallet._id, ...config };

            let response;
            if (config.erc1155Id) {
                response = await api.request.post('/v1/erc1155/transfer', { data });
                track('UserCreates', [account?.sub, 'ERC1155 transfer']);
            }
            if (config.erc721Id) {
                response = await api.request.post('/v1/erc721/transfer', { data });
                track('UserCreates', [account?.sub, 'ERC721 transfer']);
            }

            await this.confirmTransaction(response.safeTxHash);
        },

        async confirmTransaction(safeTxHash: string) {
            if (!this.wallet || this.wallet.variant !== WalletVariant.Safe) return;

            const { api } = useAccountStore();
            const authStore = useAuthStore();

            if (!authStore.privateKey) {
                await authStore.getPrivateKey();
            }

            const rpc = rpcMap[this.wallet.chainId];
            const provider = new ethers.providers.JsonRpcProvider(rpc);
            const signer = new ethers.Wallet(authStore.privateKey, provider);
            const ethAdapter = new EthersAdapter({ ethers, signerOrProvider: signer }) as any;
            const config: SafeConfig = {
                ethAdapter,
                safeAddress: this.wallet.address,
                contractNetworks,
            };
            const safe = await Safe.create(config);
            const signature = await safe.signTransactionHash(safeTxHash);

            return await api.request.post(`/v1/account/wallets/confirm`, {
                data: JSON.stringify({ chainId: this.wallet.chainId, safeTxHash, signature: signature.data }),
                params: { walletId: this.wallet._id },
            });
        },
        async confirmTransactions(transactions: TTransaction[]) {
            for (const tx of transactions) {
                await this.confirmTransaction(tx.safeTxHash);
            }
        },
        async getBalance(tokenAddress: string) {
            if (!this.wallet || !tokenAddress) return;

            const { api } = useAccountStore();
            const { balanceInWei } = await api.request.get('/v1/erc20/balance', {
                params: { tokenAddress, walletId: this.wallet._id },
            });
            this.balances[tokenAddress] = balanceInWei;
        },
        async getApproval(params: { tokenAddress: string; spender: string }) {
            if (!this.wallet) return;

            const { api } = useAccountStore();
            const { allowanceInWei } = await api.request.get('/v1/erc20/allowance', {
                params: { ...params, walletId: this.wallet._id },
            });
            if (!this.allowances[params.tokenAddress]) this.allowances[params.tokenAddress] = {};
            this.allowances[params.tokenAddress][params.spender] = allowanceInWei;
        },
        async approve(data: TRequestBodyApproval) {
            if (!this.wallet) return;

            const map: { [variant: string]: (wallet: TWallet, data: TRequestBodyApproval) => Promise<void> } = {
                [WalletVariant.Safe]: this.approveSafe.bind(this),
                [WalletVariant.WalletConnect]: this.approveWalletConnect.bind(this),
            };

            return await map[this.wallet.variant](this.wallet, data);
        },
        async approveSafe(wallet: TWallet, data: TRequestBodyApproval) {
            const { api } = useAccountStore();
            const txs = await api.request.post('/v1/erc20/allowance', {
                data,
                params: { walletId: wallet._id },
            });

            await this.confirmTransactions(txs);
        },
        async approveWalletConnect(wallet: TWallet, data: TRequestBodyApproval) {
            // Prepare the contract call data
            const abi = [
                {
                    inputs: [
                        { name: 'spender', type: 'address' },
                        { name: 'amount', type: 'uint256' },
                    ],
                    name: 'approve',
                    outputs: [{ name: '', type: 'bool' }],
                    stateMutability: 'public',
                    type: 'function',
                },
            ];
            const call = this.encodeContractCall(data.tokenAddress, abi, 'approve', [data.spender, data.amountInWei]);

            // Sign and execute the transaction data
            await this.sendTransaction(wallet.address, call.to, call.data);
        },
        encodeContractCall(contractAddress: string, abi: any[], functionName: string, args: any[]) {
            return {
                to: contractAddress as `0x${string}`,
                data: encodeFunctionData({ abi, functionName, args }),
            };
        },
    },
});
