import db from '@thxnetwork/api/util/database';
import { mockStart } from './mock';
import { safeVersion } from '@thxnetwork/api/services/ContractService';
import NetworkService from '@thxnetwork/api/services/NetworkService';
import { ChainId, WalletVariant } from '@thxnetwork/common/enums';
import {
    sub,
    sub2,
    sub3,
    sub4,
    userWalletAddress,
    userWalletAddress2,
    userWalletAddress3,
    userWalletAddress4,
} from './constants';
import { Wallet } from '@thxnetwork/api/models';
import Safe, { SafeFactory } from '@safe-global/protocol-kit';
import { contractNetworks } from '@thxnetwork/api/hardhat';
import { poll } from '../polling';
import { agenda } from '../agenda';

export async function beforeAllCallback(options = { skipWalletCreation: false }) {
    mockStart();

    const { web3, defaultAccount, ethAdapter } = NetworkService.getProvider(ChainId.Hardhat);
    // Wait for this hardhat log:
    const lastDeployedContractAddress = '0x58C0e64cBB7E5C7D0201A3a5c2D899cC70B0dc4c';
    const fn = () => web3.eth.getCode(lastDeployedContractAddress);
    const fnCondition = (result: string) => result === '0x';

    await poll(fn, fnCondition, 500);

    if (!options.skipWalletCreation) {
        const chainId = ChainId.Hardhat;
        const safeFactory = await SafeFactory.create({
            safeVersion,
            ethAdapter,
            contractNetworks,
        });
        for (const entry of [
            { sub, userWalletAddress },
            { sub: sub2, userWalletAddress: userWalletAddress2 },
            { sub: sub3, userWalletAddress: userWalletAddress3 },
        ]) {
            const safeAccountConfig = {
                owners: [defaultAccount, entry.userWalletAddress],
                threshold: 2,
            };
            const safeAddress = await safeFactory.predictSafeAddress(safeAccountConfig);

            await Wallet.create({
                sub: entry.sub,
                safeVersion,
                address: safeAddress,
                chainId,
                variant: WalletVariant.Safe,
            });

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

        // Create wallet for metamask account
        await Wallet.create({
            chainId: ChainId.Hardhat,
            sub: sub4,
            address: userWalletAddress4,
            variant: WalletVariant.WalletConnect,
        });
    }
}

export async function afterAllCallback() {
    await new Promise<void>((resolve) => {
        // Listen for 'complete' event
        agenda.on('complete', () => {
            resolve();
        });
    });
    await agenda.stop();
    await agenda.cancel({});
    await agenda.purge();
    await db.truncate();
}
