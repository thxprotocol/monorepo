import { defineStore } from 'pinia';
import { useAccountStore } from './Account';
import { track } from '@thxnetwork/mixpanel';
import { API_URL, HARDHAT_RPC, POLYGON_RPC } from '../config/secrets';
import { useAuthStore } from './Auth';
import { EthersAdapter, SafeConfig } from '@safe-global/protocol-kit';
import { ethers } from 'ethers';
import Safe from '@safe-global/protocol-kit';
import { ChainId } from '@thxnetwork/sdk/src/lib/types/enums/ChainId';

// Safe Contracts
const GnosisSafeProxyFactoryAddress = '0x1122fD9eBB2a8E7c181Cc77705d2B4cA5D72988A';
const CompatibilityFallbackHandlerAddress = '0x5D3D550Da6678C0444F5D77Ca086678D9CdeEecA';
const CreateCallAddress = '0x40Efd8a16485213445E6d8b9a4266Fd2dFf7C69a';
const MultiSendAddress = '0x7E4728eFfC9376CC7C0EfBCc779cC9833D83a984';
const MultiSendCallOnlyAddress = '0x75Cbb6C4Db4Bb4f6F8D5F56072A6cF4Bf4C5413C';
const SignMessageLibAddress = '0x658FAD2acB6d1E615f295E566ee9a6d32Cc97b10';
const GnosisSafeL2Address = '0xC44951780f195Ed71145e3d0d2F25726A097C348';

export const useWalletStore = defineStore('wallet', {
    state: (): TWalletState => ({
        wallet: null,
        walletTransfer: null,
        erc20: [],
        erc721: [],
        erc1155: [],
        pendingPoints: 0,
        wallets: [],
    }),
    actions: {
        async getTransfer(uuid: string) {
            const r = await fetch(API_URL + '/v1/webhook/wallet/' + uuid);
            const { wallet, pointBalance } = await r.json();
            this.pendingPoints = pointBalance;
            this.walletTransfer = wallet;
        },
        async getWallet() {
            const { api, getConfig, account, poolId } = useAccountStore();
            if (!account) return;

            this.wallets = await api.request.get(`/v1/account/wallet?chainId=${getConfig(poolId).chainId}`);
            this.wallet = this.wallets.find((w) => w.safeVersion) as TWallet;
            if (!this.wallet) return;

            for (const tx of this.wallet.pendingTransactions) {
                await this.confirmTransaction(tx.transactionHash);
            }
        },
        async getERC721Token({ _id }: TERC721Token) {
            const { api } = useAccountStore();
            const token = await api.erc721.get(_id);
            const index = this.erc721.findIndex((t) => t._id === token._id);

            this.erc721[index] = { ...token, component: 'BaseCardERC721' };
        },
        async list() {
            const { api, getConfig, poolId } = useAccountStore();
            const options = { chainId: getConfig(poolId).chainId };
            this.erc20 = (await api.erc20.list(options)).map((t: any) => {
                return { ...t, component: 'BaseCardERC20' };
            });
            this.erc721 = (await api.erc721.list(options)).map((t: any) => {
                return { ...t, component: 'BaseCardERC721' };
            });
            this.erc1155 = (await api.erc1155.list(options)).map((t: any) => {
                return { ...t, component: 'BaseCardERC721' };
            });
        },
        async transferERC20(config: TERC20TransferConfig) {
            const { api, account } = useAccountStore();
            const response = await api.erc20.transfer(config);
            await this.confirmTransaction(response.transactionHash);
            track('UserCreates', [account?.sub, 'erc20 transfer']);
        },
        async transferERC721(config: TERC721TransferConfig) {
            const { api, account } = useAccountStore();
            const response = await api.erc721.transfer(config);

            await this.confirmTransaction(response.transactionHash);
            track('UserCreates', [account?.sub, 'erc721 transfer']);
        },
        async upgrade() {
            const { api, account } = useAccountStore();
            await api.walletManager.upgrade(this.wallet?._id);
            track('UserCreates', [account?.sub, 'wallet upgrade']);
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
            const { api } = useAccountStore();
            const { privateKey } = useAuthStore();
            if (!this.wallet || !privateKey) return;

            const rpc = this.getRPC(this.wallet.chainId);
            const provider = new ethers.providers.JsonRpcProvider(rpc.url);
            const signer = new ethers.Wallet(privateKey, provider);
            const ethAdapter = new EthersAdapter({ ethers, signerOrProvider: signer }) as any;
            const config: SafeConfig = {
                ethAdapter,
                safeAddress: this.wallet.address,
                contractNetworks: rpc.contractNetworks,
            };
            const safe = await Safe.create(config);
            const signature = await safe.signTransactionHash(safeTxHash);

            return await api.request.post(`/v1/account/wallet/confirm`, {
                body: JSON.stringify({ chainId: this.wallet.chainId, safeTxHash, signature: signature.data }),
            });
        },
    },
});
