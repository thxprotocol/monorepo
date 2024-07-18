import { Wallet, WalletDocument, PoolDocument, TransactionDocument, Transaction } from '@thxnetwork/api/models';
import { ChainId, JobType, TransactionState, WalletVariant } from '@thxnetwork/common/enums';
import { contractNetworks } from '@thxnetwork/api/hardhat';
import { toChecksumAddress } from 'web3-utils';
import { safeVersion } from '@thxnetwork/api/services/ContractService';
import { SafeTransaction, MetaTransactionData } from '@safe-global/safe-core-sdk-types';
import { convertObjectIdToNumber } from '../util';
import SafeApiKit from '@safe-global/api-kit';
import Safe, { SafeFactory, SafeAccountConfig } from '@safe-global/protocol-kit';
import NetworkService from '@thxnetwork/api/services/NetworkService';
import TransactionService from './TransactionService';
import { Job } from '@hokify/agenda';
import { agenda } from '../util/agenda';

class SafeService {
    async create(
        data: { sub: string; chainId: ChainId; safeVersion: '1.3.0'; address?: string; poolId?: string },
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
        const safeAddress = await this.deploy(wallet, owners, saltNonce);

        return await Wallet.findByIdAndUpdate(wallet.id, { address: safeAddress }, { new: true, upsert: true });
    }

    async deploy(wallet: WalletDocument, owners: string[], saltNonce?: string) {
        const { ethAdapter } = NetworkService.getProvider(wallet.chainId);
        const safeAccountConfig: SafeAccountConfig = {
            owners,
            threshold: owners.length,
        };
        const safeAddress = await this.predictAddress(wallet, safeAccountConfig, safeVersion, saltNonce);

        try {
            await Safe.create({
                ethAdapter,
                safeAddress,
                contractNetworks,
            });
        } catch (error) {
            await agenda.now(JobType.DeploySafe, { safeAccountConfig, saltNonce, chainId: wallet.chainId });
            console.debug(`[${wallet.sub}] Deployed Safe: ${safeAddress}`, saltNonce);
        }

        return safeAddress;
    }

    async deploySafeJob({ attrs }: Job) {
        const { safeAccountConfig, saltNonce, chainId } = attrs.data as TJobDeploySafe;
        const { ethAdapter } = NetworkService.getProvider(chainId);
        const safeFactory = await SafeFactory.create({
            ethAdapter,
            safeVersion,
            contractNetworks,
        });
        console.log({ safeAccountConfig, saltNonce, options: { gasLimit: '3000000' } });
        try {
            await safeFactory.deploySafe({ safeAccountConfig, saltNonce, options: { gasLimit: '3000000' } });
        } catch (error) {
            console.error(error.response ? error.response.data : error.message);
        }
    }

    async predictAddress(
        wallet: WalletDocument,
        safeAccountConfig: SafeAccountConfig,
        safeVersion: '1.3.0',
        saltNonce?: string,
    ) {
        if (wallet.address) return wallet.address;

        const { ethAdapter } = NetworkService.getProvider(wallet.chainId);
        const safeFactory = await SafeFactory.create({
            safeVersion,
            ethAdapter,
            contractNetworks,
        });
        const safeAddress = await safeFactory.predictSafeAddress(safeAccountConfig, saltNonce);

        return toChecksumAddress(safeAddress);
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
        const safeTx = await this.createTransaction(wallet, options);
        const safeTxHash = await this.getTransactionHash(wallet, safeTx);
        const signedTx = await this.signTransaction(wallet, safeTx);
        const senderSignature = signedTx.signatures.get(defaultAccount.toLowerCase());
        const apiKit = this.getApiKit(wallet);
        try {
            console.debug('Transaction proposal start:', safeTxHash);
            await apiKit.proposeTransaction({
                safeAddress: toChecksumAddress(wallet.address),
                safeTxHash,
                safeTransactionData: signedTx.data,
                senderAddress: toChecksumAddress(defaultAccount),
                senderSignature: senderSignature.data,
            });
            console.debug('Transaction proposed:', safeTxHash);
            return safeTxHash;
        } catch (error) {
            console.error('Error proposing transaction:', error.response ? error.response.data : error.message);
        }
    }

    async createTransaction(wallet: WalletDocument, { to, data }: Partial<MetaTransactionData>) {
        const safe = await this.getSafe(wallet);
        try {
            const apiKit = this.getApiKit(wallet);
            const nonce = await apiKit.getNextNonce(wallet.address);
            const safeTx = await safe.createTransaction({
                safeTransactionData: {
                    to,
                    data,
                    value: '0',
                    operation: 0,
                },
                options: { nonce },
            });
            console.debug('Transaction created:', safeTx);
            return safeTx;
        } catch (error) {
            console.error('Error creating transaction:', error.response ? error.response.data : error.message);
        }
    }

    async signTransaction(wallet: WalletDocument, safeTx: SafeTransaction) {
        const safe = await this.getSafe(wallet);
        try {
            const signedTx = await safe.signTransaction(safeTx);
            console.debug('Transaction Signatures:', Array.from(safeTx.signatures).length);
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
        const apiKit = this.getApiKit(wallet);
        try {
            await apiKit.confirmTransaction(safeTxHash, signature);
            console.debug('Transaction confirmed:', safeTxHash);
        } catch (error) {
            console.error('Error confirming transaction:', error.response ? error.response.data : error.message);
        }
    }

    async executeTransaction(tx: TransactionDocument) {
        try {
            const wallet = await Wallet.findById(tx.walletId);
            if (!wallet) throw new Error('Wallet not found');

            const pendingTx = await this.getTransaction(wallet, tx.safeTxHash);
            if (!wallet) throw new Error('Pending TX not found');

            const { confirmations, confirmationsRequired } = pendingTx;
            if (confirmations && confirmations.length >= confirmationsRequired) {
                const safe = await this.getSafe(wallet);
                const safeTx = await safe.toSafeTransactionType(pendingTx);

                try {
                    const response = await safe.executeTransaction(safeTx);
                    const receipt = await response.transactionResponse.wait();
                    if (!receipt) throw new Error(`No receipt found for ${tx.safeTxHash}`);
                    console.log(receipt);

                    await tx.updateOne({ transactionHash: receipt.transactionHash, state: TransactionState.Sent });
                } catch (error) {
                    // Suppress non breaking gas estimation error and start polling for state
                    if (error.message.includes('GS026')) {
                        await tx.updateOne({ state: TransactionState.Sent });
                    } else {
                        throw error;
                    }
                }
            } else {
                console.debug('Require more confirmations:', pendingTx.safeTxHash);
            }
        } catch (error) {
            await tx.updateOne({ state: TransactionState.Failed });
            console.error('Error executing transaction:', error.response ? error.response.data : error.message);
        }
    }

    async updateTransactionState(wallet: WalletDocument, safeTxHash: string) {
        const safeTx = await this.getTransaction(wallet, safeTxHash);
        if (!safeTx) return;

        const tx = await Transaction.findOne({ safeTxHash });
        const isSent = tx.state === TransactionState.Sent;

        if (isSent && safeTx.isExecuted && safeTx.isSuccessful) {
            await TransactionService.queryTransactionStatusReceipt(tx);
            console.debug('Transaction success:', safeTx);
        }

        if (isSent && safeTx.isExecuted && !safeTx.isSuccessful) {
            await tx.updateOne({ state: TransactionState.Failed });
            console.debug('Transaction failed:', safeTx);
        }
    }

    async getTransaction(wallet: WalletDocument, safeTxHash: string) {
        const apiKit = this.getApiKit(wallet);
        try {
            const safeTx = await apiKit.getTransaction(safeTxHash);
            console.debug('Transaction get:', safeTx);
            return safeTx;
        } catch (error) {
            console.error('Error transaction get:', error.response ? error.response.data : error.message);
        }
    }

    async getTransactionHash(wallet: WalletDocument, safeTx: any) {
        const safe = await this.getSafe(wallet);
        try {
            const safeTxHash = await safe.getTransactionHash(safeTx);
            console.debug('Transaction Hash created:', safeTxHash);
            return safeTxHash;
        } catch (error) {
            console.error('Error creating transaction hash:', error.response ? error.response.data : error.message);
        }
    }

    async getLastPendingTransactions(wallet: WalletDocument) {
        const apiKit = this.getApiKit(wallet);
        return await apiKit.getPendingTransactions(wallet.address);
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
        const { txServiceUrl, ethAdapter } = NetworkService.getProvider(wallet.chainId);
        return new SafeApiKit({
            txServiceUrl,
            ethAdapter,
        });
    }
}

export default new SafeService();
