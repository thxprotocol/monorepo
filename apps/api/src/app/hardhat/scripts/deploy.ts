import hre from 'hardhat';
import SafeModule from '../ignition/modules/Safe';
import BalancerModule from '../ignition/modules/Balancer';
import { EventLog, Signer, TransactionReceipt, TransactionResponse } from 'ethers';
import { contractArtifacts } from '..';

const deploy = async (contractName: string, args: string[], signer: Signer) => {
    const artifact = contractArtifacts[contractName];
    if (!artifact) throw new Error(`Could not find artifact for ${contractName}`);
    const factory = new hre.ethers.ContractFactory(artifact.abi, artifact.bytecode, signer);
    const tx = await factory.deploy(...args);
    console.log(`${contractName} ${await tx.getAddress()}`);
    return new hre.ethers.Contract(await tx.getAddress(), contractArtifacts[contractName].abi, signer);
};

async function main() {
    const [signer] = await hre.ethers.getSigners();
    const {
        SimulateTxAccessor,
        GnosisSafeProxyFactory,
        DefaultCallbackHandler,
        CompatibilityFallbackHandler,
        CreateCall,
        MultiSend,
        MultiSendCallOnly,
        SignMessageLib,
        GnosisSafeL2,
    } = await hre.ignition.deploy(SafeModule);
    console.log({
        SimulateTxAccessor: await SimulateTxAccessor.getAddress(),
        GnosisSafeProxyFactory: await GnosisSafeProxyFactory.getAddress(),
        DefaultCallbackHandler: await DefaultCallbackHandler.getAddress(),
        CompatibilityFallbackHandler: await CompatibilityFallbackHandler.getAddress(),
        CreateCall: await CreateCall.getAddress(),
        MultiSend: await MultiSend.getAddress(),
        MultiSendCallOnly: await MultiSendCallOnly.getAddress(),
        SignMessageLib: await SignMessageLib.getAddress(),
        GnosisSafeL2: await GnosisSafeL2.getAddress(),
    });

    const { THX, USDC, BAL, BPT, BPTGauge, BalancerVault } = await hre.ignition.deploy(BalancerModule);
    console.log({
        THX: await THX.getAddress(),
        USDC: await USDC.getAddress(),
        BAL: await BAL.getAddress(),
        BPT: await BPT.getAddress(),
        BPTGauge: await BPTGauge.getAddress(),
        BalancerVault: await BalancerVault.getAddress(),
    });
    // // Mock VE Launchpad
    const VotingEscrow = await deploy('VotingEscrow', [], signer);
    const RewardDistributor = await deploy('RewardDistributor', [], signer);
    const RewardFaucet = await deploy('RewardFaucet', [], signer);
    const BalMinter = await deploy('BalMinter', [await BAL.getAddress()], signer);
    const Launchpad = await deploy(
        'Launchpad',
        [
            await VotingEscrow.getAddress(),
            await RewardDistributor.getAddress(),
            await RewardFaucet.getAddress(),
            await BAL.getAddress(),
            await BalMinter.getAddress(),
        ],
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
    const lp = new hre.ethers.Contract(await Launchpad.getAddress(), contractArtifacts['Launchpad'].abi, signer);
    const tx: TransactionResponse = await lp.deploy(
        await BPTGauge.getAddress(),
        'Voted Escrow 20USDC-80THX-gauge',
        'veTHX',
        7776000, // 90 days
        Math.ceil(Date.now() / 1000) + 60 * 60 * 24 * 7, // 7 days from now
        await signer.getAddress(), // admin_unlock_all
        await signer.getAddress(), // admin_early_unlock
        '0x0000000000000000000000000000000000000000', // empty will set it to the rewardDistributor
    );
    const receipt: TransactionReceipt | null = await tx.wait();
    if (!receipt) throw new Error('Failed to deploy $veTHX');
    const event = receipt.logs.find((event: any) => event.fragment.name == 'VESystemCreated') as EventLog;
    const [_, votingEscrow, rewardDistributor, rewardFaucet] = event.args;
    console.log(`deploying "VotingEscrow" (tx: ${tx.hash})...: deployed at ${votingEscrow}`);
    console.log(`deploying "RewardDistributor" (tx: ${tx.hash})...: deployed at ${rewardDistributor}`);
    console.log(`deploying "RewardFaucet" (tx: ${tx.hash})...: deployed at ${rewardFaucet}`);

    // Configure VeTHX
    const vethx = new hre.ethers.Contract(votingEscrow, contractArtifacts['VotingEscrow'].abi, signer);
    const rdthx = new hre.ethers.Contract(rewardDistributor, contractArtifacts['RewardDistributor'].abi, signer);
    const smartCheckerList = await deploy('SmartWalletWhitelist', [await signer.getAddress()], signer);

    await deploy('LensReward', [], signer);

    // Configure reward tokens in reward distributor
    await rdthx.addAllowedRewardTokens([await BAL.getAddress(), await BPT.getAddress()]);

    // Add smart wallet whitelist checker
    await vethx.commit_smart_wallet_checker(await smartCheckerList.getAddress());
    console.log('veTHX:', 'commit_smart_wallet_checker', await smartCheckerList.getAddress());

    await vethx.apply_smart_wallet_checker();
    console.log('veTHX:', 'apply_smart_wallet_checker', true);

    await vethx.set_early_unlock(true);
    console.log('veTHX:', 'set_early_unlock', true);
    // await vethx.set_early_unlock_penalty_speed(1); //Default

    // Set early exit penalty treasury to reward distributor
    await vethx.set_penalty_treasury(rewardDistributor);
    console.log('veTHX:', 'set_penalty_treasury', rewardDistributor);

    // Allow all contract wallets
    await smartCheckerList.setAllowAll(true);

    // Deploy THXRegistry
    const registry = await deploy(
        'THXRegistry',
        [await USDC.getAddress(), await signer.getAddress(), await rdthx.getAddress(), await BPTGauge.getAddress()],
        signer,
    );
    await registry.setPayoutRate('3000'); // 30%

    // Deploy PaymentSplitter
    const splitter = await deploy(
        'THXPaymentSplitter',
        [await signer.getAddress(), await registry.getAddress()],
        signer,
    );
    await splitter.setRegistry(await registry.getAddress());
}

main().catch(console.error);
