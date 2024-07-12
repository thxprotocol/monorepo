import { Wallet, WalletDocument, PoolDocument, Transaction } from '@thxnetwork/api/models';
import { ChainId, WalletVariant } from '@thxnetwork/common/enums';
import { contractNetworks, getArtifact } from '@thxnetwork/api/hardhat';
import { toChecksumAddress } from 'web3-utils';
import ContractService, { safeVersion } from '@thxnetwork/api/services/ContractService';
import { logger } from '@thxnetwork/api/util/logger';
import { convertObjectIdToNumber } from '../util';
import { RELAYER_SPEED } from '../config/secrets';
import { Contract, ethers } from 'ethers';
import TransactionService from './TransactionService';
import NetworkService from '@thxnetwork/api/services/NetworkService';
import axios from 'axios';

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
        const tx = await this.deploy(wallet, owners, saltNonce);
        // Poll for tx state
        return wallet;
        // logger.debug(`[${wallet.sub}] Deployed Safe: ${safeAddress}`);

        // return await Wallet.findByIdAndUpdate(wallet.id, { address: safeAddress }, { new: true });
    }

    async deploy(wallet: WalletDocument, owners: string[], saltNonce?: string) {
        const { safeProxyFactoryAddress, safeMasterCopyAddress, fallbackHandlerAddress } =
            contractNetworks[wallet.chainId];

        // Encode the function call
        const threshold = owners.length;
        const to = ethers.constants.AddressZero;
        const initData = '0x';
        const fallbackHandler = fallbackHandlerAddress;
        const paymentToken = ethers.constants.AddressZero;
        const payment = 0;
        const paymentReceiver = ethers.constants.AddressZero;

        const singleton = ContractService.getContract('GnosisSafeL2', wallet.chainId, safeMasterCopyAddress);
        const initializer = singleton.interface.encodeFunctionData('setup', [
            owners,
            threshold,
            to,
            initData,
            fallbackHandler,
            paymentToken,
            payment,
            paymentReceiver,
        ]);

        // TransactionService expects web3 methods in order to estimate gas
        const { web3 } = NetworkService.getProvider(wallet.chainId);
        const contract = new web3.eth.Contract(getArtifact('GnosisSafeProxyFactory').abi, safeProxyFactoryAddress);

        await TransactionService.sendAsync(
            safeProxyFactoryAddress,
            contract.methods.createProxyWithNonce(safeMasterCopyAddress, initializer, saltNonce),
            wallet.chainId,
            false,
            {
                type: 'SafeDeployCallback',
                args: { walletId: wallet.id },
            },
        );
    }

    async deployCallback(args: { walletId: string }, receipt) {
        await Wallet.findByIdAndUpdate(args.walletId, {
            address: receipt.logs[0].address,
        });
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

    async proposeTransaction(wallet: WalletDocument, data) {
        // propose txgs
    }

    async confirmTransaction(wallet: WalletDocument, safeTxHash: string, signature: string) {
        // confirm tx
    }

    async executeTransaction(wallet: WalletDocument, safeTxHash: string) {
        // execute tx
    }

    async getLastPendingTransactions(wallet: WalletDocument) {
        // pending tx
        return {};
    }

    async signHash(wallet: WalletDocument, safeTxHash: string) {
        // pending tx
        return {};
    }

    async getSafe(wallet: WalletDocument) {
        const { txServiceUrl } = NetworkService.getProvider(wallet.chainId);
        const url = `${txServiceUrl}/v1/safes/${wallet.address}`;
        const { data } = await axios({ url, method: 'GET' });
        return data;
    }

    async getTransaction(wallet: WalletDocument, safeTxHash: string) {
        const { txServiceUrl } = NetworkService.getProvider(wallet.chainId);
        const url = `${txServiceUrl}/v1/safes/${wallet.address}/transactions/${safeTxHash}`;
        const { data } = await axios({ url, method: 'GET' });
        return data;
    }

    // private async confirmTransactionLinea(
    //     wallet: WalletDocument,
    //     safeTxHash: string,
    //     data: { signedSafeTxHash: string },
    // ) {
    //     const { txServiceUrl } = NetworkService.getProvider(wallet.chainId);
    //     const url = `${txServiceUrl}/v1/chains/${wallet.chainId}/transactions/${safeTxHash}/confirmations`;

    //     await axios({
    //         url,
    //         method: 'POST',
    //         data,
    //     });
    // }

    // private async proposeTransactionLinea(
    //     wallet: WalletDocument,
    //     { safeTxHash, safeTransactionData, senderAddress: sender, senderSignature: signature },
    // ) {
    //     const { txServiceUrl } = NetworkService.getProvider(wallet.chainId);
    //     const url = `${txServiceUrl}/v1/chains/${wallet.chainId}/transactions/${wallet.address}/propose`;

    //     await axios({
    //         url,
    //         method: 'POST',
    //         data: {
    //             ...safeTransactionData,
    //             safeTxHash,
    //             nonce: String(safeTransactionData.nonce),
    //             sender,
    //             signature,
    //         },
    //     });
    // }
}

export default new SafeService();
