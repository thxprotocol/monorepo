import hre, { ethers } from 'hardhat';

/**
 * Run the deployment script
 * @dev npx hardhat run --network arbitrum scripts/deploy-verify.ts
 */
async function main() {
    const BondPurchaseCheckerFactory = await ethers.getContractFactory('BondPurchaseCheckerFactory');
    const factory = await BondPurchaseCheckerFactory.deploy();
    await factory.deployed();
    console.log('BondPurchaseCheckerFactory deployed:', factory.address);
    try {
        await hre.run('verify:verify', {
            address: factory.address,
            constructorArguments: [],
        });
        console.log('BondPurchaseCheckerFactory verification success!');
    } catch (error) {
        console.error('BondPurchaseCheckerFactory failed', error);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
