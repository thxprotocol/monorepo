import hre from 'hardhat';
import { parseUnits } from 'ethers/lib/utils';
import { contractNetworks, getArtifact } from '..';

const PRIVATE_KEY = process.env.POLYGON_PRIVATE_KEY || '';
const artifactRewardFaucet = getArtifact('RewardFaucet');
const artifactBPT = getArtifact('BPT');

async function main() {
    const signer = new hre.ethers.Wallet(PRIVATE_KEY, hre.ethers.provider);
    const faucet = new hre.ethers.Contract(contractNetworks['137'].RewardFaucet, artifactRewardFaucet.abi, signer);
    const bpt = new hre.ethers.Contract('0xb204BF10bc3a5435017D3db247f56dA601dFe08A', artifactBPT.abi, signer);
    const bptBalance = (await bpt.balanceOf(signer.address)).toString();
    console.log(bptBalance);

    // const tx = await lensReward.depositEqualWeeks(contractNetworks['137'].BPT, bptBalance, '4');
    const amount = parseUnits('10', 'ether').toString();
    console.log(amount);

    const tx = await faucet.depositEqualWeeksPeriod('0xb204BF10bc3a5435017D3db247f56dA601dFe08A', amount, '4');
    console.log(tx);
}

main().catch(console.error);
