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
import { poll } from '../polling';
import { agenda } from '../agenda';
import SafeService from '@thxnetwork/api/services/SafeService';

export async function beforeAllCallback(options = { skipWalletCreation: false }) {
    mockStart();

    const { web3 } = NetworkService.getProvider(ChainId.Hardhat);
    // Wait for this hardhat log:
    const lastDeployedContractAddress = '0x58C0e64cBB7E5C7D0201A3a5c2D899cC70B0dc4c';
    const fn = () => web3.eth.getCode(lastDeployedContractAddress);
    const fnCondition = (result: string) => result === '0x';
    await poll(fn, fnCondition, 500);

    if (!options.skipWalletCreation) {
        const chainId = ChainId.Hardhat;

        for (const entry of [
            { sub, userWalletAddress },
            { sub: sub2, userWalletAddress: userWalletAddress2 },
            { sub: sub3, userWalletAddress: userWalletAddress3 },
        ]) {
            await SafeService.create({ sub: entry.sub, chainId, safeVersion }, entry.userWalletAddress);
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
