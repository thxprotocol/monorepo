import { Wallet, WalletDocument, PoolDocument, TransactionDocument } from '@thxnetwork/api/models';
import { ChainId, WalletVariant } from '@thxnetwork/common/enums';
import { contractNetworks, getArtifact } from '@thxnetwork/api/hardhat';
import { toChecksumAddress } from 'web3-utils';
import { convertObjectIdToNumber } from '../util';
import { MetaTransactionData, SafeMultisigTransactionResponse } from '@safe-global/safe-core-sdk-types';
import { safeVersion } from '@thxnetwork/api/services/ContractService';
import Safe, { SafeAccountConfig, SafeFactory } from '@safe-global/protocol-kit';
import NetworkService from '@thxnetwork/api/services/NetworkService';
import axios from 'axios';
import SafeApiKit from '@safe-global/api-kit';
import SafeTransaction from '@safe-global/protocol-kit/dist/src/utils/transactions/SafeTransaction';
import TransactionService from './TransactionService';
import { ethers } from 'ethers';

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
        console.log(safeTxHash);
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

    async createTransaction(wallet: WalletDocument, { to, data }: Partial<MetaTransactionData>) {
        const safe = await this.getSafe(wallet);
        try {
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
        } catch (error) {
            console.error('Error creating transaction:', error.response ? error.response.data : error.message);
        }
    }

    async signTransaction(wallet: WalletDocument, safeTx: SafeTransaction) {
        const safe = await this.getSafe(wallet);
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
        const apiKit = this.getApiKit(wallet);
        try {
            await apiKit.confirmTransaction(safeTxHash, signature);
            console.debug('Transaction confirmed:', safeTxHash);
        } catch (error) {
            console.error('Error confirming transaction:', error.response ? error.response.data : error.message);
        }
    }

    async executeTransaction(wallet: WalletDocument, tx: TransactionDocument) {
        const pendingTx = await this.getTransaction(wallet, tx.safeTxHash);
        if (!pendingTx) return;

        const { confirmations, confirmationsRequired } = pendingTx;
        if (confirmations && confirmations.length >= confirmationsRequired) {
            const { web3 } = NetworkService.getProvider(wallet.chainId);
            const contract = new web3.eth.Contract(getArtifact('GnosisSafeL2').abi, wallet.address);
            const signatures = this.packSignatures(pendingTx);
            console.log(
                pendingTx.to, // 0x721Ad61566bbC64322aEcD3CD36aFaCd6a0caE5b
                pendingTx.value, // 0
                pendingTx.data, // 0xa9059cbb000000000000000000000000b5d481275264bb79591f26ad11cf8349986005560000000000000000000000000000000000000000000000004563918244f40000
                pendingTx.operation, // 0
                pendingTx.safeTxGas, // 0
                pendingTx.baseGas, // 0
                pendingTx.gasPrice, // 0
                pendingTx.gasToken, // 0x0000000000000000000000000000000000000000
                pendingTx.refundReceiver, // 0x0000000000000000000000000000000000000000
                signatures, // 0x0cbf348ce07d079bd7d2f1456e42f5f1e4c1c9975b288da3a574a89d17a2a830346f7732856625b7cba75637b4996ff68aeea5d3f6b971cbdacfe7640e7ca5d01c
            );
            const fn = contract.methods.execTransaction(
                pendingTx.to,
                pendingTx.value,
                pendingTx.data,
                pendingTx.operation,
                pendingTx.safeTxGas,
                pendingTx.baseGas,
                pendingTx.gasPrice,
                pendingTx.gasToken,
                pendingTx.refundReceiver,
                signatures,
            );
            const data = fn.encodeABI();

            await TransactionService.execute(tx, data, null, wallet.chainId, false);
        } else {
            console.debug('Require more confirmations:', pendingTx);
        }
    }

    // Using only the API call here will avoid reading for the RPC which speeds up the process significantly
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
        try {
            const safeTxHash = await safe.getTransactionHash(safeTx);
            console.debug('Transaction Hash created:', safeTxHash);
            return safeTxHash;
        } catch (error) {
            console.error('Error creating transaction hash:', error.response ? error.response.data : error.message);
        }
    }

    private packSignatures(safeTransaction: SafeMultisigTransactionResponse) {
        // Sort confirmations by signer address
        const sortedConfirmations = safeTransaction.confirmations.sort((a, b) =>
            a.owner.toLowerCase().localeCompare(b.owner.toLowerCase()),
        );

        // Pack each signature
        const packedSignatures = sortedConfirmations.map((confirmation) => {
            const signature = ethers.utils.splitSignature(confirmation.signature);
            return ethers.utils.solidityPack(['bytes32', 'bytes32', 'uint8'], [signature.r, signature.s, signature.v]);
        });

        // Concatenate all packed signatures
        return ethers.utils.hexConcat(packedSignatures);
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
