import Safe, { EthersAdapter } from '@safe-global/protocol-kit';
import { useAccountStore } from './Account';
import { defineStore } from 'pinia';
import { track } from '@thxnetwork/common/mixpanel';
import { useAuthStore } from './Auth';
import { ChainId } from '@thxnetwork/common/enums';
import { WalletVariant } from '../types/enums/accountVariant';
import { AUTH_URL, POLYGON_RPC, WALLET_CONNECT_PROJECT_ID, WIDGET_URL } from '../config/secrets';
import { createWeb3Modal, defaultWagmiConfig } from '@web3modal/wagmi';
import {
    sendTransaction,
    disconnect,
    watchAccount,
    signMessage,
    switchChain,
    watchChainId,
    GetAccountReturnType,
    reconnect,
    getAccount,
    getChainId,
    watchConnections,
    waitForTransactionReceipt,
} from '@wagmi/core';
import { mainnet } from 'viem/chains';
import { chainList } from '../utils/chains';
import { RewardVariant } from '../types/enums/rewards';
import { encodeFunctionData } from 'viem';
import { ethers } from 'ethers';
import { abi } from '../utils/abi';
import { contractNetworks } from '../config/constants';
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

const wagmiConfig = defaultWagmiConfig({
    chains: [
        mainnet,
        ...Object.values(chainList)
            .map((item) => item.chain)
            .filter((chain) => chain !== mainnet),
    ],
    projectId: WALLET_CONNECT_PROJECT_ID,
    metadata: {
        name: 'THX Network',
        description: 'THX Network',
        url: WIDGET_URL,
        icons: [AUTH_URL + '/img/logo.png'],
    },
});

export const useWalletStore = defineStore('wallet', {
    state: (): TWalletState => ({
        modal: null,
        account: null,
        chainId: ChainId.Polygon,
        allowances: {},
        balances: {},
        erc20: [],
        erc721: [],
        erc1155: [],
        couponCodes: [],
        discordRoles: [],
        pendingPoints: 0,
        wallets: [],
        wallet: null,
        isLoading: true,
        isModalWalletCreateShown: false,
        isModalChainSwitchShown: false,
    }),
    actions: {
        reset() {
            this.modal = null;
            this.account = null;
            this.chainId = null;
            this.allowances = {};
            this.balances = {};
            this.erc20 = [];
            this.erc721 = [];
            this.erc1155 = [];
            this.couponCodes = [];
            this.discordRoles = [];
            this.pendingPoints = 0;
            this.wallets = [];
            this.wallet = null;
            this.isLoading = true;
        },
        async createWeb3Modal() {
            if (this.modal) return;

            await reconnect(wagmiConfig);

            watchAccount(wagmiConfig, {
                onChange: (account) => this.onChange({ account }),
            });

            watchChainId(wagmiConfig, {
                onChange: (chainId) => this.onChange({ chainId }),
            });

            watchConnections(wagmiConfig, {
                onChange(data) {
                    console.log('Connections changed!', data);
                },
            });

            this.modal = createWeb3Modal({
                wagmiConfig,
                projectId: WALLET_CONNECT_PROJECT_ID,
                themeMode: 'dark',
            });
        },
        onChange({ account, chainId }: { account?: GetAccountReturnType; chainId?: ChainId }) {
            if (account) this.account = account;
            if (chainId) this.chainId = chainId;

            // Return early if no wallet is selected
            if (!this.wallet) return;

            // Return early if not a walletconnect wallet
            const isWalletConnect = this.wallet.variant === WalletVariant.WalletConnect;
            if (!isWalletConnect) return;

            if (chainId) {
                this.switchChain(chainId);
            }
        },
        switchChain(chainId: ChainId) {
            return switchChain(wagmiConfig, { chainId });
        },
        signMessage(message: string) {
            if (!this.account.isConnected) {
                throw new Error('Please connect your wallet first!');
            }
            return signMessage(wagmiConfig, { message });
        },
        async connect() {
            await this.createWeb3Modal();
            this.modal.open({ view: 'account' });
        },
        async disconnect() {
            if (this.account) {
                await disconnect(wagmiConfig);
                this.account = null;
            }
            if (this.modal) {
                this.modal.resetAccount();
                this.modal.resetNetwork();
                this.modal.close();
                this.modal = null;
            }
        },
        async sendTransaction(from: string, to: `0x${string}`, data: `0x${string}`, chainId: ChainId, gas?: any) {
            await this.createWeb3Modal();

            if (
                !this.account ||
                !this.account.address ||
                !this.wallet ||
                this.wallet.address.toLowerCase() !== this.account.address.toLowerCase()
            ) {
                this.isModalChainSwitchShown = true;
                throw new Error(`Please connect address ${from}.`);
            }

            if (this.wallet && this.chainId !== chainId) {
                this.isModalChainSwitchShown = true;
                throw new Error(`Please set your network to ${chainId}.`);
            }

            return sendTransaction(wagmiConfig, { to, data, gas });
        },
        async create(data: { variant: WalletVariant; message?: string; signature?: string; chainId: ChainId }) {
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

            const account = getAccount(wagmiConfig);
            const chainId = getChainId(wagmiConfig);
            const isSafe = wallet && wallet.variant === WalletVariant.Safe;

            this.onChange({
                account,
                chainId: isSafe ? wallet.chainId : chainId,
            });
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

            this.erc721[index] = { ...token, component: 'BaseCardNFT' };
        },
        async list() {
            const { api } = useAccountStore();
            this.isLoading = true;

            const promises = [
                api.request.get('/v1/rewards/payments'),
                ...(this.wallet
                    ? [
                          api.erc20.list({ walletId: this.wallet._id, chainId: this.chainId }),
                          api.erc721.list({ walletId: this.wallet._id, chainId: this.chainId }),
                          api.erc1155.list({ walletId: this.wallet._id, chainId: this.chainId }),
                      ]
                    : []),
            ];

            const [payments, erc20, erc721, erc1155] = await Promise.all(promises);
            this.erc20 = erc20
                ? erc20.map((t: TERC20Token) => ({
                      ...t,
                      rewardVariant: RewardVariant.Coin,
                      component: 'BaseCardCoin',
                  }))
                : [];
            this.erc721 = erc721
                ? erc721.map((t: TERC721Token) => ({
                      ...t,
                      rewardVariant: RewardVariant.NFT,
                      component: 'BaseCardNFT',
                  }))
                : [];
            this.erc1155 = erc1155
                ? erc1155.map((t: TERC721Token) => ({
                      ...t,
                      rewardVariant: RewardVariant.NFT,
                      component: 'BaseCardNFT',
                  }))
                : [];
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

            const signature = await this.signSafeTXHash(this.wallet, safeTxHash);
            if (!signature) throw new Error('No signature');

            return await api.request.post(`/v1/account/wallets/confirm`, {
                data: JSON.stringify({ chainId: this.wallet.chainId, safeTxHash, signature }),
                params: { walletId: this.wallet._id },
            });
        },
        async signSafeTXHash(wallet: TWallet, safeTxHash: string) {
            const { privateKey } = useAuthStore();
            if (!privateKey) throw new Error('No private key');

            // Create Safe protocol kit
            const provider = new ethers.providers.JsonRpcProvider(POLYGON_RPC);
            const ethAdapter = new EthersAdapter({
                ethers,
                signerOrProvider: new ethers.Wallet(privateKey, provider),
            });
            const safe = await Safe.create({
                safeAddress: wallet.address,
                ethAdapter,
                contractNetworks,
            });
            const safeSignature = await safe.signTransactionHash(safeTxHash);
            return safeSignature.data;
        },
        waitForTransactionReceipt(hash: `0x${string}`) {
            return waitForTransactionReceipt(wagmiConfig, {
                hash,
                confirmations: 2,
                pollingInterval: 2_000,
            });
        },
        async confirmTransactions(transactions: TTransaction[]) {
            for (const tx of transactions) {
                await this.confirmTransaction(tx.safeTxHash);
            }
        },
        async getBalance(tokenAddress: string, chainId: ChainId) {
            if (!this.wallet || !tokenAddress) return;

            const { api } = useAccountStore();
            const { balanceInWei } = await api.request.get('/v1/erc20/balance', {
                params: { tokenAddress, walletId: this.wallet._id, chainId },
            });
            this.balances[tokenAddress] = balanceInWei;
        },
        async getApproval(params: { tokenAddress: string; spender: string; chainId: ChainId }) {
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
            const call = this.encodeContractCall(data.tokenAddress, abi.ERC20, 'approve', [
                data.spender,
                data.amountInWei,
            ]);

            // Sign and execute the transaction data
            const hash = await this.sendTransaction(wallet.address, call.to, call.data, this.chainId);
            await this.waitForTransactionReceipt(hash);
        },
        encodeContractCall(contractAddress: string, abi: any[], functionName: string, args: any[]) {
            return {
                to: contractAddress as `0x${string}`,
                data: encodeFunctionData({ abi, functionName, args }),
            };
        },
    },
});
