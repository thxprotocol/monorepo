import Safe, { EthersAdapter } from '@safe-global/protocol-kit';
import { TransactionState } from '@thxnetwork/common/enums';
import { ethers } from 'ethers';
import { defineStore } from 'pinia';
import { useAuthStore, useWalletStore, useWeb3AuthStore } from '.';
import { contractNetworks } from '../config/constants';
import { POLYGON_RPC } from '../config/secrets';

const TX_POLLING_INTERVAL = 3000;

export const useSafeStore = defineStore('safe', {
    state: () => ({
        collectibles: [] as TERC721Token[],
    }),
    actions: {
        request(path: string, options?: TRequestOptions) {
            return useAuthStore().request(path, options);
        },
        async waitForTransaction(tx: TTransaction) {
            const { safeTxHash } = await this.waitForTransactionProposal(tx);
            if (!safeTxHash) throw new Error('Could not find transaction hash');

            const { confirmTransaction } = useSafeStore();
            await confirmTransaction(safeTxHash);

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
        async waitForTransactionProposal(tx: TTransaction) {
            return new Promise((resolve, reject) => {
                setTimeout(async () => {
                    const newTx = await this.request(`/transactions/${tx._id}`);
                    if (!tx.safeTxHash) {
                        this.waitForTransactionProposal(newTx).then(resolve).catch(reject);
                    } else {
                        resolve(newTx);
                    }
                }, TX_POLLING_INTERVAL);
            }) as unknown as TTransaction;
        },
        async confirmTransaction(safeTxHash: string) {
            const { privateKey, getPrivateKey } = useWeb3AuthStore();
            if (!privateKey) await getPrivateKey();

            const { wallet } = useWalletStore();
            if (!wallet) throw new Error('Please select a multisig wallet.');

            const signature = await this.signSafeTXHash(wallet, safeTxHash);
            if (!signature) throw new Error('Could not sign this transaction.');

            return await this.request(`/account/wallets/confirm`, {
                body: { chainId: wallet.chainId, safeTxHash, signature },
                params: { walletId: wallet._id },
            });
        },
        async signSafeTXHash(wallet: TWallet, safeTxHash: string) {
            const { privateKey, getPrivateKey } = useWeb3AuthStore();
            if (!privateKey) await getPrivateKey();

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
    },
});
