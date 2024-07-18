import NetworkService from '@thxnetwork/api/services/NetworkService';
import { ChainId, TransactionState, TransactionType } from '@thxnetwork/common/enums';
import { MINIMUM_GAS_LIMIT, RELAYER_SPEED } from '@thxnetwork/api/config/secrets';
import { paginatedResults } from '@thxnetwork/api/util/pagination';
import { toChecksumAddress } from 'web3-utils';
import { poll } from '@thxnetwork/api/util/polling';
import { RelayerTransactionPayload } from '@openzeppelin/defender-relay-client';
import { Transaction, TransactionDocument, WalletDocument } from '@thxnetwork/api/models';
import { TransactionReceipt } from 'web3-core';
import ERC20Service from './ERC20Service';
import ERC721Service from './ERC721Service';
import ERC1155Service from './ERC1155Service';
import SafeService from './SafeService';

class TransactionService {
    /**
     * Creates a transaction in the db and either executes or schedules a web3 transaction.
     * When the chain has a relayer configured the transaction is scheduled through it instead of directly executed.
     * By setting the forceSync bool to true you can force the call to behave synchronously. It will poll for the transaction to be executed and only return after the transaction and its callback are executed.
     *
     * @param to Recipient
     * @param fn Web3 contract method
     * @param chainId Chainid to execute on
     * @param forceSync Boolean to force synchronous execution, this waits for the transaction to be processed before returning.
     * @param callback Callback configuration.
     * @returns The transaction ID. This can be stored so the status of the transaction can be queried.
     */
    async sendAsync(to: string | null, fn: any, chainId: ChainId, forceSync = true, callback?: TTransactionCallback) {
        const { relayer, defaultAccount } = NetworkService.getProvider(chainId);
        const from = defaultAccount;
        const estimate = await fn.estimateGas({ from });
        const gas = estimate < MINIMUM_GAS_LIMIT ? MINIMUM_GAS_LIMIT : estimate;
        const data = fn.encodeABI();
        const tx = await Transaction.create({
            type: relayer && !forceSync ? TransactionType.Relayed : TransactionType.Default,
            state: TransactionState.Queued,
            from: defaultAccount,
            to,
            chainId,
            callback,
        });

        return await this.execute(tx, data, gas, chainId, forceSync);
    }

    async estimateGas(chainId: ChainId, options: { to: string; value: string; data: string }) {
        const { web3 } = NetworkService.getProvider(chainId);
        return await web3.eth.estimateGas(options);
    }

    async execute(tx: TransactionDocument, data: string, gas: number, chainId: ChainId, forceSync = true) {
        const { web3, relayer, defaultAccount } = NetworkService.getProvider(chainId);

        if (relayer) {
            const args: RelayerTransactionPayload = {
                data,
                speed: RELAYER_SPEED,
                gasLimit: gas || 3000000,
            };
            if (tx.to) args.to = tx.to;

            const defenderTx = await relayer.sendTransaction(args);
            await tx.updateOne({
                transactionId: defenderTx.transactionId,
                transactionHash: defenderTx.hash,
                state: TransactionState.Sent,
            });

            if (forceSync) {
                await poll(
                    async () => {
                        const transaction = await this.getById(tx.id);
                        return await this.queryTransactionStatusReceipt(transaction);
                    },
                    (state: TransactionState) => state === TransactionState.Sent,
                    500,
                );
            }
        } else {
            const receipt = await web3.eth.sendTransaction({
                from: defaultAccount,
                to: tx.to,
                data,
                gas: gas + 100000, // Only used locally. Originally added for relayed transactions, not sure if still  needed
            });

            await this.transactionMined(tx, receipt);
        }

        // We return the id because the transaction might be out of date and the transaction is not used by callers anyway.
        return tx.id;
    }

    async transactionMined(tx: TransactionDocument, receipt: TransactionReceipt) {
        Object.assign(tx, {
            transactionHash: receipt.transactionHash,
            state: TransactionState.Failed,
        });

        if (receipt.to) {
            Object.assign(tx, { to: toChecksumAddress(receipt.to) });
        }

        if (tx.callback) {
            try {
                await this.executeCallback(tx, receipt);
                tx.state = TransactionState.Mined;
            } catch (e) {
                tx.failReason = e.message;
            }
        }

        await tx.save();
    }

    async executeCallback(tx: TransactionDocument, receipt: TransactionReceipt) {
        if (!tx || !tx.callback) return;
        switch (tx.callback.type) {
            case 'Erc20DeployCallback':
                await ERC20Service.deployCallback(tx.callback.args, receipt);
                break;
            case 'Erc721DeployCallback':
                await ERC721Service.deployCallback(tx.callback.args, receipt);
                break;
            case 'ERC1155DeployCallback':
                await ERC1155Service.deployCallback(tx.callback.args, receipt);
                break;
            case 'erc721TokenMintCallback':
                await ERC721Service.mintCallback(tx.callback.args, receipt);
                break;
            case 'erc1155TokenMintCallback':
                await ERC1155Service.mintCallback(tx.callback.args, receipt);
                break;
            case 'erc721nTransferFromCallback':
                await ERC721Service.transferFromCallback(tx.callback.args, receipt);
                break;
            case 'erc1155TransferFromCallback':
                await ERC1155Service.transferFromCallback(tx.callback.args, receipt);
                break;
        }
    }

    async queryTransactionStatusReceipt(tx: TransactionDocument) {
        if ([TransactionState.Mined, TransactionState.Failed].includes(tx.state) || !tx.transactionHash) {
            return tx;
        }
        const { web3 } = NetworkService.getProvider(tx.chainId);
        try {
            const receipt = await web3.eth.getTransactionReceipt(tx.transactionHash);
            if (receipt) {
                // Wait 500 ms for transactions to be propagated to all nodes.
                // Since we use multiple RPCs it happens we already have the receipt but the other RPC
                // doesn't have the block available yet.
                await new Promise((done) => setTimeout(done, 500));

                await this.transactionMined(tx, receipt);
            }

            return tx.state;
        } catch (error) {
            console.error(error);
        }
    }

    async send(to: string, fn: any, chainId: ChainId) {
        const { web3, defaultAccount } = NetworkService.getProvider(chainId);
        const from = defaultAccount;
        const data = fn.encodeABI();
        const gas = await fn.estimateGas({ from });
        return web3.eth.sendTransaction({
            from,
            to,
            data,
            gasLimit: gas,
        });
    }

    async findByQuery(poolAddress: string, page = 1, limit = 10, startDate?: Date, endDate?: Date) {
        const query: Record<string, any> = { to: poolAddress };

        if (startDate || endDate) query.createdAt = {};
        if (startDate) {
            query.createdAt['$gte'] = startDate;
        }
        if (endDate) {
            query.createdAt['$lt'] = endDate;
        }

        return paginatedResults(Transaction, page, limit, query);
    }

    getById(id: string) {
        return Transaction.findById(id);
    }

    async proposeSafeAsync(wallet: WalletDocument, to: string | null, data: string, callback?: TTransactionCallback) {
        const { relayer, defaultAccount } = NetworkService.getProvider(wallet.chainId);
        const safeTxHash = await SafeService.proposeTransaction(wallet, {
            to,
            data,
            value: '0',
        });
        if (!safeTxHash) throw new Error("Couldn't propose transaction.");

        return await Transaction.create({
            type: relayer ? TransactionType.Relayed : TransactionType.Default,
            state: TransactionState.Confirmed,
            safeTxHash,
            chainId: wallet.chainId,
            walletId: String(wallet._id),
            from: defaultAccount,
            to,
            callback,
        });
    }

    async sendSafeAsync(wallet: WalletDocument, to: string | null, fn: any, callback?: TTransactionCallback) {
        const data = fn.encodeABI();
        return await this.proposeSafeAsync(wallet, to, data, callback);
    }
}

export default new TransactionService();
