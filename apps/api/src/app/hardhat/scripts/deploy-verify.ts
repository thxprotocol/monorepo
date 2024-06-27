import hre from 'hardhat';

async function main() {
    const BOND_ADDRESS = '0xBONDADDRESS';
    const BondPurchaseCheckerFactory = await hre.ethers.getContractFactory('BondPurchaseCheckerFactory');
    const factory = await BondPurchaseCheckerFactory.deploy();
    const tx = await factory.deploy(BOND_ADDRESS);
    const receipt: any = await tx.wait();
    const newContractAddress = receipt.events[0].args[0];
    console.log('New BondPurchaseChecker deployed to:', newContractAddress);

    await hre.run('verify:verify', {
        address: newContractAddress,
        constructorArguments: [BOND_ADDRESS],
    });
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
