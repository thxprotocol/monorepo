import hre from 'hardhat';
import { parseUnits } from 'ethers/lib/utils';
import { contractArtifacts, getArtifact, TContractName } from '..';
import { Signer } from '@ethersproject/abstract-signer';

const deploy = async (contractName: TContractName, args: string[], signer: Signer) => {
    const artifact = getArtifact(contractName);
    const factory = new hre.ethers.ContractFactory(artifact.abi, artifact.bytecode, signer);
    const contract = await factory.deploy(...args);
    console.log(`${contractName} ${contract.address}`);
    return contract;
};

async function main() {
    const [signer] = (await hre.ethers.getSigners()) as unknown as Signer[];
    // Deploy Safe infrastructure
    for (const contractName of [
        'SimulateTxAccessor',
        'GnosisSafeProxyFactory',
        'DefaultCallbackHandler',
        'CreateCall',
        'MultiSend',
        'MultiSendCallOnly',
        'SignMessageLib',
        'GnosisSafeL2',
    ] as TContractName[]) {
        await deploy(contractName, [], signer);
    }
    // Deploy Balancer infrastructure
    const totalSupply = parseUnits('1000000', 'ether').toString();
    const thx = await deploy('THX', [await signer.getAddress(), totalSupply], signer);
    const usdc = await deploy('USDC', [await signer.getAddress(), totalSupply], signer);
    const bal = await deploy('BAL', [await signer.getAddress(), totalSupply], signer);
    const bpt = await deploy('BPT', [await signer.getAddress(), totalSupply], signer);
    const gauge = await deploy('BPTGauge', [bpt.address], signer);
    const vault = await deploy('BalancerVault', [bpt.address, usdc.address, thx.address], signer);

    await bpt.setVault(vault.address);
    await bpt.transfer(vault.address, parseUnits('500000', 'ether').toString());

    // Deploy Balancer Launchpad Implementations
    const VotingEscrow = await deploy('VotingEscrow', [], signer);
    const RewardDistributor = await deploy('RewardDistributor', [], signer);
    const RewardFaucet = await deploy('RewardFaucet', [], signer);

    // Deploy Balancer Launchpad
    const BalMinter = await deploy('BalancerMinter', [bal.address], signer);
    const Launchpad = await deploy(
        'Launchpad',
        [VotingEscrow.address, RewardDistributor.address, RewardFaucet.address, bal.address, BalMinter.address],
        signer,
    );

    /*
    @notice Deploys new VotingEscrow, RewardDistributor and RewardFaucet contracts
    @param tokenBptAddr The address of the token to be used for locking
    @param name The name for the new VotingEscrow contract
    @param symbol The symbol for the new VotingEscrow contract
    @param maxLockTime A constraint for the maximum lock time in the new VotingEscrow contract
    @param rewardDistributorStartTime The start time for reward distribution
    @param admin_unlock_all Admin address to enable unlock-all feature in VotingEscrow (zero-address to disable forever)
    @param admin_early_unlock Admin address to enable eraly-unlock feature in VotingEscrow (zero-address to disable forever)
    @param rewardReceiver The receiver address of claimed BAL-token rewards
    */
    const lp = new hre.ethers.Contract(Launchpad.address, contractArtifacts['Launchpad'].abi, signer);
    let tx = await lp.deploy(
        gauge.address,
        'Voted Escrow 20USDC-80THX-gauge',
        'veTHX',
        7776000, // 90 days
        Math.ceil(Date.now() / 1000) + 60 * 60 * 24 * 7, // 7 days from now
        await signer.getAddress(), // admin_unlock_all
        await signer.getAddress(), // admin_early_unlock
        '0x0000000000000000000000000000000000000000', // empty will set it to the rewardDistributor
    );
    tx = await tx.wait();

    const event = tx.events.find((event: any) => event.event == 'VESystemCreated');
    const { votingEscrow, rewardDistributor, rewardFaucet } = event.args;
    console.log(`VotingEscrow ${votingEscrow}`);
    console.log(`RewardDistributor ${rewardDistributor}`);
    console.log(`RewardFaucet ${rewardFaucet}`);

    // Configure VeTHX
    const vethx = new hre.ethers.Contract(votingEscrow, contractArtifacts['VotingEscrow'].abi, signer);
    const rdthx = new hre.ethers.Contract(rewardDistributor, contractArtifacts['RewardDistributor'].abi, signer);
    const smartCheckerList = await deploy('SmartWalletWhitelist', [await signer.getAddress()], signer);
    const lensReward = await deploy('LensReward', [], signer);

    // Configure reward tokens in reward distributor
    await rdthx.addAllowedRewardTokens([bal.address, bpt.address]);

    // Add smart wallet whitelist checker
    await vethx.commit_smart_wallet_checker(smartCheckerList.address);
    await vethx.apply_smart_wallet_checker();
    await vethx.set_early_unlock(true);
    // await vethx.set_early_unlock_penalty_speed(1); //Default
    // Set early exit penalty treasury to reward distributor
    await vethx.set_penalty_treasury(rewardDistributor);
    // Allow all contract wallets
    await smartCheckerList.setAllowAll(true);

    // Deploy THXRegistry
    const registry = await deploy(
        'THXRegistry',
        [usdc.address, await signer.getAddress(), rdthx.address, gauge.address],
        signer,
    );
    await registry.setPayoutRate('3000'); // 30%

    // Deploy PaymentSplitter
    const splitter = await deploy('THXPaymentSplitter', [await signer.getAddress(), registry.address], signer);
    await splitter.setRegistry(registry.address);

    // Skip 7 days
    await hre.network.provider.send('evm_increaseTime', [60 * 60 * 24 * 7]);
}

main().catch(console.error);
