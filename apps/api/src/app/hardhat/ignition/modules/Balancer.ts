import { buildModule } from '@nomicfoundation/hardhat-ignition/modules';
import { parseUnits } from 'ethers';

const BalancerModule = buildModule('BalancerModule', (m) => {
    const owner = m.getParameter('owner', m.getAccount(0));
    const totalSupply = m.getParameter('totalSupply', parseUnits('1000000', 'ether').toString());

    const THX = m.contract('THX', [owner, totalSupply]);
    const USDC = m.contract('USDC', [owner, totalSupply]);
    const BAL = m.contract('BAL', [owner, totalSupply]);
    const BPT = m.contract('BPT', [owner, totalSupply]);
    const BPTGauge = m.contract('BPTGauge', [BPT]);
    const BalancerVault = m.contract('BalancerVault', [BPT, USDC, THX]);

    m.call(BPT, 'setVault', [BalancerVault]);
    m.call(BPT, 'transfer', [BalancerVault, parseUnits('500000', 'ether').toString()]);

    return {
        THX,
        USDC,
        BAL,
        BPT,
        BPTGauge,
        BalancerVault,
    };
});

export default BalancerModule;
