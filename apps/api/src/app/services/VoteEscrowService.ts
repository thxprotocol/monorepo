import { contractArtifacts, contractNetworks } from '@thxnetwork/api/hardhat';
import { ChainId } from '@thxnetwork/common/enums';
import { WalletDocument } from '@thxnetwork/api/models';
import { toChecksumAddress } from 'web3-utils';
import TransactionService from '@thxnetwork/api/services/TransactionService';
import NetworkService from '@thxnetwork/api/services/NetworkService';
import { NODE_ENV } from '../config/secrets';

async function isApprovedAddress(address: string, chainId: ChainId) {
    const { web3 } = NetworkService.getProvider(chainId);
    const whitelist = new web3.eth.Contract(
        contractArtifacts['SmartWalletWhitelist'].abi,
        contractNetworks[chainId].SmartWalletWhitelist,
    );
    return await whitelist.methods.check(address).call();
}

async function list(wallet: WalletDocument, chainId: ChainId) {
    const { web3 } = NetworkService.getProvider(chainId);
    const ve = new web3.eth.Contract(contractArtifacts['VotingEscrow'].abi, contractNetworks[chainId].VotingEscrow);
    return await ve.methods.locked(wallet.address).call();
}

async function getAllowance(wallet: WalletDocument, tokenAddress: string, spender: string) {
    const { web3 } = NetworkService.getProvider(wallet.chainId);
    const bpt = new web3.eth.Contract(contractArtifacts['BPT'].abi, tokenAddress);
    return await bpt.methods.allowance(wallet.address, spender).call();
}

async function approve(wallet: WalletDocument, tokenAddress: string, spender: string, amount: string) {
    const { web3 } = NetworkService.getProvider(wallet.chainId);
    const bpt = new web3.eth.Contract(contractArtifacts['BPT'].abi, tokenAddress);
    const fn = bpt.methods.approve(spender, amount);

    // Propose tx data to relayer and return safeTxHash to client to sign
    return await TransactionService.sendSafeAsync(wallet, bpt.options.address, fn);
}

async function increaseAmount(wallet: WalletDocument, amountInWei: string) {
    const { web3 } = NetworkService.getProvider(wallet.chainId);
    const ve = new web3.eth.Contract(
        contractArtifacts['VotingEscrow'].abi,
        contractNetworks[wallet.chainId].VotingEscrow,
    );
    const fn = ve.methods.increase_amount(amountInWei);
    return TransactionService.sendSafeAsync(wallet, contractNetworks[wallet.chainId].VotingEscrow, fn);
}

async function increaseUnlockTime(wallet: WalletDocument, endTimestamp: number) {
    const { web3 } = NetworkService.getProvider(wallet.chainId);
    const ve = new web3.eth.Contract(
        contractArtifacts['VotingEscrow'].abi,
        contractNetworks[wallet.chainId].VotingEscrow,
    );
    const fn = ve.methods.increase_unlock_time(endTimestamp);
    return TransactionService.sendSafeAsync(wallet, contractNetworks[wallet.chainId].VotingEscrow, fn);
}

async function deposit(wallet: WalletDocument, amountInWei: string, endTimestamp: number) {
    const { web3 } = NetworkService.getProvider(wallet.chainId);
    const ve = new web3.eth.Contract(
        contractArtifacts['VotingEscrow'].abi,
        contractNetworks[wallet.chainId].VotingEscrow,
    );
    const fn = ve.methods.create_lock(amountInWei, endTimestamp);
    return TransactionService.sendSafeAsync(wallet, contractNetworks[wallet.chainId].VotingEscrow, fn);
}

async function withdraw(wallet: WalletDocument, isEarlyWithdraw: boolean) {
    const { web3 } = NetworkService.getProvider(wallet.chainId);
    const ve = new web3.eth.Contract(
        contractArtifacts['VotingEscrow'].abi,
        contractNetworks[wallet.chainId].VotingEscrow,
    );

    // Check for lock and determine ve function to call
    const fn = isEarlyWithdraw ? ve.methods.withdraw_early() : ve.methods.withdraw();

    // Propose tx data to relayer and return safeTxHash to client to sign
    const tx = await TransactionService.sendSafeAsync(wallet, ve.options.address, fn);

    return [tx];
}

async function listRewards(wallet: WalletDocument, chainId: ChainId) {
    const { web3 } = NetworkService.getProvider(chainId);

    // Get reward tokens
    const lr = new web3.eth.Contract(contractArtifacts['LensReward'].abi, contractNetworks[chainId].LensReward);

    // Call static
    const rewardTokens = [contractNetworks[chainId].BAL, contractNetworks[chainId].BPT];
    const callStatic = async (fn) => {
        const result = await web3.eth.call({
            to: contractNetworks[chainId].LensReward,
            data: fn.encodeABI(),
            from: toChecksumAddress(wallet.address),
        });
        return web3.eth.abi.decodeParameters(
            [
                {
                    type: 'tuple[]',
                    components: [
                        { type: 'address', name: 'tokenAddress' },
                        { type: 'uint256', name: 'amount' },
                    ],
                },
            ],
            result,
        );
    };

    // Call static on rewards
    const rewards = await callStatic(
        lr.methods.getUserClaimableRewardsAll(
            contractNetworks[chainId].RewardDistributor,
            toChecksumAddress(wallet.address),
            rewardTokens,
        ),
    );

    // Util functions to get amount for tokenAddress from call
    const getAmount = (tokenAddress: string) => {
        return rewards['0'].find((r) => r.tokenAddress === tokenAddress)?.amount;
    };
    const { BAL, BPT } = contractNetworks[chainId];

    return [
        {
            tokenAddress: BAL,
            amount: getAmount(BAL),
            symbol: 'BAL',
        },
        {
            tokenAddress: BPT,
            amount: getAmount(BPT),
            symbol: '20USDC-80THX',
        },
    ];
}

async function claimTokens(wallet: WalletDocument) {
    const { web3 } = NetworkService.getProvider(wallet.chainId);
    const rewardDistributor = new web3.eth.Contract(
        contractArtifacts['RewardDistributor'].abi,
        contractNetworks[wallet.chainId].RewardDistributor,
    );

    // List reward tokens and build function call
    const rewardTokens = await rewardDistributor.methods.getAllowedRewardTokens().call();
    const fn = rewardDistributor.methods.claimTokens(wallet.address, rewardTokens);

    // Propose tx data to relayer and return safeTxHash to client to sign
    const tx = await TransactionService.sendSafeAsync(wallet, rewardDistributor.options.address, fn);

    return [tx];
}

async function claimExternalRewardsJob() {
    try {
        const chainId = NODE_ENV === 'production' ? ChainId.Polygon : ChainId.Hardhat;
        const { web3 } = NetworkService.getProvider(chainId);
        const ve = new web3.eth.Contract(contractArtifacts['VotingEscrow'].abi, contractNetworks[chainId].VotingEscrow);

        // Execute directly using the relayer
        const receipt = await TransactionService.send(ve.options.address, ve.methods.claimExternalRewards(), chainId);
        console.info(`ClaimExternalRewards: ${receipt.transactionHash}`);
    } catch (error) {
        console.error(`Error ClaimExternalRewards: ${error && error.message}`);
    }
}

export default {
    claimExternalRewardsJob,
    list,
    isApprovedAddress,
    approve,
    getAllowance,
    deposit,
    withdraw,
    listRewards,
    claimTokens,
    increaseAmount,
    increaseUnlockTime,
};
