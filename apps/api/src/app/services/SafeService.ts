import { Wallet, WalletDocument, PoolDocument, Transaction, TransactionDocument } from '@thxnetwork/api/models';
import { ChainId, JobType, TransactionState, WalletVariant } from '@thxnetwork/common/enums';
import { contractNetworks, getArtifact } from '@thxnetwork/api/hardhat';
import { toChecksumAddress } from 'web3-utils';
import { safeVersion } from '@thxnetwork/api/services/ContractService';
import { SafeTransaction, SafeTransactionDataPartial } from '@safe-global/safe-core-sdk-types';
import { convertObjectIdToNumber } from '../util';
import SafeApiKit from '@safe-global/api-kit';
import Safe, { SafeFactory, SafeAccountConfig } from '@safe-global/protocol-kit';
import NetworkService from '@thxnetwork/api/services/NetworkService';
import TransactionService from './TransactionService';
import { Job } from '@hokify/agenda';
import { agenda } from '../util/agenda';
import { logger } from '../util/logger';
import { PRIVATE_KEY } from '../config/secrets';
import { ethers } from 'ethers';
import * as Gen from '../config/generated';
import { AptosClient, TxnBuilderTypes, BCS, TypeTagParser } from 'aptos';
import { SuiClient } from '@mysten/sui/client';
import { coinWithBalance, Transaction as SuiTransaction } from '@mysten/sui/transactions';
import { MultiSigPublicKey } from '@mysten/sui/multisig';
import { APTOS_NODE_URL, SUI_NODE_URL } from '../config/secrets';
import { createMultisig, getOrCreateAssociatedTokenAccount, transfer } from '@solana/spl-token';
import solanaWeb3 from '@solana/web3.js';

const { AccountAddress, EntryFunction, MultiSig, MultiSigTransactionPayload, TransactionPayloadMultisig } =
    TxnBuilderTypes;

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

        let owners = [];

        // Add relayer address and consider this a campaign safe
        if (data.chainId != ChainId.Aptos && data.chainId != ChainId.Sui && data.chainId != ChainId.Solana) {
            const { defaultAccount } = NetworkService.getProvider(wallet.chainId);
            owners = [toChecksumAddress(defaultAccount)];

            // Add user address as a signer and consider this a participant safe
            if (userWalletAddress) {
                owners.push(toChecksumAddress(userWalletAddress));
            }
        }

        // If campaign safe we provide a nonce based on the timestamp in the MongoID the pool (poolId value)
        const saltNonce = wallet.poolId && String(convertObjectIdToNumber(wallet.poolId));
        const safeAddress = await this.deploy(wallet, owners, saltNonce);

        return await Wallet.findByIdAndUpdate(wallet.id, { address: safeAddress }, { new: true });
    }

    async deploy(wallet: WalletDocument, owners: string[], saltNonce?: string) {
        if (wallet.chainId == ChainId.Aptos) {
            const { signer, client } = NetworkService.getProvider(wallet.chainId);
            const payload: Gen.ViewRequest = {
                function: '0x1::multisig_account::get_next_multisig_account_address',
                type_arguments: [],
                arguments: [signer.address().hex()],
            };
            const multisigAddress = (await client.view(payload))[0] as string;
            const createMultisig = await client.generateTransaction(signer.address(), {
                function: '0x1::multisig_account::create_with_owners',
                type_arguments: [],
                arguments: [[], 1, [], []],
            });
            await client.generateSignSubmitWaitForTransaction(signer, createMultisig.payload);
            logger.debug('Deployed Safe :', multisigAddress);
            return multisigAddress;
        } else if (wallet.chainId == ChainId.Sui) {
            const { signer } = NetworkService.getProvider(wallet.chainId);
            const multiSigPublicKey = MultiSigPublicKey.fromPublicKeys({
                threshold: 1,
                publicKeys: [
                    {
                        publicKey: signer.getPublicKey(),
                        weight: 1,
                    },
                ],
            });

            const multisigAddress = multiSigPublicKey.toSuiAddress();
            logger.debug('Deployed Safe :', multisigAddress);
            return multisigAddress;
        } else if (wallet.chainId == ChainId.Solana) {
            const { signer, connection } = NetworkService.getProvider(wallet.chainId);
            const multisigKey = await createMultisig(connection, signer, [signer.publicKey], 1);

            const multisigAddress = multisigKey.toBase58();
            logger.debug('Deployed Safe :', multisigAddress);
            return multisigAddress;
        } else if (wallet.chainId == ChainId.Skale) {
            const { web3, defaultAccount } = NetworkService.getProvider(wallet.chainId);
            const { abi, bytecode } = getArtifact('SafeWallet');
            const contract = new web3.eth.Contract(abi);
            const fn = contract.deploy({
                data: bytecode,
                arguments: [1, [defaultAccount], 1],
            });

            const estimate = await fn.estimateGas({ from: defaultAccount });

            // Encode the deployment data
            const deployData = fn.encodeABI();
            const privateKey = PRIVATE_KEY; // Your private key

            // Construct the transaction object
            const tx = {
                data: deployData,
                gas: estimate,
            };

            // Sign the transaction
            const signed = await web3.eth.accounts.signTransaction(tx, privateKey);
            console.log('Signed Transaction');
            const receipt = await web3.eth.sendSignedTransaction(signed.rawTransaction).on('receipt', (receipt) => {
                logger.debug('Deployed Safe :', receipt.contractAddress);
            });
            return receipt.contractAddress;
        } else {
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
            }

            return safeAddress;
        }
    }

    async deploySafeJob({ attrs }: Job) {
        logger.debug('Deploying Safe');
        const { safeAccountConfig, saltNonce, chainId } = attrs.data as TJobDeploySafe;
        const { ethAdapter, provider } = NetworkService.getProvider(chainId);
        const safeFactory = await SafeFactory.create({
            ethAdapter,
            safeVersion,
            contractNetworks,
        });
        const gasPriceMode = await provider.getGasPrice();
        const gasPrice = (2 * gasPriceMode.toNumber()).toString();
        const args = { safeAccountConfig, options: { gasPrice: gasPrice } };
        if (saltNonce) args['saltNonce'] = saltNonce;

        try {
            await safeFactory.deploySafe(args);
            logger.debug('Deployed Safe');
        } catch (error) {
            logger.error(error.response ? error.response.data : error.message);
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

    async proposeTx(wallet: WalletDocument, tx: TransactionDocument) {
        if (wallet.chainId == ChainId.Skale) {
            await tx.updateOne({ state: TransactionState.Executed });
            const { web3, provider } = NetworkService.getProvider(wallet.chainId);
            const { abi } = getArtifact('SafeWallet');
            const contract = new web3.eth.Contract(abi, wallet.address);
            const nonce = await contract.methods.getNonce().call();

            const dataField = ethers.utils.defaultAbiCoder.encode(
                ['address', 'bytes', 'uint256'],
                [tx.to, tx.data, nonce],
            );
            const hash = ethers.utils.keccak256(dataField);
            const signatures = web3.eth.accounts.sign(hash, PRIVATE_KEY);
            const signWallet = new ethers.Wallet(PRIVATE_KEY, provider);
            const walletContract = new ethers.Contract(wallet.address, abi, signWallet);
            const gasPriceMode = await provider.getGasPrice();
            const gasPrice = (2 * gasPriceMode.toNumber()).toString();
            const res = await walletContract.execTransaction(tx.to, tx.data, signatures.signature, {
                gasPrice: gasPrice,
            });
            await tx.updateOne({ state: TransactionState.Mined });
            logger.debug('Safe TX Executed');
        } else if (wallet.chainId == ChainId.Aptos) {
            await tx.updateOne({ state: TransactionState.Executed });
            const client = new AptosClient(APTOS_NODE_URL);
            const { signer } = NetworkService.getProvider(wallet.chainId);
            const transferTxPayload = new MultiSigTransactionPayload(
                EntryFunction.natural(
                    '0x1::aptos_account',
                    'transfer_coins',
                    [new TypeTagParser(tx.to).parseTypeTag()],
                    [BCS.bcsToBytes(AccountAddress.fromHex(wallet.address)), BCS.bcsSerializeUint64(tx.amount)],
                ),
            );
            const multisigTxExecution = new TransactionPayloadMultisig(
                new MultiSig(AccountAddress.fromHex(tx.data), transferTxPayload),
            );
            // We can simulate the transaction to see if it will succeed without having to create it on chain.
            const [simulationResp] = await client.simulateTransaction(
                signer,
                await client.generateRawTransaction(signer.address(), multisigTxExecution),
            );

            // Create the multisig tx on chain.
            const createMultisigTx = await client.generateTransaction(signer.address(), {
                function: '0x1::multisig_account::create_transaction',
                type_arguments: [],
                arguments: [tx.data, BCS.bcsToBytes(transferTxPayload)],
            });
            await client.generateSignSubmitWaitForTransaction(signer, createMultisigTx.payload);

            const result = await client.generateSignSubmitWaitForTransaction(signer, multisigTxExecution);
            await tx.updateOne({ state: TransactionState.Mined, transactionHash: result.hash });
            logger.debug('Safe TX Executed');
        } else if (wallet.chainId == ChainId.Sui) {
            await tx.updateOne({ state: TransactionState.Executed });
            const client = new SuiClient({ url: SUI_NODE_URL });
            const { signer } = NetworkService.getProvider(wallet.chainId);
            const safeTx = new SuiTransaction();
            safeTx.transferObjects([coinWithBalance({ balance: tx.amount, type: tx.to })], wallet.address);
            safeTx.setSender(tx.data);
            const bytes = await safeTx.build({ client: client });
            const signature = (await signer.signTransaction(bytes)).signature;
            const multiSigPublicKey = MultiSigPublicKey.fromPublicKeys({
                threshold: 1,
                publicKeys: [
                    {
                        publicKey: signer.getPublicKey(),
                        weight: 1,
                    },
                ],
            });
            const combinedSignature = multiSigPublicKey.combinePartialSignatures([signature]);
            const result = await client.executeTransactionBlock({
                transactionBlock: bytes,
                signature: combinedSignature,
                requestType: 'WaitForLocalExecution',
                options: {
                    showEffects: true,
                },
            });
            await tx.updateOne({ state: TransactionState.Mined });
            logger.debug('Safe TX Executed');
        } else if (wallet.chainId == ChainId.Solana) {
            await tx.updateOne({ state: TransactionState.Executed });
            const { signer, connection } = NetworkService.getProvider(wallet.chainId);
            const mint = new solanaWeb3.PublicKey(tx.to);
            const fromTokenAccount = await getOrCreateAssociatedTokenAccount(
                connection,
                signer,
                mint,
                new solanaWeb3.PublicKey(tx.data),
            );
            const toTokenAccount = await getOrCreateAssociatedTokenAccount(
                connection,
                signer,
                mint,
                new solanaWeb3.PublicKey(wallet.address),
            );
            const signature = await transfer(
                connection,
                signer,
                fromTokenAccount.address,
                toTokenAccount.address,
                new solanaWeb3.PublicKey(tx.data),
                tx.amount,
                [signer],
            );

            await tx.updateOne({ state: TransactionState.Mined });
            logger.debug('Safe TX Executed');
        }
    }

    async proposeTransaction(wallet: WalletDocument, txs: TransactionDocument[]) {
        if (
            wallet.chainId == ChainId.Skale ||
            wallet.chainId == ChainId.Aptos ||
            wallet.chainId == ChainId.Sui ||
            wallet.chainId == ChainId.Solana
        ) {
            for (let tx of txs) {
                try {
                    await this.proposeTx(wallet, tx);
                } catch (err) {
                    logger.error(err);
                }
            }
        } else {
            const safeTransactionDataPartial = txs.map((tx: TransactionDocument) => {
                return {
                    to: tx.to,
                    data: tx.data,
                };
            }) as SafeTransactionDataPartial[];
            const safeTx = await this.createTransaction(wallet, safeTransactionDataPartial);
            const nonce = safeTx.data.nonce;
            const signedTx = await this.signTransaction(wallet, safeTx);
            const apiKit = this.getApiKit(wallet);

            try {
                const safeTxHash = await this.getTransactionHash(wallet, safeTx);
                const { defaultAccount } = NetworkService.getProvider(wallet.chainId);
                const senderSignature = signedTx.signatures.get(defaultAccount.toLowerCase());

                logger.debug({
                    safeAddress: toChecksumAddress(wallet.address),
                    safeTxHash: safeTxHash,
                    safeTransactionData: signedTx.data,
                    senderAddress: toChecksumAddress(defaultAccount),
                    senderSignature: senderSignature.data,
                });

                await apiKit.proposeTransaction({
                    safeAddress: toChecksumAddress(wallet.address),
                    safeTxHash,
                    safeTransactionData: signedTx.data,
                    senderAddress: toChecksumAddress(defaultAccount),
                    senderSignature: senderSignature.data,
                });
                logger.debug('Transaction proposed', { safeTxHash });

                await Transaction.updateMany(
                    { _id: txs.map((tx) => tx.id) },
                    { nonce, safeTxHash, state: TransactionState.Confirmed },
                );
                logger.debug('Updated transactions', { safeTxHash, nonce, count: txs.length });
            } catch (error) {
                logger.error('Error proposing transaction', {
                    failReason: error.response ? error.response.data : error.message,
                });
            }
        }
    }

    async createTransaction(wallet: WalletDocument, safeTransactionData: SafeTransactionDataPartial[]) {
        const safe = await this.getSafe(wallet);
        try {
            const safeTx = await safe.createTransaction({
                safeTransactionData: safeTransactionData.map(({ to, data }) => ({
                    to,
                    data,
                    value: '0',
                    operation: 0,
                })),
            });
            logger.debug('Transaction created', { to: safeTx.data.to, nonce: safeTx.data.nonce });
            return safeTx;
        } catch (error) {
            logger.error('Error creating transaction', error.response ? error.response.data : error.message);
        }
    }

    async signTransaction(wallet: WalletDocument, safeTx: SafeTransaction) {
        const safe = await this.getSafe(wallet);
        try {
            const signedTx = await safe.signTransaction(safeTx);
            logger.debug('Transaction Signatures', { count: Array.from(safeTx.signatures).length });
            return signedTx;
        } catch (error) {
            logger.error('Error signing transaction', error.response ? error.response.data : error.message);
        }
    }

    private async confirmTransaction(wallet: WalletDocument, safeTx: SafeTransaction) {
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
            logger.debug('Transaction confirmed', { safeTxHash });
        } catch (error) {
            logger.error('Error confirming transaction', error.response ? error.response.data : error.message);
        }
    }

    async executeTransaction(wallet: WalletDocument, safeTxHash: string) {
        try {
            const pendingTx = await this.getTransaction(wallet, safeTxHash);
            if (!pendingTx) throw new Error('Pending TX not found');

            const { confirmations, confirmationsRequired } = pendingTx;
            if (confirmations && confirmations.length >= confirmationsRequired) {
                const safe = await this.getSafe(wallet);
                const safeTx = await safe.toSafeTransactionType(pendingTx);

                try {
                    const { provider } = NetworkService.getProvider(wallet.chainId);
                    const gasPriceMode = await provider.getGasPrice();
                    const gasPrice = (2 * gasPriceMode.toNumber()).toString();
                    const options = { gasPrice: gasPrice };
                    const response = await safe.executeTransaction(safeTx, options);
                    const receipt = await response.transactionResponse.wait();
                    if (!receipt) throw new Error(`No receipt found for ${safeTxHash}`);
                    if (!receipt.transactionHash) throw new Error(`No transactionHash found for ${safeTxHash}`);

                    await Transaction.updateMany(
                        { safeTxHash },
                        { transactionHash: receipt.transactionHash, state: TransactionState.Sent },
                    );

                    logger.debug('Transaction executed', {
                        safeTxHash,
                        transactionHash: receipt.transactionHash,
                    });

                    return receipt.transactionHash;
                } catch (error) {
                    // Suppress non breaking gas estimation error on Hardhat and start polling for state
                    const [tx] = await Transaction.find({ safeTxHash });
                    if (tx.chainId === ChainId.Hardhat && error.message.includes('GS026')) {
                        await Transaction.updateMany({ safeTxHash }, { state: TransactionState.Sent });
                    }
                    // Try again if one of these error messages
                    else if (
                        !['service temporarily unavailable', 'service temporarily unavailable, retry in 10s'].includes(
                            error.message,
                        )
                    ) {
                        throw error;
                    }
                }
            } else {
                const tx = await Transaction.findOne({ safeTxHash });
                const timeout = 15 * 60 * 1000;
                if (new Date(tx.createdAt).getTime() + timeout > Date.now()) {
                    throw new Error('Transaction failed after 1 hour attempts');
                }

                // Update attempt count
                await Transaction.updateMany({ safeTxHash }, { $inc: { attemptCount: 1 } });
                logger.debug('Require more confirmations', { safeTxHash: pendingTx.safeTxHash });
            }
        } catch (error) {
            const failReason = error.response ? error.response.data : error.message;
            await Transaction.updateMany({ safeTxHash }, { state: TransactionState.Failed, failReason });
            logger.error('Error executing transaction', { failReason: failReason });
        }
    }

    async updateTransactionState(wallet: WalletDocument, safeTxHash: string) {
        const safeTx = await this.getTransaction(wallet, safeTxHash);
        if (!safeTx) return;

        if (safeTx.isExecuted && safeTx.isSuccessful) {
            for (const tx of await Transaction.find({ safeTxHash })) {
                await TransactionService.queryTransactionStatusReceipt(tx);
            }
            logger.debug('Transaction success', { safeTxHash });
        }

        if (safeTx.isExecuted && !safeTx.isSuccessful) {
            await Transaction.updateMany({ safeTxHash }, { state: TransactionState.Failed, failReason: 'Reverted' });
            logger.debug('Transaction failed', { safeTx: safeTxHash });
        }
    }

    async getTransaction(wallet: WalletDocument, safeTxHash: string) {
        const apiKit = this.getApiKit(wallet);
        try {
            const safeTx = await apiKit.getTransaction(safeTxHash);
            logger.debug('Transaction get', { safeTx: safeTxHash });
            return safeTx;
        } catch (error) {
            logger.error('Error transaction get', error.response ? error.response.data : error.message);
        }
    }

    private async getTransactionHash(wallet: WalletDocument, safeTx: any) {
        const safe = await this.getSafe(wallet);
        try {
            const safeTxHash = await safe.getTransactionHash(safeTx);
            logger.debug('Transaction Hash created', { safeTxHash });
            return safeTxHash;
        } catch (error) {
            logger.error('Error creating transaction hash', error.response ? error.response.data : error.message);
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
        logger.debug('Safe init', { safeAddress: wallet.address });
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
