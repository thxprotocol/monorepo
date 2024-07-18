<template>
    <BaseDropdownMetric
        class="me-4"
        label="Rewards"
        :value="toFiatPrice(rewardsMetric.totalInUSD)"
        :metrics="[
            {
                label: 'BAL',
                url: chainInfo.blockExplorer + '/token/' + address.BAL,
                badge: toFiatPrice(liquidityStore.pricing['BAL']),
                data: [
                    { label: 'Amount', value: rewardsMetric.bal },
                    { label: 'Value', value: toFiatPrice(rewardsMetric.balInUSD) },
                ],
            },
            {
                label: '20USDC-80THX (staked)',
                url: chainInfo.blockExplorer + '/token/' + address.BPTGauge,
                badge: toFiatPrice(liquidityStore.pricing['20USDC-80THX']),
                data: [
                    { label: 'Amount', value: rewardsMetric.bpt },
                    { label: 'Value', value: toFiatPrice(rewardsMetric.bptInUSD) },
                ],
            },
        ]"
    />
</template>

<script lang="ts">
import { mapStores } from 'pinia';
import { defineComponent } from 'vue';
import { useLiquidityStore } from '../../stores/Liquidity';
import { formatUnits, parseUnits } from 'ethers/lib/utils';
import { toFiatPrice } from '@thxnetwork/app/utils/price';
import { BigNumber } from 'ethers/lib/ethers';
import { chainList } from '@thxnetwork/app/utils/chains';
import { useWalletStore } from '@thxnetwork/app/stores/Wallet';
import { ChainId } from '@thxnetwork/common/enums';
import { contractNetworks } from '@thxnetwork/app/config/constants';

export default defineComponent({
    name: 'BaseDropdownMetricAPR',
    data() {
        return {
            toFiatPrice,
        };
    },
    computed: {
        ...mapStores(useLiquidityStore, useWalletStore),
        address() {
            if (!this.walletStore.chainId) return contractNetworks[ChainId.Polygon];
            return contractNetworks[this.walletStore.chainId];
        },
        chainInfo() {
            if (!this.walletStore.wallet) return chainList[ChainId.Polygon];
            return chainList[this.walletStore.chainId];
        },
        rewardsMetric() {
            const { bal, bpt } = this.liquidityStore.rewards;
            const balPriceInWei = parseUnits(this.liquidityStore.pricing['BAL'].toString(), 18);
            const bptPriceInWei = parseUnits(this.liquidityStore.pricing['20USDC-80THX'].toString(), 18);
            const valueBAL = BigNumber.from(bal).mul(balPriceInWei);
            const valueBPT = BigNumber.from(bpt).mul(bptPriceInWei);
            const totalInWei = valueBAL.add(valueBPT);

            return {
                bal: Number(formatUnits(bal, 18)).toFixed(6),
                bpt: Number(formatUnits(bpt, 18)).toFixed(6),
                balInUSD: formatUnits(valueBAL, 18 * 2),
                bptInUSD: formatUnits(valueBPT, 18 * 2),
                totalInUSD: formatUnits(totalInWei, 18 * 2),
            };
        },
    },
});
</script>
