import NetworkService from '@thxnetwork/api/services/NetworkService';
import { ChainId, TransactionState, TransactionType } from '@thxnetwork/common/enums';
import { MINIMUM_GAS_LIMIT, RELAYER_SPEED } from '@thxnetwork/api/config/secrets';
import { paginatedResults } from '@thxnetwork/api/util/pagination';
import { toChecksumAddress } from 'web3-utils';
import { poll } from '@thxnetwork/api/util/polling';
import { deployCallback as erc20DeployCallback } from './ERC20Service';
import { RelayerTransactionPayload } from '@openzeppelin/defender-relay-client';
import { Transaction, TransactionDocument, WalletDocument } from '@thxnetwork/api/models';
import { TransactionReceipt } from 'web3';
import ERC721Service from './ERC721Service';
import ERC1155Service from './ERC1155Service';
import SafeService from './SafeService';

class TransactionService {
    constructor() {
        //
    }

    /**
     * Creates a transaction in the db and either executes or schedules a web3 transaction.
     *
     * When the chain has a relayer configured the transaction is scheduled through it instead of directly executed.
     *
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
        const { web3, relayer, defaultAccount } = NetworkService.getProvider(chainId);
        const from = defaultAccount;
        const estimate = await fn.estimateGas({ from });
        const data = fn.encodeABI();
        const gas = estimate < MINIMUM_GAS_LIMIT ? MINIMUM_GAS_LIMIT : estimate;
        const tx = await Transaction.create({
            type: relayer && !forceSync ? TransactionType.Relayed : TransactionType.Default,
            state: TransactionState.Queued,
            from: defaultAccount,
            to,
            chainId,
            callback,
        });
        if (relayer) {
            const args: RelayerTransactionPayload = {
                data,
                speed: RELAYER_SPEED,
                gasLimit: gas.toString(),
            };
            if (to) args.to = to;

            const defenderTx = await relayer.sendTransaction(args);

            Object.assign(tx, {
                transactionId: defenderTx.transactionId,
                transactionHash: defenderTx.hash,
                state: TransactionState.Sent,
            });

            await tx.save();

            if (forceSync) {
                await poll(
                    async () => {
                        const transaction = await this.getById(tx.id);
                        const state = await this.queryTransactionStatusReceipt(transaction);
                        console.log(state);
                        return state;
                    },
                    (state: TransactionState) => state === TransactionState.Sent,
                    500,
                );
            }
        } else {
            const receipt = await web3.eth.sendTransaction({
                from: defaultAccount,
                to,
                data,
                gas: gas + 100000, // This was originally added for relayed transactions, not sure if still  needed
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
            case 'SafeDeployCallback':
                await SafeService.deployCallback(tx.callback.args, receipt);
                break;
            case 'Erc20DeployCallback':
                await erc20DeployCallback(tx.callback.args, receipt);
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

    async queryTransactionStatusDefender(tx: TransactionDocument) {
        if ([TransactionState.Mined, TransactionState.Failed].includes(tx.state)) {
            return tx;
        }
        const { web3, relayer } = NetworkService.getProvider(tx.chainId);
        const defenderTx = await relayer.query(tx.transactionId);

        // Hash has been updated
        if (tx.transactionHash != defenderTx.hash) {
            tx.transactionHash = defenderTx.hash;
            await tx.save();
        }

        if (['mined', 'confirmed'].includes(defenderTx.status)) {
            const receipt = await web3.eth.getTransactionReceipt(tx.transactionHash);
            await this.transactionMined(tx, receipt);
        } else if (defenderTx.status === 'failed') {
            tx.state = TransactionState.Failed;
            await tx.save();
        }

        return tx.state;
    }

    async queryTransactionStatusReceipt(tx: TransactionDocument) {
        if ([TransactionState.Mined, TransactionState.Failed].includes(tx.state)) {
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

        return web3.eth.sendTransaction({
            from,
            to,
            data,
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

    proposeSafeAsync(wallet: WalletDocument, to: string, fn: any) {
        return {} as TransactionDocument;
    }

    sendSafeAsync(wallet: WalletDocument, to: string, fn: any, callback?: TTransactionCallback) {
        return {} as TransactionDocument;
    }
}

export default new TransactionService();
