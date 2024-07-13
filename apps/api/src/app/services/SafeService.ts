import { Wallet, WalletDocument, PoolDocument } from '@thxnetwork/api/models';
import { ChainId, WalletVariant } from '@thxnetwork/common/enums';
import { contractNetworks, getArtifact } from '@thxnetwork/api/hardhat';
import { toChecksumAddress } from 'web3-utils';
import { convertObjectIdToNumber } from '../util';
import { ethers } from 'ethers';
import { TransactionReceipt } from 'web3';
import { MetaTransactionData } from '@safe-global/safe-core-sdk-types';
import ContractService, { safeVersion } from '@thxnetwork/api/services/ContractService';
import TransactionService from './TransactionService';
import NetworkService from '@thxnetwork/api/services/NetworkService';
import axios from 'axios';
import Safe from '@safe-global/protocol-kit';
import SafeApiKit from '@safe-global/api-kit';

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

    async deployCallback({ walletId }: { walletId: string }, receipt: TransactionReceipt) {
        const address = toChecksumAddress(receipt.logs[0].address);
        const wallet = await Wallet.findByIdAndUpdate(walletId, { address }, { new: true });
        console.debug(`[${wallet.sub}] Deployed Safe: ${address}`);
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

    // We can only use the protocol-kit for offchain purposes since the
    // Defender Relayer will not be compatible.
    async createTransaction(wallet: WalletDocument, { to, data }: Partial<MetaTransactionData>) {
        const safe = await this.getSafe(wallet);
        const safeTx = await safe.createTransaction({
            transactions: [
                {
                    to,
                    data,
                    value: '0',
                    operation: 0,
                },
            ],
        });
        console.debug('Transaction created:', safeTx);

        return safeTx;
    }

    async proposeTransaction(wallet: WalletDocument, options: MetaTransactionData) {
        const { defaultAccount } = NetworkService.getProvider(wallet.chainId);
        const apiKit = this.getApiKit(wallet);
        const safeTx = await this.createTransaction(wallet, options);
        const safe = await this.getSafe(wallet);
        const safeTxHash = await safe.getTransactionHash(safeTx);
        console.debug('Transaction Hash created:', safeTxHash);

        const senderSignature = await this.signTransaction(wallet, safeTx);

        try {
            const safeAddress = toChecksumAddress(wallet.address);
            console.log({ safeAddress });

            await apiKit.proposeTransaction({
                safeAddress,
                safeTxHash,
                safeTransactionData: safeTx.data,
                senderAddress: toChecksumAddress(defaultAccount),
                senderSignature: senderSignature.data,
            });

            // const { txServiceUrl } = NetworkService.getProvider(wallet.chainId);
            // const { data } = await axios({
            //     baseURL: `${txServiceUrl}/v1/safes/${wallet.address}/multisig-transactions`,
            //     method: 'POST',
            //     data: safeTransaction,
            // });

            console.debug('Transaction proposed:', safeTxHash);

            return safeTxHash;
        } catch (error) {
            console.error('Error proposing transaction:', error.response ? error.response.data : error.message);
            throw error;
        }
    }

    async confirmTransaction(wallet: WalletDocument, safeTxHash: string) {
        const signature = await this.signTransaction(wallet, safeTxHash);
        return await this.confirm(wallet, safeTxHash, signature);
    }

    async confirm(wallet: WalletDocument, safeTxHash: string, signature: string) {
        const { txServiceUrl } = NetworkService.getProvider(wallet.chainId);
        try {
            const { data } = await axios({
                baseURL: `${txServiceUrl}/v1/safes/multisig-transactions/${safeTxHash}/confirmations/`,
                method: 'POST',
                data: { signature },
            });
            console.debug('Transaction confirmed:', data);
            return data;
        } catch (error) {
            console.error('Error confirming transaction:', error.response ? error.response.data : error.message);
            throw error;
        }
    }

    async executeTransaction(wallet: WalletDocument, safeTxHash: string) {
        // execute tx
    }

    async getLastPendingTransactions(wallet: WalletDocument) {
        // pending tx
        return {};
    }

    async signTransaction(wallet: WalletDocument, safeTx) {
        const { signer } = NetworkService.getProvider(wallet.chainId);
        const domain = { verifyingContract: wallet.address };
        const types = {
            SafeTx: [
                { name: 'to', type: 'address' },
                { name: 'value', type: 'uint256' },
                { name: 'data', type: 'bytes' },
                { name: 'operation', type: 'uint8' },
                { name: 'baseGas', type: 'uint256' },
                { name: 'gasPrice', type: 'uint256' },
                { name: 'gasToken', type: 'address' },
                { name: 'refundReceiver', type: 'address' },
                { name: 'nonce', type: 'uint256' },
                { name: 'safeTxGas', type: 'uint256' },
            ],
        };

        try {
            const signature = await signer._signTypedData(domain, types, safeTx.data);
            console.debug('Transaction signed:', signature);
            return signature;
        } catch (error) {
            console.error('Error signing transaction:', error.response ? error.response.data : error.message);
            throw error;
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
            return data;
        } catch (error) {
            console.error('Error transaction get:', error.response ? error.response.data : error.message);
            throw error;
        }
    }

    private async getSafe(wallet: WalletDocument) {
        const { rpc } = NetworkService.getProvider(wallet.chainId);
        return await Safe.init({
            provider: rpc,
            safeAddress: wallet.address,
            contractNetworks,
        });
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
