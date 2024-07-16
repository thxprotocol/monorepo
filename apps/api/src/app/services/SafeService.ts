import { Wallet, WalletDocument, PoolDocument, TransactionDocument } from '@thxnetwork/api/models';
import { ChainId, TransactionState, WalletVariant } from '@thxnetwork/common/enums';
import { contractNetworks } from '@thxnetwork/api/hardhat';
import { toChecksumAddress } from 'web3-utils';
import { convertObjectIdToNumber } from '../util';
import { MetaTransactionData, SafeMultisigTransactionResponse } from '@safe-global/safe-core-sdk-types';
import { safeVersion } from '@thxnetwork/api/services/ContractService';
import Safe, { SafeAccountConfig, SafeFactory } from '@safe-global/protocol-kit';
import NetworkService from '@thxnetwork/api/services/NetworkService';
import axios from 'axios';
import SafeApiKit from '@safe-global/api-kit';
import SafeTransaction from '@safe-global/protocol-kit/dist/src/utils/transactions/SafeTransaction';

class SafeService {
    async create(
        data: { sub: string; chainId: ChainId; safeVersion?: '1.3.0'; address?: string; poolId?: string },
        userWalletAddress?: string,
    ) {
        const wallet = await Wallet.create({
            variant: WalletVariant.Safe,
            ...data,
        });
        // Present address means Metamask account so do not deploy and return early
        if (!safeVersion && wallet.address) return wallet;

        // Add relayer address and consider this a campaign safe
        const { defaultAccount } = NetworkService.getProvider(wallet.chainId);
        const owners = [toChecksumAddress(defaultAccount)];

        // Add user address as a signer and consider this a participant safe
        if (userWalletAddress) {
            owners.push(toChecksumAddress(userWalletAddress));
        }

        // If campaign safe we provide a nonce based on the timestamp in the MongoID the pool (poolId value)
        const saltNonce = wallet.poolId && String(convertObjectIdToNumber(wallet.poolId));

        await this.deploy(wallet, owners, saltNonce);

        return wallet;
    }

    async deploy(wallet: WalletDocument, owners: string[], saltNonce?: string) {
        const { ethAdapter } = NetworkService.getProvider(wallet.chainId);
        const safeAccountConfig: SafeAccountConfig = {
            owners,
            threshold: owners.length,
        };
        const safeFactory = await SafeFactory.create({
            safeVersion,
            ethAdapter,
            contractNetworks,
        });

        const safeAddress = toChecksumAddress(await safeFactory.predictSafeAddress(safeAccountConfig, saltNonce));
        console.debug('Predicted Safe Address:', safeAddress);
        try {
            await Safe.create({
                ethAdapter,
                safeAddress,
                contractNetworks,
            });
        } catch (error) {
            await safeFactory.deploySafe({ safeAccountConfig, options: { gasLimit: '3000000' } });
        }
    }

    findById(id: string) {
        return Wallet.findById(id);
    }

    findOne(query) {
        return Wallet.findOne({ ...query, variant: WalletVariant.Safe, poolId: { $exists: false } });
    }

    findOneByAddress(address: string) {
        return Wallet.findOne({ address: toChecksumAddress(address) });
    }

    async findOneByPool(pool: PoolDocument, chainId: ChainId) {
        if (!pool) return;
        return await Wallet.findOne({
            poolId: pool.id,
            chainId,
            sub: pool.sub,
            safeVersion,
        });
    }

    async proposeTransaction(wallet: WalletDocument, options: MetaTransactionData) {
        const { defaultAccount } = NetworkService.getProvider(wallet.chainId);
        const apiKit = this.getApiKit(wallet);
        const safeTx = await this.createTransaction(wallet, options);
        const safeTxHash = await this.getTransactionHash(wallet, safeTx);
        const signedTx = await this.signTransaction(wallet, safeTx);
        const senderSignature = signedTx.signatures.get(defaultAccount.toLowerCase());
        try {
            const safeAddress = toChecksumAddress(wallet.address);
            const senderAddress = toChecksumAddress(defaultAccount);
            await apiKit.proposeTransaction({
                safeAddress,
                safeTxHash,
                safeTransactionData: safeTx.data as any,
                senderAddress,
                senderSignature: senderSignature.data,
            });
            console.debug('Transaction proposed:', safeTxHash);
            return safeTx;
        } catch (error) {
            console.error('Error proposing transaction:', error.response ? error.response.data : error.message);
        }
    }

    // We can only use the protocol-kit for offchain purposes since the
    // Defender Relayer will not be compatible.
    async createTransaction(wallet: WalletDocument, { to, data }: Partial<MetaTransactionData>) {
        const safe = await this.getSafe(wallet);
        const safeTx = await safe.createTransaction({
            safeTransactionData: {
                to,
                data,
                value: '0',
                operation: 0,
            },
        });
        console.debug('Transaction created:', safeTx);
        return safeTx;
    }

    async signTransaction(wallet: WalletDocument, safeTx: SafeTransaction) {
        const safe = await this.getSafe(wallet);
        console.debug('Data to sign', safeTx);
        try {
            const signedTx = await safe.signTransaction(safeTx as any);
            console.debug('Transaction Data signed:', signedTx);

            return signedTx;
        } catch (error) {
            console.error('Error signing transaction:', error.response ? error.response.data : error.message);
        }
    }

    async confirmTransaction(wallet: WalletDocument, safeTx: SafeTransaction) {
        const { defaultAccount } = NetworkService.getProvider(wallet.chainId);
        const safeTxHash = await this.getTransactionHash(wallet, safeTx);
        const signedTx = await this.signTransaction(wallet, safeTx);
        const signature = signedTx.signatures.get(defaultAccount);
        return await this.confirm(wallet, safeTxHash, signature.data);
    }

    async confirm(wallet: WalletDocument, safeTxHash: string, signature: string) {
        const safe = await this.getSafe(wallet);
        const apiKit = this.getApiKit(wallet);
        try {
            await apiKit.confirmTransaction(safeTxHash, signature);
            console.debug('Transaction confirmed:', safeTxHash);
        } catch (error) {
            console.error('Error confirming transaction:', error.response ? error.response.data : error.message);
        }
    }

    async executeTransaction(wallet: WalletDocument, tx: TransactionDocument) {
        // Safes for pools have a single signer (relayer) while safes for end users
        // have 2 (relayer + web3auth mpc key)
        const threshold = wallet.poolId ? 1 : 2;
        const pendingTx = await this.getTransaction(wallet, tx.safeTxHash);
        if (pendingTx && pendingTx.confirmations.length >= threshold) {
            const safe = await this.getSafe(wallet);

            // Attempt to get the receipt for the stored hash first

            const response = await safe.executeTransaction(pendingTx, { gasLimit: 5000000 });
            const receipt = await response.transactionResponse.wait();
            // TODO Check for success event

            await tx.updateOne({
                transactionHash: receipt.transactionHash,
                state: TransactionState.Sent,
            });
        } else {
            console.debug('Require more confirmations:', pendingTx);
        }
    }

    async getTransaction(wallet: WalletDocument, safeTxHash: string) {
        const { txServiceUrl } = NetworkService.getProvider(wallet.chainId);
        try {
            const { data } = await axios({
                url: `${txServiceUrl}/v1/multisig-transactions/${safeTxHash}`,
                method: 'GET',
            });
            console.debug('Transaction get:', data);
            return data as SafeMultisigTransactionResponse;
        } catch (error) {
            console.error('Error transaction get:', error.response ? error.response.data : error.message);
        }
    }

    async getTransactionHash(wallet: WalletDocument, safeTx: any) {
        const safe = await this.getSafe(wallet);
        const safeTxHash = await safe.getTransactionHash(safeTx);
        console.debug('Transaction Hash created:', safeTxHash);
        return safeTxHash;
    }

    private async estimateGas(wallet: WalletDocument, safeTransaction: SafeMultisigTransactionResponse) {
        const { txServiceUrl } = NetworkService.getProvider(wallet.chainId);
        try {
            const { data } = await axios({
                url: `${txServiceUrl}/v1/safes/${wallet.address}/multisig-transactions/estimations`,
                method: 'POST',
                data: safeTransaction,
            });
            console.debug('Transaction estimated:', data);
            return Number(data.safeTxGas);
        } catch (error) {
            console.error(error);
            console.error('Error estimating transaction:', error.response ? error.response.data : error.message);
        }
    }

    async getLastPendingTransactions(wallet: WalletDocument) {
        // pending tx
        return {};
    }

    private async getSafe(wallet: WalletDocument) {
        const { ethAdapter } = NetworkService.getProvider(wallet.chainId);
        const safe = await Safe.create({
            ethAdapter,
            safeAddress: wallet.address,
            contractNetworks,
        });
        console.debug('Safe init:', wallet.address);
        return safe;
    }

    private getApiKit(wallet: WalletDocument) {
        const { txServiceUrl } = NetworkService.getProvider(wallet.chainId);
        return new SafeApiKit({
            txServiceUrl,
            chainId: wallet.chainId,
        });
    }
}

export default new SafeService();
