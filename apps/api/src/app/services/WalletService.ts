import { Transaction } from '@thxnetwork/api/models/Transaction';
import { Wallet } from '@thxnetwork/api/models/Wallet';
import { TransactionState, WalletVariant } from '@thxnetwork/common/enums';
import { toChecksumAddress } from 'web3-utils';
import { safeVersion } from './ContractService';
import NetworkService from './NetworkService';
import SafeService from './SafeService';

export default class WalletService {
    static findById(id: string) {
        return Wallet.findById(id);
    }

    static async list(account: TAccount): Promise<TWallet[]> {
        // List all wallets owned by the account but filter out wallets used for the campaign
        // these wallets have an owners array with length 1
        const wallets = await Wallet.find({
            sub: account.sub,
            variant: { $in: [WalletVariant.Safe, WalletVariant.WalletConnect] },
            address: { $exists: true, $ne: null },
            $or: [{ owners: { $size: 2 } }, { owners: { $exists: false } }, { owners: { $size: 0 } }],
        });

        return await Promise.all(
            wallets.map(async (wallet) => {
                const pendingTransactions = await Transaction.find({
                    walletId: wallet.id,
                    state: TransactionState.Confirmed,
                });
                const short = wallet.address && WalletService.formatAddress(wallet.address);

                return { ...wallet.toJSON(), short, pendingTransactions };
            }),
        );
    }

    static findOne(query: Partial<TWallet>) {
        return Wallet.findOne(query);
    }

    static formatAddress(address: string) {
        return `${address.slice(0, 5)}...${address.slice(-3)}`;
    }

    static create(variant: WalletVariant, data: Partial<TWallet>) {
        const map = {
            [WalletVariant.Safe]: WalletService.createSafe,
            [WalletVariant.WalletConnect]: WalletService.createWalletConnect,
        };
        return map[variant](data);
    }

    static async createSafe({ sub, chainId, address }: Partial<TWallet>) {
        // An account can have max 1 Safe per network
        const safeWallet = await SafeService.findOne({
            sub,
            chainId,
        });
        if (safeWallet) throw new Error('Already has a Safe.');

        // Deploy a Safe with Web3Auth address and relayer as signers
        const { defaultAccount } = NetworkService.getProvider(chainId);
        const owners = [toChecksumAddress(defaultAccount), toChecksumAddress(address)];

        await SafeService.create({ sub, chainId, safeVersion, owners });
    }

    static async createWalletConnect({ sub, address }: Partial<TWallet>) {
        await Wallet.findOneAndUpdate(
            { sub, address },
            { variant: WalletVariant.WalletConnect, sub, address },
            { upsert: true },
        );
    }
}
