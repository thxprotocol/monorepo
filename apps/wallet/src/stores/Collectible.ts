import { TransactionState } from '@thxnetwork/common/enums';
import { defineStore } from 'pinia';
import { useWalletStore } from '.';
import { useAuthStore } from './Auth';

const TX_POLLING_INTERVAL = 3000;

export const useCollectibleStore = defineStore('collectible', {
    state: () => ({
        collectibles: [] as TERC721Token[],
    }),
    actions: {
        request(path: string, options?: TRequestOptions) {
            return useAuthStore().request(path, options);
        },
        async list() {
            const { wallet, chainId } = useWalletStore();
            const collectibles = await this.request('/erc721/token', {
                isAuthenticated: true,
                params: { walletId: wallet?._id, chainId },
            });
            this.collectibles =
                collectibles && collectibles.length
                    ? collectibles.filter((c: TERC721Token) => c.nft && c.metadata)
                    : [];
        },
        async transfer(options: { to: string; erc721Id: string; erc721TokenId: string }) {
            const { wallet, chainId } = useWalletStore();
            const tx = await this.request('/erc721/transfer', {
                method: 'POST',
                isAuthenticated: true,
                body: { walletId: wallet?._id, chainId, ...options },
            });
            await this.waitForTransaction(tx);
        },
        waitForTransaction(tx: TTransaction) {
            return new Promise((resolve, reject) => {
                setTimeout(async () => {
                    const newTx = await this.request(`/transactions/${tx._id}`);
                    if (![TransactionState.Mined, TransactionState.Failed].includes(tx.state)) {
                        this.waitForTransaction(newTx).then(resolve).catch(reject);
                    } else {
                        resolve(newTx);
                    }
                }, TX_POLLING_INTERVAL);
            });
        },
    },
});
