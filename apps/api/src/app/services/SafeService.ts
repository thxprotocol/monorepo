import { Wallet, WalletDocument, Pool, PoolDocument, Transaction } from '@thxnetwork/api/models';
import { ChainId, WalletVariant } from '@thxnetwork/common/enums';
import { contractNetworks } from '@thxnetwork/api/hardhat';
import { safeVersion } from '@thxnetwork/api/services/ContractService';
import { toChecksumAddress } from 'web3-utils';
import Safe, { SafeAccountConfig, SafeFactory } from '@safe-global/protocol-kit';
import SafeApiKit from '@safe-global/api-kit';
import {
    SafeMultisigTransactionResponse,
    SafeTransactionDataPartial,
    SafeVersion,
} from '@safe-global/safe-core-sdk-types';
import { logger } from '@thxnetwork/api/util/logger';
import { agenda, JobType } from '@thxnetwork/api/util/agenda';
import { Job } from '@hokify/agenda';
import { convertObjectIdToNumber } from '../util';
import TransactionService from './TransactionService';
import NetworkService from '@thxnetwork/api/services/NetworkService';

function getSafeApiKit(chainId: ChainId) {
    const { txServiceUrl, ethAdapter } = NetworkService.getProvider(chainId);
    return new SafeApiKit({ txServiceUrl, ethAdapter });
}

function reset(wallet: WalletDocument, userWalletAddress: string) {
    const { defaultAccount } = NetworkService.getProvider(wallet.chainId);
    return deploy(wallet, [toChecksumAddress(defaultAccount), toChecksumAddress(userWalletAddress)]);
}

async function create(
    data: { sub: string; chainId: ChainId; safeVersion?: SafeVersion; address?: string; poolId?: string },
    userWalletAddress?: string,
) {
    const { safeVersion, sub, address, poolId } = data;
    const { defaultAccount } = NetworkService.getProvider(data.chainId);
    const wallet = await Wallet.create({
        variant: WalletVariant.Safe,
        chainId: data.chainId,
        sub,
        address,
        safeVersion,
        poolId,
    });

    // Concerns a Metamask account so we do not deploy and return early
    if (!safeVersion && address) return wallet;

    // Add relayer address and consider this a campaign safe
    const owners = [toChecksumAddress(defaultAccount)];
    // Add user address as a signer and consider this a participant safe
    if (userWalletAddress) owners.push(toChecksumAddress(userWalletAddress));

    // If campaign safe we provide a nonce based on the timestamp in the MongoID of the pool (poolId value)
    const nonce = wallet.poolId && String(convertObjectIdToNumber(wallet.poolId));

    return await deploy(wallet, owners, nonce);
}

async function deploy(wallet: WalletDocument, owners: string[], nonce?: string) {
    const { ethAdapter } = NetworkService.getProvider(wallet.chainId);
    const safeFactory = await SafeFactory.create({
        safeVersion: wallet.safeVersion as SafeVersion,
        ethAdapter,
        contractNetworks,
    });
    const safeAccountConfig: SafeAccountConfig = {
        owners,
        threshold: owners.length,
    };
    const safeAddress = toChecksumAddress(await safeFactory.predictSafeAddress(safeAccountConfig, nonce));

    try {
        await Safe.create({
            ethAdapter,
            safeAddress,
            contractNetworks,
        });
    } catch (error) {
        await agenda.now(JobType.DeploySafe, {
            safeAccountConfig,
            safeVersion: wallet.safeVersion,
            safeAddress,
            safeWalletId: String(wallet._id),
        });
    }

    return await Wallet.findByIdAndUpdate(wallet._id, { address: safeAddress }, { new: true });
}

async function createJob(job: Job) {
    const { safeAccountConfig, safeVersion, safeAddress, safeWalletId } = job.attrs.data as any;
    if (!safeAccountConfig || !safeVersion || !safeAddress || !safeWalletId) return;

    const wallet = await Wallet.findById(safeWalletId);
    const { ethAdapter } = NetworkService.getProvider(wallet.chainId);
    const safeFactory = await SafeFactory.create({
        safeVersion,
        ethAdapter,
        contractNetworks,
    });

    // If campaign safe we provide a nonce based on the timestamp in the MongoID the pool (poolId value)
    const nonce = wallet.poolId && String(convertObjectIdToNumber(wallet.poolId));
    const config = { safeAccountConfig, options: { gasLimit: '3000000' } };
    if (nonce) config['saltNonce'] = nonce;

    await safeFactory.deploySafe(config);
    logger.debug(`[${wallet.sub}] Deployed Safe: ${safeAddress}`);

    // Set safeAddress for campaign to keep address available for potential regression
    if (wallet.poolId) {
        await Pool.findByIdAndUpdate(wallet.poolId, { safeAddress: toChecksumAddress(safeAddress) });
    }
}

function findById(id: string) {
    return Wallet.findById(id);
}

function findOne(query) {
    return Wallet.findOne({ ...query, variant: WalletVariant.Safe, poolId: { $exists: false } });
}

function findOneByAddress(address: string) {
    return Wallet.findOne({ address: toChecksumAddress(address) });
}

async function findOneByPool(pool: PoolDocument, chainId: ChainId) {
    if (!pool) return;
    return await Wallet.findOne({
        poolId: pool.id,
        chainId,
        sub: pool.sub,
        safeVersion,
    });
}

async function getOwners(wallet: WalletDocument) {
    const { ethAdapter } = NetworkService.getProvider(wallet.chainId);
    const safeSdk = await Safe.create({
        ethAdapter,
        safeAddress: wallet.address,
        contractNetworks,
    });

    return await safeSdk.getOwners();
}

async function createSwapOwnerTransaction(wallet: WalletDocument, oldOwnerAddress: string, newOwnerAddress: string) {
    const { ethAdapter } = NetworkService.getProvider(wallet.chainId);
    const safeSdk = await Safe.create({
        ethAdapter,
        safeAddress: wallet.address,
        contractNetworks,
    });

    return await safeSdk.createSwapOwnerTx({ oldOwnerAddress, newOwnerAddress });
}

async function proposeTransaction(wallet: WalletDocument, safeTransactionData: SafeTransactionDataPartial) {
    const { ethAdapter, signer } = NetworkService.getProvider(wallet.chainId);
    const safe = await Safe.create({
        ethAdapter,
        safeAddress: wallet.address,
        contractNetworks,
    });

    // Get nonce for this Safes transaction
    const nonce = await safe.getNonce();
    const safeTransaction = await safe.createTransaction({
        safeTransactionData,
        options: { nonce: nonce + 1 },
    });

    // Create hash for this transaction
    const safeTxHash = await safe.getTransactionHash(safeTransaction);
    const signature = await safe.signTransactionHash(safeTxHash);
    const apiKit = getSafeApiKit(wallet.chainId);

    logger.info({ safeTxHash, nonce });

    try {
        await apiKit.proposeTransaction({
            safeAddress: wallet.address,
            safeTxHash,
            safeTransactionData: safeTransaction.data as any,
            senderAddress: toChecksumAddress(await signer.getAddress()),
            senderSignature: signature.data,
        });

        logger.info(`Safe TX Proposed: ${safeTxHash}`);
        return safeTxHash;
    } catch (error) {
        logger.error(error);
    }
}

async function confirmTransaction(wallet: WalletDocument, safeTxHash: string) {
    const { ethAdapter } = NetworkService.getProvider(wallet.chainId);
    const safe = await Safe.create({
        ethAdapter,
        safeAddress: wallet.address,
        contractNetworks,
    });
    const signature = await safe.signTransactionHash(safeTxHash);
    return await confirm(wallet, safeTxHash, signature.data);
}

async function confirm(wallet: WalletDocument, safeTxHash: string, signatureData: string) {
    const { txServiceUrl, ethAdapter } = NetworkService.getProvider(wallet.chainId);
    const apiKit = new SafeApiKit({ ethAdapter, txServiceUrl });
    return await apiKit.confirmTransaction(safeTxHash, signatureData);
}

async function executeTransaction(wallet: WalletDocument, safeTxHash: string) {
    const { ethAdapter } = NetworkService.getProvider(wallet.chainId);
    const apiKit = getSafeApiKit(wallet.chainId);
    const safe = await Safe.create({
        ethAdapter,
        safeAddress: wallet.address,
        contractNetworks,
    });
    const safeTransaction = await apiKit.getTransaction(safeTxHash);
    const executeTxResponse = await safe.executeTransaction(safeTransaction as any);
    const receipt = await executeTxResponse.transactionResponse?.wait();
    const tx = await Transaction.findOne({ safeTxHash });

    await TransactionService.executeCallback(tx, receipt as any);

    return receipt;
}

async function getLastPendingTransactions(wallet: WalletDocument) {
    const apiKit = getSafeApiKit(wallet.chainId);
    const { results }: any = await apiKit.getPendingTransactions(wallet.address);

    return results as unknown as SafeMultisigTransactionResponse[];
}

async function getTransaction(wallet: WalletDocument, safeTxHash: string): Promise<SafeMultisigTransactionResponse> {
    const apiKit = getSafeApiKit(wallet.chainId);
    return (await apiKit.getTransaction(safeTxHash)) as unknown as SafeMultisigTransactionResponse;
}

export default {
    reset,
    findById,
    createSwapOwnerTransaction,
    proposeTransaction,
    confirmTransaction,
    confirm,
    getLastPendingTransactions,
    getOwners,
    create,
    createJob,
    findOneByAddress,
    findOne,
    getTransaction,
    executeTransaction,
    findOneByPool,
};
