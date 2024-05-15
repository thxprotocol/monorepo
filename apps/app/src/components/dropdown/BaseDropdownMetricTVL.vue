<template>
    <BaseDropdownMetric
        label="TVL"
        :value="toFiatPrice(tvlMetric.tvlInUSD)"
        :metrics="[
            {
                label: 'Liquidity',
                url: chainInfo.blockExplorer + '/token/' + address.BPT,
                badge: '',
                data: [
                    { label: 'Amount', value: tvlMetric.liquidity },
                    { label: 'Value', value: toFiatPrice(tvlMetric.liquidityInUSD) },
                ],
            },
            {
                label: 'Liquidity Staked',
                url: chainInfo.blockExplorer + '/token/' + address.BPTGauge,
                badge: '',
                data: [
                    { label: 'Amount', value: tvlMetric.staked },
                    { label: 'Value', value: toFiatPrice(tvlMetric.stakedInUSD) },
                ],
            },
            {
                label: 'Liquidity Locked',
                url: chainInfo.blockExplorer + '/token/' + address.VotingEscrow,
                badge: '',
                data: [
                    { label: 'Amount', value: tvlMetric.tvl },
                    { label: 'Value', value: toFiatPrice(tvlMetric.tvlInUSD) },
                ],
            },
        ]"
    />
</template>

<script lang="ts">
import { mapStores } from 'pinia';
import { defineComponent } from 'vue';
import { useLiquidityStore } from '../../stores/Liquidity';
import { useWalletStore } from '../../stores/Wallet';
import { formatUnits } from 'ethers/lib/utils';
import { toFiatPrice } from '@thxnetwork/app/utils/price';
import { contractNetworks } from '@thxnetwork/app/config/constants';
import { ChainId } from '@thxnetwork/sdk';
import { chainList } from '@thxnetwork/app/utils/chains';

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
            if (!this.walletStore.wallet) return contractNetworks[ChainId.Polygon];
            return contractNetworks[this.walletStore.wallet.chainId];
        },
        chainInfo() {
            if (!this.walletStore.wallet) return chainList[ChainId.Polygon];
            return chainList[this.walletStore.wallet.chainId];
        },
        tvlMetric() {
            const { tvl: tvlInWei, staked: stakedInWei, liquidity: liquidityInWei } = this.liquidityStore.tvl;
            const tvl = Number(formatUnits(tvlInWei, 18).toString());
            const staked = Number(formatUnits(stakedInWei, 18).toString());
            const liquidity = Number(formatUnits(liquidityInWei, 18).toString());
            const bptPrice = this.liquidityStore.pricing['20USDC-80THX'];

            return {
                liquidity: liquidity.toFixed(6),
                liquidityInUSD: liquidity * bptPrice,
                staked: staked.toFixed(6),
                stakedInUSD: staked * bptPrice,
                tvl: tvl.toFixed(6),
                tvlInUSD: tvl * bptPrice,
            };
        },
    },
});
</script>
