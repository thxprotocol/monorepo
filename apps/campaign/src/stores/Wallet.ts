import { defineStore } from 'pinia';
import { useAccountStore } from './Account';
import { track } from '@thxnetwork/mixpanel';
import { BPT_ADDRESS, HARDHAT_RPC, POLYGON_RPC } from '../config/secrets';
import { useAuthStore } from './Auth';
import { EthersAdapter, SafeConfig } from '@safe-global/protocol-kit';
import { ethers } from 'ethers';
import { ChainId } from '@thxnetwork/sdk/src/lib/types/enums/ChainId';
import { WalletVariant } from '../types/enums/accountVariant';
import Safe from '@safe-global/protocol-kit';
import imgSafeLogo from '../assets/safe-logo.jpg';
import imgWalletConnectLogo from '../assets/walletconnect-logo.png';
import { AUTH_URL, WALLET_CONNECT_PROJECT_ID, WIDGET_URL } from '../config/secrets';
import { createWeb3Modal, defaultWagmiConfig } from '@web3modal/wagmi';
import { watchAccount, signMessage, switchChain } from '@wagmi/core';
import { mainnet } from 'viem/chains';
import { chainList } from '../utils/chains';
import { RewardVariant } from '../types/enums/rewards';

type TRequestParamsAllowance = {
    tokenAddress: string;
    spender: string;
    amountInWei: string;
};

type TRequestBodyApproval = {
    tokenAddress: string;
    spender: string;
    amountInWei: string;
};

export const walletLogoMap: { [variant: string]: string } = {
    [WalletVariant.WalletConnect]: imgWalletConnectLogo,
    [WalletVariant.Safe]: imgSafeLogo,
};

// Safe Contracts
const GnosisSafeProxyFactoryAddress = '0x1122fD9eBB2a8E7c181Cc77705d2B4cA5D72988A';
const CompatibilityFallbackHandlerAddress = '0x5D3D550Da6678C0444F5D77Ca086678D9CdeEecA';
const CreateCallAddress = '0x40Efd8a16485213445E6d8b9a4266Fd2dFf7C69a';
const MultiSendAddress = '0x7E4728eFfC9376CC7C0EfBCc779cC9833D83a984';
const MultiSendCallOnlyAddress = '0x75Cbb6C4Db4Bb4f6F8D5F56072A6cF4Bf4C5413C';
const SignMessageLibAddress = '0x658FAD2acB6d1E615f295E566ee9a6d32Cc97b10';
const GnosisSafeL2Address = '0xC44951780f195Ed71145e3d0d2F25726A097C348';

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
        pendingPoints: 0,
        wallets: [],
        wallet: null,
        isLoading: true,
        isModalWalletCreateShown: false,
    }),
    actions: {
        createWeb3Modal() {
            if (this.modal) return;

            watchAccount(wagmiConfig, {
                onChange: (account) => {
                    console.log(account);
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
            });
        },
        switchChain(chainId: ChainId) {
            return switchChain(wagmiConfig, { chainId });
        },
        signMessage(message: string) {
            return signMessage(wagmiConfig, { message });
        },
        async create(data: { variant: WalletVariant; message?: string; signature?: string }) {
            const { api } = useAccountStore();
            await api.request.post('/v1/account/wallets', { data });
            await this.listWallets();
        },
        async setWallet(wallet: TWallet | null) {
            this.wallet = wallet;

            // Check if there are pending transactions and confirm them
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

            this.erc20 = erc20.map((t: TERC20Token) => ({ ...t, component: 'BaseCardERC20' }));
            this.erc721 = erc721.map((t: TERC721Token) => ({ ...t, component: 'BaseCardERC721' }));
            this.erc1155 = erc1155.map((t: TERC721Token) => ({ ...t, component: 'BaseCardERC721' }));
            this.couponCodes = payments
                .filter((p) => p.rewardVariant === RewardVariant.Coupon)
                .map((t: TRewardCouponPayment[]) => ({
                    ...t,
                    component: 'BaseCardCouponCode',
                }));
            this.discordRoles = payments
                .filter((p) => p.rewardVariant === RewardVariant.DiscordRole)
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
        getRPC(chainId: ChainId) {
            switch (chainId) {
                default:
                case ChainId.Hardhat:
                    return {
                        url: HARDHAT_RPC,
                        contractNetworks: {
                            '31337': {
                                safeMasterCopyAddress: GnosisSafeL2Address,
                                safeProxyFactoryAddress: GnosisSafeProxyFactoryAddress,
                                multiSendAddress: MultiSendAddress,
                                multiSendCallOnlyAddress: MultiSendCallOnlyAddress,
                                fallbackHandlerAddress: CompatibilityFallbackHandlerAddress,
                                signMessageLibAddress: SignMessageLibAddress,
                                createCallAddress: CreateCallAddress,
                                simulateTxAccessorAddress: '0x',
                            },
                        },
                    };
                case ChainId.Polygon:
                    return { url: POLYGON_RPC };
            }
        },
        async confirmTransaction(safeTxHash: string) {
            if (!this.wallet || this.wallet.variant !== WalletVariant.Safe) return;

            const { api } = useAccountStore();
            const authStore = useAuthStore();

            if (!authStore.privateKey) {
                await authStore.getPrivateKey();
            }

            const rpc = this.getRPC(this.wallet.chainId);
            const provider = new ethers.providers.JsonRpcProvider(rpc.url);
            const signer = new ethers.Wallet(authStore.privateKey, provider);
            const ethAdapter = new EthersAdapter({ ethers, signerOrProvider: signer }) as any;
            const config: SafeConfig = {
                ethAdapter,
                safeAddress: this.wallet.address,
                contractNetworks: rpc.contractNetworks,
            };
            const safe = await Safe.create(config);
            const signature = await safe.signTransactionHash(safeTxHash);

            return await api.request.post(`/v1/account/wallets/confirm`, {
                data: JSON.stringify({ chainId: this.wallet.chainId, safeTxHash, signature: signature.data }),
            });
        },
        async confirmTransactions(transactions: TTransaction[]) {
            for (const tx of transactions) {
                await this.confirmTransaction(tx.safeTxHash);
            }
        },
        async getBalance(tokenAddress: string) {
            if (!tokenAddress) return;

            const { api } = useAccountStore();
            const { balanceInWei } = await api.request.get('/v1/erc20/balance', {
                params: { tokenAddress },
            });
            this.balances[tokenAddress] = Number(balanceInWei);
        },
        async getApproval(params: TRequestParamsAllowance) {
            const { api } = useAccountStore();
            const { allowanceInWei } = await api.request.get('/v1/erc20/allowance', { params });
            if (!this.allowances[params.tokenAddress]) this.allowances[params.tokenAddress] = {};
            this.allowances[params.tokenAddress][params.spender] = Number(allowanceInWei);
        },
        async approve(data: TRequestBodyApproval) {
            const { api } = useAccountStore();
            const [tx] = await api.request.post('/v1/ve/approve', {
                data,
            });
            await useWalletStore().confirmTransaction(tx.safeTxHash);
        },
    },
});
