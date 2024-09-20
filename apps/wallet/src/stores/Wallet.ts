import { defineStore } from 'pinia';
import { useAuthStore } from './Auth';
import { WALLET_URL, WALLET_CONNECT_PROJECT_ID } from '../config/secrets';
import { createWeb3Modal, defaultWagmiConfig } from '@web3modal/wagmi';
import {
    disconnect,
    watchAccount,
    signMessage,
    switchChain,
    watchChainId,
    GetAccountReturnType,
    reconnect,
    watchConnections,
} from '@wagmi/core';
import { mainnet } from 'viem/chains';
import { Web3Modal } from '@web3modal/wagmi/dist/types/src/client';
import { ChainId, WalletVariant } from '@thxnetwork/common/enums';

const wagmiConfig = defaultWagmiConfig({
    chains: [mainnet],
    projectId: WALLET_CONNECT_PROJECT_ID,
    metadata: {
        name: 'TwinStory',
        description: 'TwinStory',
        url: WALLET_URL,
        icons: ['https://twinstory.io/logo.png'],
    },
});

export const useWalletStore = defineStore('wallet', {
    state: () => ({
        isModalWalletShown: false,
        wallet: null as null | TWallet,
        wallets: [] as TWallet[],
        modal: null as null | Web3Modal,
        account: null as null | GetAccountReturnType,
        chainId: ChainId.Polygon,
    }),
    actions: {
        request(path: string, options?: TRequestOptions) {
            return useAuthStore().request(path, options);
        },
        set(wallet: TWallet) {
            this.wallet = wallet;
        },
        async list() {
            this.wallets = await this.request('/account/wallets');
            if (this.wallets.length) {
                this.set(this.wallets[0]);
            }
        },
        async create(body: { variant: WalletVariant; message: string; signature: string }) {
            await this.request('/account/wallets', { method: 'POST', body });
            await this.list();
            this.set(this.wallets[this.wallets.length - 1]);
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
                themeVariables: { '--w3m-z-index': 9999 },
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
            if (this.account && !this.account.isConnected) {
                throw new Error('Please connect your wallet first!');
            }
            return signMessage(wagmiConfig, { message });
        },
        async connect() {
            await this.createWeb3Modal();
            if (this.modal) this.modal.open();
        },
        async disconnect() {
            if (this.account) {
                await disconnect(wagmiConfig);
                this.account = null;
            }
            if (this.modal) {
                (this.modal as any).resetAccount();
                (this.modal as any).resetNetwork();
                this.modal.close();
                this.modal = null;
            }
        },
    },
});
